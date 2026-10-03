import { useEffect, useMemo, useState } from 'react'
import {
  Button, IconCompactOutlineRegular, IconDatabaseOutlineRegular, IconDownloadOutlineRegular, IconGoalOutlineRegular, IconInspectOutlineRegular, IconListPenOutlineRegular, IconPaperclipOutlineRegular, IconPaperPlaneOutlineRegular, IconPlusOutlineRegular, IconRefreshOutlineMedium, IconShieldOutlineRegular, IconSkillOutlineRegular, IconStopFillMedium, IconTrashOutlineRegular, Input, Modal,
} from '@deepseek-ai/dsh-client-ui-primitives'
import type { ModelCatalog } from '@deepseek-ai/dsh-api-session-controller/types'
import type { BotCommunitySnapshot, BotId, BotIdentity, BotMessage, BotMessageUsage, BotRoom, BotRun } from '@deepseek-ai/dsh-agent-community/types'
import { CommunityMessage, type ChatViewSlotProps, type TurnTokenUsage } from '@deepseek-ai/dsh-client-ui-chat/client'
import { CommunityComposer } from './CommunityComposer.tsx'
import type { BotCommunityProps } from './index.ts'
import css from './page.module.css'

type FormMode = 'agent' | 'group'
type RemoteAction = () => Promise<{ ok: boolean; error?: { message: string }; value?: any }>
type NativeTranslate = ChatViewSlotProps['t']

const AVATAR_EMOJIS = ['🤖', '🧠', '🦊', '🐙', '🐼', '🐸', '🚀', '🌟', '🎯', '🛠️', '🧭', '🔥', '🌈', '🪐', '🦉', '🐳'] as const

export function BotCommunityPage(props: BotCommunityProps) {
  const [snapshot, setSnapshot] = useState<BotCommunitySnapshot>()
  const [error, setError] = useState<string>()
  const [roomId, setRoomId] = useState<string>()
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<FormMode>('agent')
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
  const [deleteTarget, setDeleteTarget] = useState<BotRoom>()

  const load = async (preferredRoomId?: string): Promise<void> => {
    try {
      const result = await props.remote.snapshot()
      if (!result.ok) { setError(result.error.message); return }
      setSnapshot(result.value)
      setRoomId(current => preferredRoomId ?? current ?? result.value.rooms[0]?.id)
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
  const room = rooms.find(item => item.id === roomId)
  const selectedAgent = room?.directBotId === undefined ? undefined : agents.find(item => item.id === room.directBotId)
  const messages = useMemo(() => (snapshot?.messages ?? []).filter(item => item.roomId === roomId), [snapshot, roomId])
  const runs = useMemo(() => (snapshot?.runs ?? []).filter(item => item.roomId === roomId), [snapshot, roomId])
  const runById = useMemo(() => new Map(runs.map(run => [run.id, run])), [runs])
  // Only query Session-owned command/reference services while a Run still has a live Session;
  // failed/completed Community history may point at a released Session.
  const referenceSessionId = runs.find(run => run.status === 'queued' || run.status === 'running')?.sessionId
  const modelChoices = useMemo(() => {
    const choices = catalog?.groups.flatMap(group => group.models.map(model => ({
      key: `${group.id}\u0000${model.id}`, provider: group.id, model: model.id, label: `${model.name} · ${group.name}`,
    }))) ?? []
    const defaultModel = catalog?.default
    if (defaultModel !== undefined && !choices.some(choice => choice.provider === defaultModel.provider && choice.model === defaultModel.model)) {
      choices.unshift({
        key: `${defaultModel.provider}\u0000${defaultModel.model}`,
        provider: defaultModel.provider,
        model: defaultModel.model,
        label: `${defaultModel.model} · ${defaultModel.provider} (deployment default)`,
      })
    }
    return choices
  }, [catalog])
  const nativeT = props.t as unknown as NativeTranslate

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
    void props.modelCatalog().then(result => {
      if (result.ok) setCatalog(result.value)
      else setCatalogError(true)
    }).catch(() => setCatalogError(true))
  }

  const clearForm = (): void => {
    setFormOpen(false); setEditing(false); setAgentId(undefined)
    setAgentName(''); setAgentDescription(''); setAvatarSeed('🤖'); setInstructions(''); setModelRoute('')
    setRoomName(''); setRoomImagePath(''); setMembers([]); setRoomPaused(false); setMentionOnly(false); setAgentPreset('standard')
  }

  const openCreate = (mode: FormMode): void => {
    clearForm(); setFormMode(mode); setFormOpen(true); setMentionOnly(false); setError(undefined); prepareCatalog()
  }

  const openAgentEdit = (agent: BotIdentity): void => {
    setFormMode('agent'); setEditing(true); setFormOpen(true); setAgentId(agent.id); setAgentName(agent.name)
    setAgentDescription(agent.description); setAvatarSeed(agent.avatar.seed); setInstructions(agent.systemPrompt ?? ''); setModelRoute(agent.provider && agent.model ? `${agent.provider}\u0000${agent.model}` : '')
    setMentionOnly(agent.mentionOnly ?? false); setAgentPreset(agent.profile.agentPreset ?? 'standard'); setError(undefined); prepareCatalog()
  }

  const openRoomEdit = (target: BotRoom): void => {
    setFormMode('group'); setEditing(true); setFormOpen(true); setRoomName(target.name); setRoomImagePath(target.imagePath ?? '')
    setMembers([...target.memberIds]); setRoomPaused(target.paused ?? false); setMentionOnly(target.mentionOnly); setError(undefined)
  }

  const createAgent = (): Promise<void> => execute(async () => {
    const route = modelChoices.find(choice => choice.key === modelRoute)
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
    const route = modelChoices.find(choice => choice.key === modelRoute)
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
    const result = await props.remote.createRoom({ name: roomName, memberIds: members, ...(roomImagePath.trim() ? { imagePath: roomImagePath.trim() } : {}), mentionOnly: false })
    if (result.ok) { setRoomId((result.value as BotRoom).id); clearForm() }
    return result
  })

  const updateGroup = (): Promise<void> => execute(async () => {
    if (room === undefined) return { ok: false, error: { message: 'Group chat not found' } }
    const result = await props.remote.updateRoom({ id: room.id, name: roomName, memberIds: members, imagePath: roomImagePath, mentionOnly, paused: roomPaused })
    if (result.ok) clearForm()
    return result
  })

  const requestDeleteRoom = (target: BotRoom): void => {
    if (busy) return
    setDeleteTarget(target)
  }

  const confirmDeleteRoom = (): void => {
    if (deleteTarget === undefined || busy) return
    const targetId = deleteTarget.id
    setBusy(true)
    void props.remote.deleteRoom({ id: targetId }).then(result => {
      if (!result.ok) { setError(result.error.message); return }
      setDeleteTarget(undefined)
      setRoomId(undefined)
      setSnapshot(undefined)
      void load()
    }).catch(error => { setError(error instanceof Error ? error.message : String(error)) }).finally(() => { setBusy(false) })
  }

  const openAgent = (agent: BotIdentity): void => {
    const existing = directRooms.find(item => item.directBotId === agent.id)
    if (existing !== undefined) { setRoomId(existing.id); return }
    void execute(async () => {
      const result = await props.remote.createRoom({ name: `@${agent.name}`, directBotId: agent.id, memberIds: [agent.id], mentionOnly: false })
      if (result.ok) setRoomId((result.value as BotRoom).id)
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
    return ids.flatMap(id => { const run = runById.get(id); return run === undefined ? [] : [run] })
  }

  return <section className={css.page}>
    <aside className={css.sidebar} aria-label={props.t('agents')}>
      <div className={css.section}>
        <div className={css.sectionHeading}><div><h3 className={css.sectionTitle}>{props.t('agents')}</h3><p className={css.sectionHint}>{props.t('agentSectionHint')}</p></div><button className={css.addButton} type="button" aria-label={props.t('add')} title={props.t('add')} onClick={() => { openCreate('agent') }}><IconPlusOutlineRegular size={15} /></button></div>
        <div className={css.agentList}>{agents.length === 0 ? <p className={css.rowMeta}>{props.t('empty')}</p> : agents.map(agent => <AgentRow key={agent.id} agent={agent} directRoom={directRooms.find(item => item.directBotId === agent.id)} disabled={busy} onOpen={() => { openAgent(agent) }} onDelete={requestDeleteRoom} deleteLabel={props.t('deleteConversation')} />)}</div>
      </div>
      <div className={css.section}>
        <div className={css.sectionHeading}><div><h3 className={css.sectionTitle}>{props.t('rooms')}</h3><p className={css.sectionHint}>{props.t('roomSectionHint')}</p></div><button className={css.addButton} type="button" aria-label={props.t('add')} title={props.t('add')} onClick={() => { openCreate('group') }}><IconPlusOutlineRegular size={15} /></button></div>
        <div className={css.roomList}>{groupRooms.map(item => <RoomRow key={item.id} room={item} active={item.id === roomId} onSelect={() => { setRoomId(item.id) }} onDelete={requestDeleteRoom} deleteLabel={props.t('deleteConversation')} disabled={busy} />)}</div>
      </div>
    </aside>
    <main className={css.content}>
      <header className={css.header}><div className={css.heading}><div className={css.eyebrow}>{room?.directBotId ? props.t('directLabel') : props.t('groupLabel')}</div><h2>{room?.name ?? props.t('title')}</h2><p>{room?.directBotId ? props.t('directHint') : props.t('description')} {room ? ` · ${room.connection}` : ''}</p></div><div className={css.actions}>{room?.directBotId && selectedAgent && <><Button size="sm" variant="outline" disabled={busy} onClick={() => { openAgentEdit(selectedAgent) }}>{props.t('edit')}</Button></>}{room && !room.directBotId && <Button size="sm" variant="outline" disabled={busy} onClick={() => { openRoomEdit(room) }}>{props.t('edit')}</Button>}</div></header>
      {error && <p role="alert" className={css.error}>{error}</p>}
      <section className={css.conversation}>
        <div className={css.messageList}>
          {messages.length === 0 ? <p className={css.empty}>{props.t('noMessages')}</p> : messages.map(item => <CommunityMessageView key={item.id} item={item} agents={agents} communityT={props.t} nativeT={nativeT} runs={runsForMessage(item)} controlRun={controlRun} retryRun={retryRun} />)}
        </div>
      </section>
      <CommunityComposer
        value={message}
        disabled={busy || room === undefined}
        agents={agents}
        rooms={rooms}
        sessionId={referenceSessionId}
        lookupReferences={referenceSessionId === undefined ? undefined : (query, signal) => props.lookupReferences(referenceSessionId, query, signal)}
        lookupCommands={referenceSessionId === undefined ? undefined : () => props.lookupCommands(referenceSessionId)}
        running={runs.some(run => run.status === 'queued' || run.status === 'running')}
        onStop={stopRuns}
        copy={{
          placeholder: props.t('composerPlaceholder'), plus: props.t('composerPlus'), file: props.t('composerFile'),
          conversation: props.t('composerConversation'), commands: props.t('composerCommands'), mentions: props.t('composerMentions'),
          noSuggestions: props.t('composerNoSuggestions'), send: props.t('send'), addTitle: props.t('composerAddTitle'),
          directiveTitle: props.t('composerDirectiveTitle'), skillTitle: props.t('composerSkillTitle'),
          addItems: [
            { key: 'file', label: props.t('composerFile'), alias: 'file', detail: props.t('composerFileDetail'), action: 'file', icon: <IconPaperclipOutlineRegular size={16} /> },
            { key: 'goal', label: props.t('composerGoal'), alias: 'goal', detail: props.t('composerGoalDetail'), insert: '/goal ', icon: <IconGoalOutlineRegular size={16} /> },
            { key: 'plan', label: props.t('composerPlan'), alias: 'plan', detail: props.t('composerPlanDetail'), insert: '/plan ', icon: <IconListPenOutlineRegular size={16} /> },
            { key: 'feedback', label: props.t('composerFeedback'), alias: 'feedback', detail: props.t('composerFeedbackDetail'), insert: '/feedback ', icon: <IconPaperPlaneOutlineRegular size={16} /> },
          ],
          directiveItems: [
            { key: 'compact', label: props.t('composerCompact'), alias: 'compact', detail: props.t('composerCompactDetail'), insert: '/compact ', icon: <IconCompactOutlineRegular size={16} /> },
            { key: 'permission', label: props.t('composerPermission'), alias: 'permission', detail: props.t('composerPermissionDetail'), insert: '/permission ', icon: <IconShieldOutlineRegular size={16} /> },
            { key: 'model', label: props.t('composerModel'), alias: 'model', detail: props.t('composerModelDetail'), insert: '/model ', action: 'model' as const, icon: <IconDatabaseOutlineRegular size={16} /> },
            { key: 'export', label: props.t('composerExport'), alias: 'export', detail: props.t('composerExportDetail'), insert: '/export ', icon: <IconDownloadOutlineRegular size={16} /> },
            { key: 'learn', label: 'learn', detail: props.t('composerLearnDetail'), insert: '/learn ', icon: <IconSkillOutlineRegular size={16} /> },
            { key: 'memory', label: 'memory', detail: props.t('composerMemoryDetail'), insert: '/memory ', icon: <IconInspectOutlineRegular size={16} /> },
          ],
        }}
        onOpenModelSettings={room?.directBotId && selectedAgent ? () => { openAgentEdit(selectedAgent) } : undefined}
        onChange={setMessage}
        onSubmit={() => { void send() }}
      />
    </main>
    <Modal open={formOpen} onClose={clearForm} title={editing ? props.t('edit') : formMode === 'agent' ? props.t('createTitle') : props.t('groupTitle')} description={editing ? props.t('editDescription') : formMode === 'agent' ? props.t('createDescription') : props.t('groupDescription')} closeLabel={props.t('cancel')} className={css.createModal ?? ''} contentClassName={css.createContent ?? ''} footer={<><Button variant="outline" disabled={busy} onClick={clearForm}>{props.t('cancel')}</Button><Button disabled={busy || (formMode === 'agent' ? !agentName.trim() : !roomName.trim() || members.length < 2)} onClick={() => { void (editing ? (formMode === 'agent' ? updateAgent() : updateGroup()) : (formMode === 'agent' ? createAgent() : createGroup())) }}>{busy ? props.t('creating') : editing ? props.t('save') : props.t('create')}</Button></>}>
      <div className={css.createCard}>
        {!editing && <div className={css.modeSwitch} role="tablist" aria-label={props.t('createMode')}><button type="button" role="tab" aria-selected={formMode === 'agent'} data-active={formMode === 'agent' ? 'true' : undefined} onClick={() => { setFormMode('agent') }}>{props.t('modeAgent')}</button><button type="button" role="tab" aria-selected={formMode === 'group'} data-active={formMode === 'group' ? 'true' : undefined} onClick={() => { setFormMode('group') }}>{props.t('modeGroup')}</button></div>}
        {formMode === 'agent' ? <div className={css.form}>
          <label>{props.t('agentName')}<Input value={agentName} onChange={e => setAgentName(e.target.value)} /></label>
          <label>{props.t('descriptionField')}<Input value={agentDescription} onChange={e => setAgentDescription(e.target.value)} /></label>
          <fieldset className={css.avatarField}><legend>{props.t('avatar')}</legend><div className={css.avatarPicker}>{AVATAR_EMOJIS.map(emoji => <button key={emoji} type="button" className={css.avatarChoice} data-active={avatarSeed === emoji ? 'true' : undefined} aria-label={emoji} aria-pressed={avatarSeed === emoji} onClick={() => { setAvatarSeed(emoji) }}>{emoji}</button>)}</div><p className={css.formHint}>{props.t('avatarHint')}</p></fieldset>
          <label>{props.t('agentPreset')}<select value={agentPreset} onChange={e => setAgentPreset(e.target.value)}><option value="standard">standard</option><option value="minimal">minimal</option></select></label>
          <label>{props.t('model')}<select value={modelRoute} onChange={e => setModelRoute(e.target.value)}><option value="">{props.t('defaultModel')}</option>{modelChoices.map(choice => <option key={choice.key} value={choice.key}>{choice.label}</option>)}</select></label>
          {catalogError && <p className={css.formHint}>{props.t('modelUnavailable')}</p>}
          <label>{props.t('instructions')}<textarea value={instructions} placeholder={props.t('instructionsPlaceholder')} onChange={e => setInstructions(e.target.value)} rows={4} /></label>
          <label className={css.check}><input type="checkbox" checked={mentionOnly} onChange={e => setMentionOnly(e.target.checked)} />{props.t('mentionOnly')}</label>
        </div> : <div className={css.form}>
          <label>{props.t('roomName')}<Input value={roomName} onChange={e => setRoomName(e.target.value)} /></label>
          <label>{props.t('roomImage')}<Input value={roomImagePath} onChange={e => setRoomImagePath(e.target.value)} /></label>
          <fieldset className={css.members}><legend>{props.t('agents')} ({members.length})</legend>{agents.length === 0 ? <p className={css.formHint}>{props.t('empty')}</p> : agents.map(agent => <label className={css.check} key={agent.id}><input type="checkbox" checked={members.includes(agent.id)} onChange={() => { setMembers(current => current.includes(agent.id) ? current.filter(id => id !== agent.id) : [...current, agent.id]) }} />{agent.name}<small>{agent.description}</small></label>)}</fieldset>
          <label className={css.check}><input type="checkbox" checked={mentionOnly} onChange={e => setMentionOnly(e.target.checked)} />{props.t('mentionOnly')}</label>{editing && <div className={css.pauseSetting}><label className={css.check}><input type="checkbox" checked={roomPaused} onChange={e => setRoomPaused(e.target.checked)} />{props.t('pause')}</label><p className={css.formHint}>{props.t('pauseHint')}</p></div>}
        </div>}
      </div>
    </Modal>
    <Modal
      open={deleteTarget !== undefined}
      onClose={() => { if (!busy) setDeleteTarget(undefined) }}
      title={props.t('deleteConversationTitle')}
      description={props.t('deleteConversationDescription')}
      closeLabel={props.t('cancel')}
      footer={<><Button variant="outline" disabled={busy} onClick={() => { setDeleteTarget(undefined) }}>{props.t('cancel')}</Button><Button variant="outline" className={css.dangerButton} disabled={busy} onClick={confirmDeleteRoom}>{busy ? props.t('deleting') : props.t('deleteConversationConfirm')}</Button></>}
    />

  </section>
}

function CommunityMessageView({ item, agents, communityT, nativeT, runs, controlRun, retryRun, }: { item: BotMessage; agents: readonly BotIdentity[]; communityT: BotCommunityProps['t']; nativeT: NativeTranslate; runs: readonly BotRun[]; controlRun: (run: BotRun, action: 'interrupt' | 'cancel') => void; retryRun: (run: BotRun) => void; }) {
  const bot = item.sender.kind === 'bot'
  const sender = item.sender.botId === undefined ? undefined : agents.find(agent => agent.id === item.sender.botId)
  const time = Date.parse(item.createdAt)
  const usage = item.usage === undefined ? undefined : toTurnUsage(item.usage)
  const fallbackDurationMs = runs.map(run => {
    const started = Date.parse(run.startedAt ?? run.createdAt)
    const finished = Date.parse(run.finishedAt ?? '')
    return Number.isFinite(started) && Number.isFinite(finished) ? Math.max(0, finished - started) : undefined
  }).find(value => value !== undefined)
  const durationMs = item.durationMs ?? fallbackDurationMs
  const extraActions = runs.flatMap(run => {
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
  return <article className={`${css.message} ${bot ? css.botMessage : css.userMessage}`}>
    <CommunityMessage role={bot ? 'assistant' : 'user'} author={bot ? item.sender.name : undefined}
      avatar={bot ? avatarEmoji(sender, item.sender.name) : undefined} text={item.text}
      time={Number.isNaN(time) ? undefined : time} reasoning={item.reasoning} toolActivity={item.toolActivity} usage={usage}
      durationLabel={durationMs === undefined ? undefined : communityT('duration', { duration: formatElapsed(durationMs) })} extraActions={extraActions} t={nativeT} />
  </article>
}

function formatElapsed(durationMs: number): string {
  if (durationMs < 1000) return `${Math.max(1, Math.round(durationMs))}ms`
  const seconds = durationMs / 1000
  if (seconds < 60) return `${seconds < 10 ? seconds.toFixed(1) : Math.round(seconds)}s`
  const minutes = Math.floor(seconds / 60)
  return `${minutes}m ${Math.round(seconds % 60)}s`
}

function toTurnUsage(usage: BotMessageUsage): TurnTokenUsage {
  const totalTokens = usage.totalTokens ?? usage.uncachedInputTokens + (usage.cacheReadTokens ?? 0) + (usage.cacheWriteTokens ?? 0) + usage.outputTokens
  return {
    uncachedInputTokens: usage.uncachedInputTokens, outputTokens: usage.outputTokens, totalTokens,
    ...(usage.cacheReadTokens === undefined ? {} : { cacheReadTokens: usage.cacheReadTokens }),
    ...(usage.cacheWriteTokens === undefined ? {} : { cacheWriteTokens: usage.cacheWriteTokens }),
    ...(usage.reasoningTokens === undefined ? {} : { reasoningTokens: usage.reasoningTokens }),
    ...(usage.routes === undefined ? {} : { routes: usage.routes }),
  }
}

function AgentRow({ agent, directRoom, onOpen, onDelete, deleteLabel, disabled }: { agent: BotIdentity; directRoom?: BotRoom | undefined; onOpen: () => void; onDelete: (room: BotRoom) => void; deleteLabel: string; disabled: boolean }) {
  return <div className={css.rowWithAction}>
    <button className={css.agentRow} type="button" disabled={disabled} onClick={onOpen}><span className={css.avatar} aria-hidden="true">{avatarEmoji(agent)}</span><span className={css.rowText}><span className={css.rowName}>{agent.name}</span><span className={css.rowMeta}>{agent.presence ?? 'offline'} · {agent.description}</span></span></button>
    {directRoom && <button className={css.rowDeleteButton} type="button" disabled={disabled} aria-label={deleteLabel} title={deleteLabel} onClick={(event) => { event.stopPropagation(); onDelete(directRoom) }}><IconTrashOutlineRegular size={14} /></button>}
  </div>
}
function avatarEmoji(agent: BotIdentity | undefined, fallback = 'A'): string { return agent?.avatar.seed && (agent.avatar.seed.length <= 4 || /\p{Extended_Pictographic}/u.test(agent.avatar.seed)) ? agent.avatar.seed : (agent?.name ?? fallback).slice(0, 1).toUpperCase() }
function RoomRow({ room, active, onSelect, onDelete, deleteLabel, disabled }: { room: BotRoom; active: boolean; onSelect: () => void; onDelete: (room: BotRoom) => void; deleteLabel: string; disabled: boolean }) {
  return <div className={css.rowWithAction}><button className={css.roomRow} data-active={active ? 'true' : undefined} type="button" aria-pressed={active} onClick={onSelect}><span className={css.avatar} aria-hidden="true">群</span><span className={css.rowText}><span className={css.rowName}>{room.name}</span><span className={css.rowMeta}>{room.memberIds.length} Agents{room.paused ? ' · paused' : ''}</span></span></button><button className={css.rowDeleteButton} type="button" disabled={disabled} aria-label={deleteLabel} title={deleteLabel} onClick={(event) => { event.stopPropagation(); onDelete(room) }}><IconTrashOutlineRegular size={14} /></button></div>
}
