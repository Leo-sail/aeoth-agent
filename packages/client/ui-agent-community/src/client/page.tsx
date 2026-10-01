import { useEffect, useMemo, useState } from 'react'
import {
  Button, IconPlusOutlineRegular, IconRefreshOutlineMedium, IconSettingsOutlineMedium, IconStopFillMedium, Input, Modal,
} from '@deepseek-ai/dsh-client-ui-primitives'
import type { ModelCatalog } from '@deepseek-ai/dsh-api-session-controller/types'
import type { BotCommunitySnapshot, BotCredentialInfo, BotId, BotIdentity, BotMessage, BotMessageUsage, BotRoom, BotRun } from '@deepseek-ai/dsh-agent-community/types'
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
  const [credentialOpen, setCredentialOpen] = useState(false)
  const [credentialBot, setCredentialBot] = useState<BotIdentity>()
  const [credentialRefName, setCredentialRefName] = useState('DEEPSEEK_API_KEY')
  const [credentialValue, setCredentialValue] = useState('')
  const [credentialInfo, setCredentialInfo] = useState<BotCredentialInfo>()
  const [credentialBusy, setCredentialBusy] = useState(false)
  const [credentialError, setCredentialError] = useState<string>()

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

  const openCredentialManager = (agent: BotIdentity): void => {
    const ref = defaultCredentialRef(agent)
    setCredentialBot(agent); setCredentialRefName(ref); setCredentialValue(''); setCredentialInfo(undefined); setCredentialError(undefined); setCredentialOpen(true)
    setCredentialBusy(true)
    void props.remote.describeBotCredential(agent.id, ref).then(result => {
      if (result.ok) { setCredentialInfo(result.value) }
      else setCredentialError(result.error.message)
    }).catch(error => { setCredentialError(error instanceof Error ? error.message : String(error)) }).finally(() => { setCredentialBusy(false) })
  }

  const refreshCredentialInfo = async (): Promise<void> => {
    if (credentialBot === undefined || credentialRefName.trim() === '') return
    setCredentialBusy(true); setCredentialError(undefined)
    try {
      const result = await props.remote.describeBotCredential(credentialBot.id, credentialRefName.trim())
      if (result.ok) setCredentialInfo(result.value)
      else setCredentialError(result.error.message)
    } catch (error) { setCredentialError(error instanceof Error ? error.message : String(error)) }
    finally { setCredentialBusy(false) }
  }

  const saveCredential = async (): Promise<void> => {
    if (credentialBot === undefined || credentialValue.length === 0) return
    setCredentialBusy(true); setCredentialError(undefined)
    try {
      const result = await props.remote.setBotCredential(credentialBot.id, credentialRefName.trim(), credentialValue)
      if (!result.ok) { setCredentialError(result.error.message); return }
      setCredentialValue(''); await refreshCredentialInfo()
    } catch (error) { setCredentialError(error instanceof Error ? error.message : String(error)) }
    finally { setCredentialBusy(false) }
  }

  const copyDeploymentCredential = async (): Promise<void> => {
    if (credentialBot === undefined) return
    setCredentialBusy(true); setCredentialError(undefined)
    try {
      const result = await props.remote.copyBotCredentialFromDeployment(credentialBot.id, credentialRefName.trim())
      if (!result.ok) { setCredentialError(props.t('credentialsDeploymentUnavailable')); return }
      setCredentialValue(''); await refreshCredentialInfo()
    } catch { setCredentialError(props.t('credentialsDeploymentUnavailable')) }
    finally { setCredentialBusy(false) }
  }

  const unsetCredential = async (): Promise<void> => {
    if (credentialBot === undefined) return
    setCredentialBusy(true); setCredentialError(undefined)
    try {
      const result = await props.remote.unsetBotCredential(credentialBot.id, credentialRefName.trim())
      if (!result.ok) { setCredentialError(result.error.message); return }
      await refreshCredentialInfo()
    } catch (error) { setCredentialError(error instanceof Error ? error.message : String(error)) }
    finally { setCredentialBusy(false) }
  }

  const closeCredentialManager = (): void => {
    setCredentialOpen(false); setCredentialBot(undefined); setCredentialValue(''); setCredentialInfo(undefined); setCredentialError(undefined)
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
        <div className={css.agentList}>{agents.length === 0 ? <p className={css.rowMeta}>{props.t('empty')}</p> : agents.map(agent => <AgentRow key={agent.id} agent={agent} disabled={busy} onOpen={() => { openAgent(agent) }} />)}</div>
      </div>
      <div className={css.section}>
        <div className={css.sectionHeading}><div><h3 className={css.sectionTitle}>{props.t('rooms')}</h3><p className={css.sectionHint}>{props.t('roomSectionHint')}</p></div><button className={css.addButton} type="button" aria-label={props.t('add')} title={props.t('add')} onClick={() => { openCreate('group') }}><IconPlusOutlineRegular size={15} /></button></div>
        <div className={css.roomList}>{groupRooms.map(item => <RoomRow key={item.id} room={item} active={item.id === roomId} onSelect={() => { setRoomId(item.id) }} />)}</div>
      </div>
    </aside>
    <main className={css.content}>
      <header className={css.header}><div className={css.heading}><div className={css.eyebrow}>{room?.directBotId ? props.t('directLabel') : props.t('groupLabel')}</div><h2>{room?.name ?? props.t('title')}</h2><p>{room?.directBotId ? props.t('directHint') : props.t('description')} {room ? ` · ${room.connection}` : ''}</p></div><div className={css.actions}>{room?.directBotId && selectedAgent && <><Button size="sm" variant="outline" disabled={busy} onClick={() => { openCredentialManager(selectedAgent) }}>{props.t('credentials')}</Button><Button size="sm" variant="outline" disabled={busy} onClick={() => { openAgentEdit(selectedAgent) }}>{props.t('edit')}</Button></>}{room && !room.directBotId && <Button size="sm" variant="outline" disabled={busy} onClick={() => { openRoomEdit(room) }}>{props.t('edit')}</Button>}</div></header>
      {error && <p role="alert" className={css.error}>{error}</p>}
      <section className={css.conversation}>
        <div className={css.messageList}>
          {messages.length === 0 ? <p className={css.empty}>{props.t('noMessages')}</p> : messages.map(item => <CommunityMessageView key={item.id} item={item} agents={agents} communityT={props.t} nativeT={nativeT} runs={runsForMessage(item)} controlRun={controlRun} retryRun={retryRun} openCredentials={openCredentialManager} />)}
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
          noSuggestions: props.t('composerNoSuggestions'), send: props.t('send'),
        }}
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
    <Modal open={credentialOpen} onClose={closeCredentialManager} title={props.t('credentialsTitle')} description={credentialBot === undefined ? '' : props.t('credentialsDescription', { agent: credentialBot.name })} closeLabel={props.t('cancel')} className={css.createModal ?? ''} contentClassName={css.createContent ?? ''} footer={<><Button variant="outline" disabled={credentialBusy} onClick={closeCredentialManager}>{props.t('cancel')}</Button>{credentialInfo?.configured && <Button variant="outline" disabled={credentialBusy || !credentialInfo.writable} onClick={() => { void unsetCredential() }}>{props.t('credentialsRemove')}</Button>}<Button disabled={credentialBusy || credentialValue.length === 0 || credentialBot === undefined || credentialInfo?.writable === false} onClick={() => { void saveCredential() }}>{credentialBusy ? props.t('creating') : props.t('credentialsSave')}</Button></>}>
      <div className={css.createCard}>
        {credentialError && <p role="alert" className={css.error}>{credentialError}</p>}
        {credentialBot && <p className={css.formHint}>{props.t('credentialsNamespace', { namespace: credentialBot.profile.credentialNamespace ?? '' })}</p>}
        <div className={css.form}>
          <label>{props.t('credentialsReference')}<Input value={credentialRefName} onChange={e => { setCredentialRefName(e.target.value); setCredentialInfo(undefined) }} onBlur={() => { void refreshCredentialInfo() }} autoComplete="off" /></label>
          {credentialInfo && <p className={css.formHint}>{credentialInfo.configured ? props.t('credentialsConfigured', { source: credentialInfo.source ?? 'stored' }) : props.t('credentialsNotConfigured')}</p>}
          <label>{props.t('credentialsValue')}<Input type="password" value={credentialValue} onChange={e => { setCredentialValue(e.target.value) }} autoComplete="new-password" placeholder={props.t('credentialsValuePlaceholder')} /></label>
          <Button variant="outline" disabled={credentialBusy} onClick={() => { void copyDeploymentCredential() }}>{props.t('credentialsUseDeployment')}</Button>
          <p className={css.formHint}>{props.t('credentialsSafety')}</p>
        </div>
      </div>
    </Modal>
  </section>
}

function CommunityMessageView({ item, agents, communityT, nativeT, runs, controlRun, retryRun, openCredentials }: { item: BotMessage; agents: readonly BotIdentity[]; communityT: BotCommunityProps['t']; nativeT: NativeTranslate; runs: readonly BotRun[]; controlRun: (run: BotRun, action: 'interrupt' | 'cancel') => void; retryRun: (run: BotRun) => void; openCredentials: (bot: BotIdentity) => void }) {
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
    const runBot = agents.find(agent => agent.id === run.botId)
    const failure = run.error ?? run.lastError
    const credentialFailure = failure !== undefined && /credential|api key|account sign-in/iu.test(failure)
    if (run.status === 'queued' || run.status === 'running') {
      return [<Button key={`${run.id}:stop`} className={css.messageActionButton} variant="ghost" size="sm" icon={<IconStopFillMedium size={14} />} aria-label="Stop Agent" title="Stop Agent" onClick={() => { controlRun(run, 'interrupt') }} />]
    }
    if (run.status === 'failed' || run.status === 'interrupted') {
      return [
        <Button key={`${run.id}:retry`} className={css.messageActionButton} variant="ghost" size="sm" icon={<IconRefreshOutlineMedium size={14} />} aria-label="Retry Agent" title="Retry Agent" onClick={() => { retryRun(run) }} />,
        ...(credentialFailure && runBot !== undefined
          ? [<Button key={`${run.id}:credentials`} className={css.messageActionButton} variant="ghost" size="sm" icon={<IconSettingsOutlineMedium size={14} />} aria-label={communityT('credentials')} title={communityT('credentials')} onClick={() => { openCredentials(runBot) }} />]
          : []),
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

function defaultCredentialRef(agent: BotIdentity): string {
  if (agent.provider === 'deepseek-official' || agent.provider === 'deepseek-account') return 'DEEPSEEK_API_KEY'
  const provider = agent.provider?.replace(/[^A-Za-z0-9]/gu, '_').toUpperCase()
  return provider === undefined || provider === '' ? 'DEEPSEEK_API_KEY' : `${provider}_API_KEY`
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

function AgentRow({ agent, onOpen, disabled }: { agent: BotIdentity; onOpen: () => void; disabled: boolean }) { return <button className={css.agentRow} type="button" disabled={disabled} onClick={onOpen}><span className={css.avatar} aria-hidden="true">{avatarEmoji(agent)}</span><span className={css.rowText}><span className={css.rowName}>{agent.name}</span><span className={css.rowMeta}>{agent.presence ?? 'offline'} · {agent.description}</span></span></button> }
function avatarEmoji(agent: BotIdentity | undefined, fallback = 'A'): string { return agent?.avatar.seed && (agent.avatar.seed.length <= 4 || /\p{Extended_Pictographic}/u.test(agent.avatar.seed)) ? agent.avatar.seed : (agent?.name ?? fallback).slice(0, 1).toUpperCase() }
function RoomRow({ room, active, onSelect }: { room: BotRoom; active: boolean; onSelect: () => void }) { return <button className={css.roomRow} data-active={active ? 'true' : undefined} type="button" aria-pressed={active} onClick={onSelect}><span className={css.avatar} aria-hidden="true">群</span><span className={css.rowText}><span className={css.rowName}>{room.name}</span><span className={css.rowMeta}>{room.memberIds.length} Agents{room.paused ? ' · paused' : ''}</span></span></button> }
