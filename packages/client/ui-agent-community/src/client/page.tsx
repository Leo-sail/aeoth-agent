import { useEffect, useMemo, useState } from 'react'
import {
  Button, IconCompactOutlineRegular, IconDatabaseOutlineRegular, IconDownloadOutlineRegular, IconGoalOutlineRegular,
  IconInspectOutlineRegular, IconListPenOutlineRegular, IconPaperclipOutlineRegular, IconPaperPlaneOutlineRegular,
  IconPlusOutlineRegular, IconRefreshOutlineMedium, IconShieldOutlineRegular, IconSkillOutlineRegular, IconStopFillMedium,
  IconTrashOutlineRegular, Input, Modal,
} from '@deepseek-ai/dsh-client-ui-primitives'
import type { ModelCatalog } from '@deepseek-ai/dsh-api-session-controller/types'
import type { BotCommunitySnapshot, BotId, BotIdentity, BotMessage, BotMessageUsage, BotRoom, BotRun } from '@deepseek-ai/dsh-agent-community/types'
import { CommunityMessage, type ChatViewSlotProps, type TurnTokenUsage } from '@deepseek-ai/dsh-client-ui-chat/client'
import { CommunityComposer } from './CommunityComposer.tsx'
import type { BotCommunityProps } from './index.ts'
import css from './page.module.css'

type RemoteAction = () => Promise<{ ok: boolean; error?: { message: string }; value?: unknown }>
type NativeTranslate = ChatViewSlotProps['t']

const AVATAR_EMOJIS = ['🤖', '🧠', '🦊', '🐙', '🐼', '🐸', '🚀', '🌟', '🎯', '🛠️', '🧭', '🔥', '🌈', '🪐', '🦉', '🐳'] as const
const ROUTE_SEPARATOR = '\u0000'

/** 模型下拉项的 value：`provider\0model`。 */
function routeKey(provider: string, model: string): string { return `${provider}${ROUTE_SEPARATOR}${model}` }
function parseRouteKey(key: string): { provider: string; model: string } | undefined {
  const index = key.indexOf(ROUTE_SEPARATOR)
  if (index <= 0 || index === key.length - 1) return undefined
  return { provider: key.slice(0, index), model: key.slice(index + 1) }
}
/** 与原生模型选择器一致：账号/官方路由优先，其余保持目录顺序。 */
function providerRank(id: string): number { return id === 'deepseek-account' ? 0 : id === 'deepseek-official' ? 1 : 2 }

/**
 * Agent 与协作团队共用的主面板：`props.mode` 决定只显示 Agent 直聊还是只显示群聊，
 * 两种模式下的数据域、表单和输入框建议互不混入。
 */
export function BotCommunityPage(props: BotCommunityProps) {
  const isAgentMode = props.mode === 'agents'
  const [snapshot, setSnapshot] = useState<BotCommunitySnapshot>()
  const [error, setError] = useState<string>()
  const [roomId, setRoomId] = useState<string>()
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [catalog, setCatalog] = useState<ModelCatalog>()
  const [catalogError, setCatalogError] = useState(false)
  const [agentId, setAgentId] = useState<string>()
  const [agentName, setAgentName] = useState('')
  const [agentDescription, setAgentDescription] = useState('')
  const [avatarSeed, setAvatarSeed] = useState('🤖')
  const [instructions, setInstructions] = useState('')
  const [modelRoute, setModelRoute] = useState('')
  const [mentionOnly, setMentionOnly] = useState(false)
  const [roomName, setRoomName] = useState('')
  const [roomImagePath, setRoomImagePath] = useState('')
  const [members, setMembers] = useState<BotId[]>([])
  const [roomPaused, setRoomPaused] = useState(false)
  const [agentPreset, setAgentPreset] = useState('standard')
  const [deleteTarget, setDeleteTarget] = useState<{ kind: 'room'; room: BotRoom } | { kind: 'agent'; agent: BotIdentity }>()

  const visibleRoomsOf = (rooms: readonly BotRoom[]): BotRoom[] =>
    rooms.filter(item => isAgentMode ? item.directBotId !== undefined : item.directBotId === undefined)

  const load = async (preferredRoomId?: string): Promise<void> => {
    try {
      const result = await props.remote.snapshot()
      if (!result.ok) { setError(result.error.message); return }
      setSnapshot(result.value)
      const visible = visibleRoomsOf(result.value.rooms)
      setRoomId((current) => {
        const wanted = preferredRoomId ?? current
        return wanted !== undefined && visible.some(item => item.id === wanted) ? wanted : visible[0]?.id
      })
      setError(undefined)
    } catch (e) { setError(e instanceof Error ? e.message : String(e)) }
  }

  useEffect(() => { void load() }, [])
  useEffect(() => {
    const timer = window.setInterval(() => { void load(roomId) }, 1500)
    return () => { window.clearInterval(timer) }
  }, [roomId])

  const agents = snapshot?.bots ?? []
  const rooms = snapshot?.rooms ?? []
  const directRooms = useMemo(() => rooms.filter(item => item.directBotId !== undefined), [rooms])
  const groupRooms = useMemo(() => rooms.filter(item => item.directBotId === undefined), [rooms])
  const visibleRooms = isAgentMode ? directRooms : groupRooms
  const room = visibleRooms.find(item => item.id === roomId)
  const selectedAgent = room?.directBotId === undefined ? undefined : agents.find(item => item.id === room.directBotId)
  const roomMembers = useMemo(() => room === undefined ? [] : room.memberIds.flatMap((id) => {
    const agent = agents.find(item => item.id === id)
    return agent === undefined ? [] : [agent]
  }), [agents, room])
  const messages = useMemo(() => (snapshot?.messages ?? []).filter(item => item.roomId === roomId), [snapshot, roomId])
  const runs = useMemo(() => (snapshot?.runs ?? []).filter(item => item.roomId === roomId), [snapshot, roomId])
  const runById = useMemo(() => new Map(runs.map(run => [run.id, run])), [runs])
  // 只在 Run 仍持有存活 Session 时查询 Session 侧的命令/引用服务；已结束的历史可能指向已释放的 Session。
  const referenceSessionId = runs.find(run => run.status === 'queued' || run.status === 'running')?.sessionId
  const nativeT = props.t as unknown as NativeTranslate

  // 模型列表直接来自 Host 目录（即「设置 → 模型」中已配置并可用的模型），按厂商分组。
  const modelGroups = useMemo(() => (catalog?.groups ?? [])
    .toSorted((left, right) => providerRank(left.id) - providerRank(right.id))
    .map(group => ({
      id: group.id,
      name: group.name,
      models: group.models.map(model => ({ key: routeKey(group.id, model.id), name: model.name })),
    })), [catalog])
  const hasModels = modelGroups.some(group => group.models.length > 0)
  const defaultRouteKey = useMemo(() => {
    const selection = catalog?.default
    if (selection === undefined || selection.provider === '' || selection.model === '') return undefined
    const key = routeKey(selection.provider, selection.model)
    return modelGroups.some(group => group.models.some(model => model.key === key)) ? key : undefined
  }, [catalog, modelGroups])
  const routeKnown = modelRoute === '' || modelGroups.some(group => group.models.some(model => model.key === modelRoute))
  // 表单打开且尚未选择模型时，预选部署默认模型，让下拉框直接显示当前生效的选择。
  useEffect(() => {
    if (formOpen && isAgentMode && modelRoute === '' && defaultRouteKey !== undefined) setModelRoute(defaultRouteKey)
  }, [defaultRouteKey, formOpen, isAgentMode, modelRoute])

  const execute = async (task: RemoteAction): Promise<void> => {
    if (busy) return
    setBusy(true)
    try {
      const result = await task()
      if (!result.ok) setError(result.error?.message ?? 'Request failed')
      else await load()
    } catch (e) { setError(e instanceof Error ? e.message : String(e)) }
    finally { setBusy(false) }
  }

  const prepareCatalog = (): void => {
    if (catalog !== undefined || catalogError) return
    void props.modelCatalog().then((result) => {
      if (result.ok) setCatalog(result.value)
      else setCatalogError(true)
    }).catch(() => { setCatalogError(true) })
  }

  const clearForm = (): void => {
    setFormOpen(false); setEditing(false); setAgentId(undefined)
    setAgentName(''); setAgentDescription(''); setAvatarSeed('🤖'); setInstructions(''); setModelRoute('')
    setRoomName(''); setRoomImagePath(''); setMembers([]); setRoomPaused(false); setMentionOnly(false); setAgentPreset('standard')
  }

  const openCreate = (): void => {
    clearForm(); setFormOpen(true); setError(undefined)
    if (isAgentMode) prepareCatalog()
  }

  const openAgentEdit = (agent: BotIdentity): void => {
    setEditing(true); setFormOpen(true); setAgentId(agent.id); setAgentName(agent.name)
    setAgentDescription(agent.description); setAvatarSeed(agent.avatar.seed); setInstructions(agent.systemPrompt ?? ''); setModelRoute(agent.provider && agent.model ? routeKey(agent.provider, agent.model) : '')
    setMentionOnly(agent.mentionOnly ?? false); setAgentPreset(agent.profile.agentPreset ?? 'standard'); setError(undefined); prepareCatalog()
  }

  const openRoomEdit = (target: BotRoom): void => {
    setEditing(true); setFormOpen(true); setRoomName(target.name); setRoomImagePath(target.imagePath ?? '')
    setMembers([...target.memberIds]); setRoomPaused(target.paused ?? false); setMentionOnly(target.mentionOnly); setError(undefined)
  }

  const createAgent = (): Promise<void> => execute(async () => {
    const route = parseRouteKey(modelRoute)
    const result = await props.remote.createBot({
      name: agentName, description: agentDescription, ...(avatarSeed.trim() ? { avatarSeed: avatarSeed.trim() } : {}),
      ...(instructions.trim() ? { systemPrompt: instructions.trim() } : {}), mentionOnly,
      ...(route ? { provider: route.provider, model: route.model } : {}),
      profile: { skillScope: agentPreset, agentPreset },
    })
    if (result.ok) clearForm()
    return result
  })

  const updateAgent = (): Promise<void> => execute(async () => {
    if (agentId === undefined) return { ok: false, error: { message: 'Agent not found' } }
    const route = parseRouteKey(modelRoute)
    const result = await props.remote.updateBot({
      id: agentId, name: agentName, description: agentDescription, ...(avatarSeed.trim() ? { avatarSeed: avatarSeed.trim() } : {}),
      systemPrompt: instructions, mentionOnly,
      ...(route ? { provider: route.provider, model: route.model } : {}),
      profile: { skillScope: agentPreset, agentPreset },
    })
    if (result.ok) clearForm()
    return result
  })

  const createGroup = (): Promise<void> => execute(async () => {
    const result = await props.remote.createRoom({
      name: roomName, memberIds: members, ...(roomImagePath.trim() ? { imagePath: roomImagePath.trim() } : {}), mentionOnly,
    })
    if (result.ok) { setRoomId(result.value.id); clearForm() }
    return result
  })

  const updateGroup = (): Promise<void> => execute(async () => {
    if (room === undefined) return { ok: false, error: { message: 'Group chat not found' } }
    const result = await props.remote.updateRoom({
      id: room.id, name: roomName, memberIds: members, imagePath: roomImagePath, mentionOnly, paused: roomPaused,
    })
    if (result.ok) clearForm()
    return result
  })

  const requestDeleteRoom = (target: BotRoom): void => {
    if (busy) return
    setDeleteTarget({ kind: 'room', room: target })
  }

  const requestDeleteAgent = (target: BotIdentity): void => {
    if (busy) return
    setDeleteTarget({ kind: 'agent', agent: target })
  }

  const confirmDelete = (): void => {
    if (deleteTarget === undefined || busy) return
    const target = deleteTarget
    setBusy(true)
    void (async () => {
      if (target.kind === 'agent') {
        const result = await props.remote.deleteBot({ id: target.agent.id })
        if (!result.ok) { setError(result.error.message); return }
        setDeleteTarget(undefined); setRoomId(undefined); setSnapshot(undefined)
        await load()
        return
      }
      const result = await props.remote.deleteRoom({ id: target.room.id })
      if (!result.ok) { setError(result.error.message); return }
      setDeleteTarget(undefined)
      // 清空 Agent 直聊：删除旧房间后立即为同一 Agent 建一个空房间，保持选中。
      const directBotId = target.room.directBotId
      if (directBotId !== undefined) {
        const recreated = await props.remote.createRoom({
          name: target.room.name, directBotId, memberIds: [directBotId], mentionOnly: false,
        })
        if (recreated.ok) { await load(recreated.value.id); return }
      }
      setRoomId(undefined); setSnapshot(undefined)
      await load()
    })().catch((error: unknown) => { setError(error instanceof Error ? error.message : String(error)) }).finally(() => { setBusy(false) })
  }

  const openAgent = (agent: BotIdentity): void => {
    const existing = directRooms.find(item => item.directBotId === agent.id)
    if (existing !== undefined) { setRoomId(existing.id); return }
    void execute(async () => {
      const result = await props.remote.createRoom({ name: `@${agent.name}`, directBotId: agent.id, memberIds: [agent.id], mentionOnly: false })
      if (result.ok) setRoomId(result.value.id)
      return result
    })
  }

  const controlRun = (run: BotRun, action: 'interrupt' | 'cancel'): void => {
    void execute(() => props.remote.controlRun({ id: run.id, action, expectedRevision: run.controlRevision }))
  }

  const retryRun = (run: BotRun): void => {
    void execute(() => props.remote.retryRun({ id: run.id, expectedRevision: run.controlRevision }))
  }

  const stopRuns = (): void => {
    const active = runs.filter(run => run.status === 'queued' || run.status === 'running')
    if (active.length === 0) return
    void execute(async () => {
      const results = await Promise.all(active.map(run => props.remote.controlRun({ id: run.id, action: 'interrupt', expectedRevision: run.controlRevision })))
      return results.find(result => !result.ok) ?? { ok: true }
    })
  }

  const send = (): Promise<void> => {
    if (room === undefined || !message.trim()) return Promise.resolve()
    return execute(async () => {
      const result = await props.remote.sendRoomMessage({ roomId: room.id, text: message })
      if (result.ok) setMessage('')
      return result
    })
  }

  const runsForMessage = (item: BotMessage): BotRun[] => {
    const ids = item.runIds ?? (item.runId === undefined ? [] : [item.runId])
    return ids.flatMap((id) => { const run = runById.get(id); return run === undefined ? [] : [run] })
  }

  // 与 Host 同一规则：Agent 在用户上次发言后 @user 提问才会自动暂停，此时直接回复即可继续。
  const awaitingUser = useMemo(() => {
    const since = messages.slice(messages.findLastIndex(item => item.sender.kind === 'user') + 1)
    return since.some(item => item.sender.kind === 'bot' && /(?<![\w@.])@user(?![\w-])/iu.test(item.text))
  }, [messages])
  const resumeRoom = (): void => {
    if (room === undefined) return
    const id = room.id
    void execute(() => props.remote.updateRoom({ id, paused: false }))
  }

  const connectionLabel = room === undefined ? undefined : props.t(`connection.${room.connection}`)
  const headerTitle = isAgentMode ? selectedAgent?.name ?? room?.name : room?.name
  const headerHint = isAgentMode
    ? (selectedAgent?.description.trim() || props.t('directHint'))
    : (roomMembers.length === 0 ? props.t('groupNoMembers') : props.t('groupMembers', { members: roomMembers.map(agent => agent.name).join('、') }))
  const emptyTitle = isAgentMode ? (agents.length === 0 ? props.t('empty') : props.t('selectAgent')) : (groupRooms.length === 0 ? props.t('noRooms') : props.t('selectRoom'))
  const emptyHint = isAgentMode ? (agents.length === 0 ? props.t('emptyAgentsHint') : undefined) : (groupRooms.length === 0 ? props.t('noRoomsHint') : undefined)
  const formTitle = isAgentMode ? props.t(editing ? 'editTitle' : 'createTitle') : props.t(editing ? 'groupEditTitle' : 'groupTitle')
  const formDescription = isAgentMode ? props.t(editing ? 'editDescription' : 'createDescription') : props.t(editing ? 'groupEditDescription' : 'groupDescription')
  const formInvalid = isAgentMode ? !agentName.trim() : (!roomName.trim() || members.length < 2)
  const submitForm = (): void => {
    void (isAgentMode ? (editing ? updateAgent() : createAgent()) : (editing ? updateGroup() : createGroup()))
  }

  return <section className={css.page}>
    <aside className={css.sidebar} aria-label={props.t(isAgentMode ? 'agents' : 'teams')}>
      <div className={css.section}>
        <div className={css.sectionHeading}>
          <div><h3 className={css.sectionTitle}>{props.t(isAgentMode ? 'agents' : 'rooms')}</h3><p className={css.sectionHint}>{props.t(isAgentMode ? 'agentSectionHint' : 'roomSectionHint')}</p></div>
          <button className={css.addButton} type="button" aria-label={props.t('add')} title={props.t('add')} onClick={openCreate}><IconPlusOutlineRegular size={15} /></button>
        </div>
        {isAgentMode
          ? <div className={css.agentList}>{agents.length === 0 ? <p className={css.listEmpty}>{props.t('empty')}</p> : agents.map(agent => <AgentRow key={agent.id} agent={agent} active={room?.directBotId === agent.id} disabled={busy} presenceLabel={props.t(`presence.${agent.presence ?? 'offline'}`)} onOpen={() => { openAgent(agent) }} onDelete={requestDeleteAgent} deleteLabel={props.t('deleteAgent')} />)}</div>
          : <div className={css.roomList}>{groupRooms.length === 0 ? <p className={css.listEmpty}>{props.t('noRooms')}</p> : groupRooms.map(item => <RoomRow key={item.id} room={item} active={item.id === roomId} meta={`${props.t('memberCount', { count: String(item.memberIds.length) })}${item.paused ? ` · ${props.t('paused')}` : ''}`} onSelect={() => { setRoomId(item.id) }} onDelete={requestDeleteRoom} deleteLabel={props.t('deleteRoom')} disabled={busy} />)}</div>}
      </div>
    </aside>
    <main className={css.content}>
      {room === undefined
        ? <div className={css.emptyState}>
          <p className={css.emptyTitle}>{emptyTitle}</p>
          {emptyHint && <p className={css.emptyHint}>{emptyHint}</p>}
        </div>
        : <>
          <header className={css.header}>
            <div className={css.heading}>
              <div className={css.eyebrow}>{props.t(isAgentMode ? 'directLabel' : 'groupLabel')}{connectionLabel ? ` · ${connectionLabel}` : ''}</div>
              <h2>{headerTitle}</h2>
              <p>{headerHint}</p>
            </div>
            <div className={css.actions}>
              {isAgentMode && <Button size="sm" variant="outline" disabled={busy || messages.length === 0} onClick={() => { requestDeleteRoom(room) }}>{props.t('clearConversation')}</Button>}
              {isAgentMode && selectedAgent && <Button size="sm" variant="outline" disabled={busy} onClick={() => { openAgentEdit(selectedAgent) }}>{props.t('edit')}</Button>}
              {!isAgentMode && <Button size="sm" variant="outline" disabled={busy} onClick={() => { openRoomEdit(room) }}>{props.t('edit')}</Button>}
            </div>
          </header>
          {error && <p role="alert" className={css.error}>{error}</p>}
          <section className={css.conversation}>
            <div className={css.messageList}>
              {messages.length === 0 ? <p className={css.empty}>{props.t('noMessages')}</p> : messages.map(item => <CommunityMessageView key={item.id} item={item} agents={agents} communityT={props.t} nativeT={nativeT} runs={runsForMessage(item)} unrouted={!isAgentMode && item.sender.kind === 'user' && (item.runIds?.length ?? 0) === 0} controlRun={controlRun} retryRun={retryRun} />)}
            </div>
          </section>
        </>}
      <div className={css.composerDock}>
        {!isAgentMode && room?.paused === true && <div role="status" className={css.pausedNotice}>
          <span>{props.t(awaitingUser ? 'pausedAwaitingUser' : 'pausedNotice')}</span>
          <Button size="sm" variant="outline" disabled={busy} onClick={resumeRoom}>{props.t('resume')}</Button>
        </div>}
        <CommunityComposer
          value={message}
          disabled={busy || room === undefined}
          agents={isAgentMode ? [] : roomMembers}
          mentionAll={!isAgentMode}
          sessionId={referenceSessionId}
          lookupReferences={referenceSessionId === undefined
            ? undefined
            : (query, signal) => props.lookupReferences(referenceSessionId, query, signal)}
          lookupCommands={referenceSessionId === undefined ? undefined : () => props.lookupCommands(referenceSessionId)}
          running={runs.some(run => run.status === 'queued' || run.status === 'running')}
          onStop={stopRuns}
          copy={{
            placeholder: props.t('composerPlaceholder'), plus: props.t('composerPlus'), file: props.t('composerFile'),
            conversation: props.t('composerConversation'), commands: props.t('composerCommands'), mentions: props.t('composerMentions'),
            noSuggestions: props.t('composerNoSuggestions'), mentionAll: props.t('mentionAll'), send: props.t('send'), addTitle: props.t('composerAddTitle'),
            directiveTitle: props.t('composerDirectiveTitle'), skillTitle: props.t('composerSkillTitle'),
            addItems: [
              { key: 'file', label: props.t('composerFile'), alias: 'file', detail: props.t('composerFileDetail'), action: 'file', icon: <IconPaperclipOutlineRegular size={14} /> },
              { key: 'goal', label: props.t('composerGoal'), alias: 'goal', detail: props.t('composerGoalDetail'), insert: '/goal ', icon: <IconGoalOutlineRegular size={14} /> },
              { key: 'plan', label: props.t('composerPlan'), alias: 'plan', detail: props.t('composerPlanDetail'), insert: '/plan ', icon: <IconListPenOutlineRegular size={14} /> },
              { key: 'feedback', label: props.t('composerFeedback'), alias: 'feedback', detail: props.t('composerFeedbackDetail'), insert: '/feedback ', icon: <IconPaperPlaneOutlineRegular size={14} /> },
            ],
            directiveItems: [
              { key: 'compact', label: props.t('composerCompact'), alias: 'compact', detail: props.t('composerCompactDetail'), insert: '/compact ', icon: <IconCompactOutlineRegular size={14} /> },
              { key: 'permission', label: props.t('composerPermission'), alias: 'permission', detail: props.t('composerPermissionDetail'), insert: '/permission ', icon: <IconShieldOutlineRegular size={14} /> },
              { key: 'model', label: props.t('composerModel'), alias: 'model', detail: props.t('composerModelDetail'), insert: '/model ', action: 'model', icon: <IconDatabaseOutlineRegular size={14} /> },
              { key: 'export', label: props.t('composerExport'), alias: 'export', detail: props.t('composerExportDetail'), insert: '/export ', icon: <IconDownloadOutlineRegular size={14} /> },
              { key: 'learn', label: 'learn', detail: props.t('composerLearnDetail'), insert: '/learn ', icon: <IconSkillOutlineRegular size={14} /> },
              { key: 'memory', label: 'memory', detail: props.t('composerMemoryDetail'), insert: '/memory ', icon: <IconInspectOutlineRegular size={14} /> },
            ],
          }}
          onOpenModelSettings={isAgentMode && selectedAgent ? () => { openAgentEdit(selectedAgent) } : undefined}
          onChange={setMessage}
          onSubmit={() => { void send() }}
        />
      </div>
    </main>
    <Modal open={formOpen} onClose={clearForm} title={formTitle} description={formDescription} closeLabel={props.t('cancel')} className={css.createModal ?? ''} contentClassName={css.createContent ?? ''} footer={<><Button variant="outline" disabled={busy} onClick={clearForm}>{props.t('cancel')}</Button><Button disabled={busy || formInvalid} onClick={submitForm}>{busy ? props.t('creating') : editing ? props.t('save') : props.t('create')}</Button></>}>
      {isAgentMode
        ? <div className={css.form}>
          <label>{props.t('agentName')}<Input value={agentName} onChange={(e) => { setAgentName(e.target.value) }} /></label>
          <label>{props.t('descriptionField')}<Input value={agentDescription} onChange={(e) => { setAgentDescription(e.target.value) }} /></label>
          <fieldset className={css.avatarField}><legend>{props.t('avatar')}</legend><div className={css.avatarPicker}>{AVATAR_EMOJIS.map(emoji => <button key={emoji} type="button" className={css.avatarChoice} data-active={avatarSeed === emoji ? 'true' : undefined} aria-label={emoji} aria-pressed={avatarSeed === emoji} onClick={() => { setAvatarSeed(emoji) }}>{emoji}</button>)}</div><p className={css.formHint}>{props.t('avatarHint')}</p></fieldset>
          <label>{props.t('agentPreset')}<select value={agentPreset} onChange={(e) => { setAgentPreset(e.target.value) }}><option value="standard">{props.t('presetStandard')}</option><option value="minimal">{props.t('presetMinimal')}</option></select></label>
          <label>{props.t('model')}
            <select value={modelRoute} disabled={!hasModels && routeKnown} onChange={(e) => { setModelRoute(e.target.value) }}>
              {!hasModels && modelRoute === '' && <option value="">{props.t(catalogError ? 'modelUnavailable' : 'modelEmpty')}</option>}
              {!routeKnown && <option value={modelRoute}>{`${parseRouteKey(modelRoute)?.model ?? modelRoute} · ${parseRouteKey(modelRoute)?.provider ?? ''}（${props.t('modelMissing')}）`}</option>}
              {modelGroups.map(group => <optgroup key={group.id} label={group.name}>
                {group.models.map(model => <option key={model.key} value={model.key}>{model.name}</option>)}
              </optgroup>)}
            </select>
          </label>
          {!hasModels && <p className={css.formHint}>{props.t(catalogError ? 'modelUnavailable' : 'modelEmptyHint')}</p>}
          <label>{props.t('instructions')}<textarea value={instructions} placeholder={props.t('instructionsPlaceholder')} onChange={(e) => { setInstructions(e.target.value) }} rows={4} /></label>
          <label className={css.check}><input type="checkbox" checked={mentionOnly} onChange={(e) => { setMentionOnly(e.target.checked) }} />{props.t('mentionOnly')}</label>
        </div>
        : <div className={css.form}>
          <label>{props.t('roomName')}<Input value={roomName} onChange={(e) => { setRoomName(e.target.value) }} /></label>
          <label>{props.t('roomImage')}<Input value={roomImagePath} onChange={(e) => { setRoomImagePath(e.target.value) }} /></label>
          <fieldset className={css.members}><legend>{props.t('members')} ({members.length})</legend>{agents.length === 0 ? <p className={css.formHint}>{props.t('emptyMembers')}</p> : agents.map(agent => <label className={css.check} key={agent.id}><input type="checkbox" checked={members.includes(agent.id)} onChange={() => { setMembers(current => current.includes(agent.id) ? current.filter(id => id !== agent.id) : [...current, agent.id]) }} />{agent.name}<small>{agent.description}</small></label>)}</fieldset>
          <label className={css.check}><input type="checkbox" checked={mentionOnly} onChange={(e) => { setMentionOnly(e.target.checked) }} />{props.t('mentionOnly')}</label>
          {editing && <div className={css.pauseSetting}><label className={css.check}><input type="checkbox" checked={roomPaused} onChange={(e) => { setRoomPaused(e.target.checked) }} />{props.t('pause')}</label><p className={css.formHint}>{props.t('pauseHint')}</p></div>}
        </div>}
    </Modal>
    <Modal
      open={deleteTarget !== undefined}
      onClose={() => { if (!busy) setDeleteTarget(undefined) }}
      title={deleteTarget?.kind === 'agent'
        ? props.t('deleteAgentTitle', { agent: deleteTarget.agent.name })
        : props.t(deleteTarget?.room.directBotId === undefined ? 'deleteRoomTitle' : 'clearConversationTitle')}
      description={deleteTarget?.kind === 'agent'
        ? props.t('deleteAgentDescription')
        : props.t(deleteTarget?.room.directBotId === undefined ? 'deleteRoomDescription' : 'clearConversationDescription')}
      closeLabel={props.t('cancel')}
      footer={<><Button variant="outline" disabled={busy} onClick={() => { setDeleteTarget(undefined) }}>{props.t('cancel')}</Button><Button variant="outline" className={css.dangerButton} disabled={busy} onClick={confirmDelete}>{busy ? props.t('deleting') : props.t('deleteConversationConfirm')}</Button></>}
    />
  </section>
}

function CommunityMessageView({ item, agents, communityT, nativeT, runs, unrouted, controlRun, retryRun }: { item: BotMessage; agents: readonly BotIdentity[]; communityT: BotCommunityProps['t']; nativeT: NativeTranslate; runs: readonly BotRun[]; unrouted: boolean; controlRun: (run: BotRun, action: 'interrupt' | 'cancel') => void; retryRun: (run: BotRun) => void }) {
  const bot = item.sender.kind === 'bot'
  const sender = item.sender.botId === undefined ? undefined : agents.find(agent => agent.id === item.sender.botId)
  const time = Date.parse(item.createdAt)
  const usage = item.usage === undefined ? undefined : toTurnUsage(item.usage)
  const fallbackDurationMs = runs.map((run) => {
    const started = Date.parse(run.startedAt ?? run.createdAt)
    const finished = Date.parse(run.finishedAt ?? '')
    return Number.isFinite(started) && Number.isFinite(finished) ? Math.max(0, finished - started) : undefined
  }).find(value => value !== undefined)
  const durationMs = item.durationMs ?? fallbackDurationMs
  const extraActions = runs.flatMap((run) => {
    if (run.status === 'queued' || run.status === 'running') {
      return [<Button key={`${run.id}:stop`} className={css.messageActionButton} variant="ghost" size="sm" icon={<IconStopFillMedium size={14} />} aria-label="Stop Agent" title="Stop Agent" onClick={() => { controlRun(run, 'interrupt') }} />]
    }
    if (run.status === 'failed' || run.status === 'interrupted') {
      return [
        <Button key={`${run.id}:retry`} className={css.messageActionButton} variant="ghost" size="sm" icon={<IconRefreshOutlineMedium size={14} />} aria-label="Retry Agent" title="Retry Agent" onClick={() => { retryRun(run) }} />,
      ]
    }
    return []
  })
  const failure = runs.find(run => run.status === 'failed')
  const failedAgent = failure === undefined ? undefined : agents.find(agent => agent.id === failure.botId)
  return <article className={css.message}>
    <CommunityMessage role={bot ? 'assistant' : 'user'} author={bot ? item.sender.name : undefined}
      avatar={bot ? avatarEmoji(sender, item.sender.name) : undefined} text={item.text}
      time={Number.isNaN(time) ? undefined : time} reasoning={item.reasoning} toolActivity={item.toolActivity} usage={usage}
      durationLabel={durationMs === undefined ? undefined : communityT('duration', { duration: formatElapsed(durationMs) })} extraActions={extraActions} t={nativeT} />
    {unrouted && <p role="status" className={css.runHint}>{communityT('noRecipients')}</p>}
    {failure && <p role="status" className={css.runFailure} title={failure.error}>
      {communityT(isCredentialFailure(failure.error) ? 'runFailedCredential' : 'runFailed', { agent: failedAgent?.name ?? 'Agent' })}
      {!isCredentialFailure(failure.error) && failure.error ? ` ${failure.error.slice(0, 200)}` : ''}
    </p>}
  </article>
}

/** 模型路由没有可用凭据时给出可操作的提示，而不是把 Host 诊断原样展示给用户。 */
function isCredentialFailure(error: string | undefined): boolean {
  return error !== undefined && /no credential for provider route|MISSING_CREDENTIAL|api key/iu.test(error)
}

function formatElapsed(durationMs: number): string {
  if (durationMs < 1000) return `${Math.max(1, Math.round(durationMs))}ms`
  const seconds = durationMs / 1000
  if (seconds < 60) return `${seconds < 10 ? seconds.toFixed(1) : Math.round(seconds)}s`
  const minutes = Math.floor(seconds / 60)
  return `${minutes}m ${Math.round(seconds % 60)}s`
}

function toTurnUsage(usage: BotMessageUsage): TurnTokenUsage {
  return {
    uncachedInputTokens: usage.uncachedInputTokens, outputTokens: usage.outputTokens, totalTokens: usage.totalTokens,
    ...(usage.cacheReadTokens === undefined ? {} : { cacheReadTokens: usage.cacheReadTokens }),
    ...(usage.cacheWriteTokens === undefined ? {} : { cacheWriteTokens: usage.cacheWriteTokens }),
    ...(usage.reasoningTokens === undefined ? {} : { reasoningTokens: usage.reasoningTokens }),
    ...(usage.routes === undefined ? {} : { routes: usage.routes }),
  }
}

interface AgentRowProps {
  agent: BotIdentity
  active: boolean
  presenceLabel: string
  onOpen: () => void
  onDelete: (agent: BotIdentity) => void
  deleteLabel: string
  disabled: boolean
}
function AgentRow({ agent, active, presenceLabel, onOpen, onDelete, deleteLabel, disabled }: AgentRowProps) {
  return <div className={css.rowWithAction}>
    <button className={css.agentRow} data-active={active ? 'true' : undefined} type="button" aria-pressed={active} disabled={disabled} onClick={onOpen}><span className={css.avatar} aria-hidden="true">{avatarEmoji(agent)}</span><span className={css.rowText}><span className={css.rowName}>{agent.name}</span><span className={css.rowMeta}>{presenceLabel}{agent.description.trim() ? ` · ${agent.description}` : ''}</span></span></button>
    <button className={css.rowDeleteButton} type="button" disabled={disabled} aria-label={deleteLabel} title={deleteLabel} onClick={(event) => { event.stopPropagation(); onDelete(agent) }}><IconTrashOutlineRegular size={14} /></button>
  </div>
}
function avatarEmoji(agent: BotIdentity | undefined, fallback = 'A'): string {
  const seed = agent?.avatar.seed
  if (seed !== undefined && seed !== '' && (seed.length <= 4 || /\p{Extended_Pictographic}/u.test(seed))) return seed
  return (agent?.name ?? fallback).slice(0, 1).toUpperCase()
}
interface RoomRowProps {
  room: BotRoom
  active: boolean
  meta: string
  onSelect: () => void
  onDelete: (room: BotRoom) => void
  deleteLabel: string
  disabled: boolean
}
function RoomRow({ room, active, meta, onSelect, onDelete, deleteLabel, disabled }: RoomRowProps) {
  return <div className={css.rowWithAction}><button className={css.roomRow} data-active={active ? 'true' : undefined} type="button" aria-pressed={active} onClick={onSelect}><span className={css.avatar} aria-hidden="true">群</span><span className={css.rowText}><span className={css.rowName}>{room.name}</span><span className={css.rowMeta}>{meta}</span></span></button><button className={css.rowDeleteButton} type="button" disabled={disabled} aria-label={deleteLabel} title={deleteLabel} onClick={(event) => { event.stopPropagation(); onDelete(room) }}><IconTrashOutlineRegular size={14} /></button></div>
}
