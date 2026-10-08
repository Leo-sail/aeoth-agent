/** Native Bot Mode community domain. */
import { randomUUID } from 'node:crypto'
import { mkdir, readFile } from 'node:fs/promises'
import { isAbsolute, join } from 'node:path'
import { Context } from '@deepseek-ai/cordis'
import { withFileLock, writeFileAtomic } from '@deepseek-ai/dsh-atomic-write'
import { createUserMessage } from '@deepseek-ai/dsh-llm'
import { SessionId } from '@deepseek-ai/dsh-session'
import { resolveAeothHome } from '@deepseek-ai/dsh-home-paths'
import z from '@deepseek-ai/schemastery'
import type {
  BotCommunitySnapshot, BotId, BotIdentity, BotMessage, BotMessageId, BotRoom, BotRoomId, BotRun, BotRunId, BotMailboxItem,
  ControlBotRunRequest, CreateBotRequest, CreateRoomRequest, DeleteRoomRequest, RetryBotRunRequest, SendRoomMessageRequest, SettleBotRunRequest, UpdateBotRequest, UpdateRoomRequest,
  BotProfileBinding, DeleteBotRequest,
} from './types.ts'

export type * from './types.ts'
export type { BotId, BotRoomId, BotRunId, BotMessageId } from './brands.ts'

export const name = 'agent-community'
export const inject = ['agents', 'sessions', 'sessionPersistence']
export interface Config {
  readonly maxBots?: number
  readonly maxRooms?: number
  readonly maxMessages?: number
  readonly maxRuns?: number
}
export const Config: z<Config> = z.object({
  maxBots: z.number().step(1).min(1).default(32),
  maxRooms: z.number().step(1).min(1).default(64),
  maxMessages: z.number().step(1).min(1).default(10000),
  maxRuns: z.number().step(1).min(1).default(1000),
})

declare module '@deepseek-ai/cordis' { interface Context { agentCommunity: AgentCommunityService } }

interface RoomAgentSession {
  readonly roomId: BotRoomId
  readonly botId: BotId
  readonly sessionId: SessionId
  readonly lastSeenSequence?: number
}

export interface RoutineCommunityDispatch {
  readonly sessionId: SessionId
  readonly requestId: string
  readonly text: string
}
interface PersistedState extends BotCommunitySnapshot {
  version: 2
  roomAgentSessions: readonly RoomAgentSession[]
}

const DEFAULT_AEOTH_AGENT_PROMPT = 'You are an AI agent powered by Aeoth Agent.'

function now(): string { return new Date().toISOString() }
function id<T extends string>(prefix: string): T { return `${prefix}-${randomUUID()}` as T }
function assertText(value: string, label: string, max = 4000): string {
  const text = value.trim()
  if (!text) throw new Error(`${label} must not be empty`)
  if (text.length > max) throw new Error(`${label} is too long`)
  if (/^[\u0000-\u001f\u007f]/u.test(text)) throw new Error(`${label} contains control characters`)
  return text
}
/**
 * Agents created before deployment credentials were shared got their own name (or id) as an
 * implicit credential namespace that nothing ever filled, so every model call failed. Only an
 * explicitly chosen namespace is kept.
 */
function withoutAutoCredentialNamespace(
  profile: BotProfileBinding,
  bot: { readonly id: unknown; readonly name: unknown },
): BotProfileBinding {
  if (profile.credentialNamespace !== bot.name && profile.credentialNamespace !== bot.id) return profile
  const { credentialNamespace: _auto, ...rest } = profile
  return rest
}
/** An Agent reply that addresses the human pauses the room until the human answers. */
const USER_MENTION = /(?<![\w@.])@user(?![\w-])/iu
function escapeRegExp(value: string): string { return value.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&') }
function normalizeBotName(value: string): string {
  return assertText(value, 'bot name', 64).toLocaleLowerCase().replace(/[^\p{L}\p{N}_-]+/gu, '-').replace(/^-+|-+$/gu, '')
}
function defaultState(): PersistedState {
  return { version: 2, bots: [], rooms: [], messages: [], runs: [], mailbox: [], roomAgentSessions: [] }
}

export class AgentCommunityService {
  private readonly path: string
  private readonly lockPath: string
  private readonly config: Required<Config>
  private tail: Promise<unknown> = Promise.resolve()
  private readonly ownerId = randomUUID()

  constructor(private readonly ctx: Context, config: Config = {}) {
    const profile = ctx.get('profileContext') as { dir?: string } | undefined
    const root = join(profile?.dir ?? resolveAeothHome(), 'agent-community')
    this.path = join(root, 'state.json')
    this.lockPath = join(root, '.state-write')
    this.config = {
      maxBots: config.maxBots ?? 32,
      maxRooms: config.maxRooms ?? 64,
      maxMessages: config.maxMessages ?? 10_000,
      maxRuns: config.maxRuns ?? 1_000,
    }
  }

  async snapshot(): Promise<BotCommunitySnapshot> {
    const state = await this.read()
    const bots = state.bots.filter(bot => bot.builtIn !== true && bot.id !== 'bot-default' && bot.name !== 'default')
    const ids = new Set(bots.map(bot => bot.id))
    const rooms = state.rooms.filter(room => room.id !== 'room-lobby' && room.name !== 'Lobby' && (room.directBotId === undefined ? room.memberIds.filter(id => ids.has(id)).length >= 2 : ids.has(room.directBotId)))
    return { ...state, bots, rooms }
  }
  async listBots(): Promise<readonly BotIdentity[]> { return (await this.read()).bots.filter(bot => bot.builtIn !== true && bot.id !== 'bot-default' && bot.name !== 'default') }
  async listRooms(): Promise<readonly BotRoom[]> { return (await this.read()).rooms.filter(room => room.id !== 'room-lobby' && room.name !== 'Lobby') }
  async listMessages(roomId: BotRoomId): Promise<readonly BotMessage[]> { return (await this.read()).messages.filter(message => message.roomId === roomId) }
  async listRuns(botId?: BotId): Promise<readonly BotRun[]> { return (await this.read()).runs.filter(run => botId === undefined || run.botId === botId) }
  async listMailbox(roomId?: BotRoomId): Promise<readonly BotMailboxItem[]> { return (await this.read()).mailbox.filter(item => roomId === undefined || item.roomId === roomId) }

  async createBot(input: CreateBotRequest): Promise<BotIdentity> {
    return this.serial(async () => {
      const state = await this.read()
      if (state.bots.length >= this.config.maxBots) throw new Error('agent community bot limit reached')
      const name = normalizeBotName(input.name)
      if (!/[\p{L}\p{N}]/u.test(name)) throw new Error('bot name must contain a letter or number')
      if (state.bots.some(bot => bot.name === name)) throw new Error(`bot '${name}' already exists`)
      if ((input.provider === undefined) !== (input.model === undefined)) throw new Error('bot provider and model must be set together')
      if (input.workspace !== undefined && !isAbsolute(input.workspace)) throw new Error('bot workspace must be an absolute path')
      const createdAt = now()
      const bot: BotIdentity = {
        id: id<BotId>('bot'), name, description: assertText(input.description?.trim() || name, 'bot description', 1000),
        avatar: { seed: input.avatarSeed?.trim() || randomUUID(), locked: input.avatarLocked ?? false },
        ...(input.provider ? { provider: input.provider } : {}), ...(input.model ? { model: input.model } : {}),
        ...(input.workspace ? { workspace: input.workspace } : {}), createdAt, updatedAt: createdAt,
        systemPrompt: assertText(input.systemPrompt?.trim() || DEFAULT_AEOTH_AGENT_PROMPT, 'agent instructions', 8000),
        ...(input.mentionOnly === undefined ? {} : { mentionOnly: input.mentionOnly }),
        presence: 'idle',
        // No default credential namespace: an Agent uses the deployment credentials
        // configured on the Models page unless a caller explicitly scopes it.
        profile: { profileId: id('profile'), memoryNamespace: `bot:${name}:memory`, skillScope: name, ...input.profile },
      }
      await this.write({ ...state, bots: [...state.bots, bot] })
      return bot
    })
  }

  async updateBot(input: UpdateBotRequest): Promise<BotIdentity> {
    return this.serial(async () => {
      const state = await this.read(); const current = state.bots.find(bot => bot.id === input.id)
      if (current === undefined) throw new Error('bot not found')
      const name = input.name === undefined ? current.name : normalizeBotName(input.name)
      if (!/[\p{L}\p{N}]/u.test(name)) throw new Error('bot name must contain a letter or number')
      if (state.bots.some(bot => bot.id !== input.id && bot.name === name)) throw new Error(`bot '${name}' already exists`)
      const provider = input.provider === undefined ? current.provider : input.provider
      const model = input.model === undefined ? current.model : input.model
      if ((provider === undefined) !== (model === undefined)) throw new Error('bot provider and model must be set together')
      if (input.workspace !== undefined && input.workspace !== '' && !isAbsolute(input.workspace)) throw new Error('bot workspace must be an absolute path')
      const { workspace: previousWorkspace, ...base } = current
      const workspace = input.workspace === undefined ? previousWorkspace : input.workspace || undefined
      const updated: BotIdentity = {
        ...base, name,
        ...(input.description === undefined ? {} : { description: assertText(input.description, 'bot description', 1000) }),
        avatar: { seed: input.avatarSeed?.trim() || current.avatar.seed, locked: input.avatarLocked ?? current.avatar.locked },
        ...(provider === undefined ? {} : { provider }),
        ...(model === undefined ? {} : { model }),
        ...(workspace === undefined ? {} : { workspace }),
        systemPrompt: input.systemPrompt === undefined
          ? (current.systemPrompt ?? DEFAULT_AEOTH_AGENT_PROMPT)
          : assertText(input.systemPrompt.trim() || DEFAULT_AEOTH_AGENT_PROMPT, 'agent instructions', 8000),
        ...(input.mentionOnly === undefined ? {} : { mentionOnly: input.mentionOnly }),
        profile: { ...current.profile, ...input.profile }, updatedAt: now(),
      }
      await this.write({ ...state, bots: state.bots.map(bot => bot.id === input.id ? updated : bot) })
      return updated
    })
  }

  async createRoom(input: CreateRoomRequest): Promise<BotRoom> {
    return this.serial(async () => {
      const state = await this.read()
      const directRoom = input.directBotId === undefined
        ? undefined
        : state.rooms.find(room => room.directBotId === input.directBotId)
      if (directRoom !== undefined) return directRoom
      if (state.rooms.length >= this.config.maxRooms) throw new Error('agent community room limit reached')
      const memberIds = [...new Set(input.memberIds ?? [])] as BotId[]
      if (memberIds.length === 0) throw new Error('select at least one Bot')
      if (input.directBotId === undefined && memberIds.length < 2) throw new Error('group chat must contain at least 2 Agents')
      if (input.directBotId !== undefined && (memberIds.length !== 1 || memberIds[0] !== input.directBotId)) {
        throw new Error('direct chat must contain exactly its Bot')
      }
      if (memberIds.some(memberId => !state.bots.some(bot => bot.id === memberId))) throw new Error('room contains an unknown bot')
      const createdAt = now()
      const room: BotRoom = {
        id: id<BotRoomId>('room'), name: assertText(input.name, 'room name', 120),
        ...(input.directBotId === undefined ? {} : { directBotId: input.directBotId as BotId }),
        ...(input.imagePath ? { imagePath: input.imagePath } : {}), memberIds,
        mentionOnly: input.directBotId === undefined ? input.mentionOnly ?? false : false,
        policy: input.directBotId === undefined ? (input.mentionOnly === false ? 'round-robin' : 'mention-only') : 'mention-only',
        sequence: 0, connection: 'connected',
        createdAt, updatedAt: createdAt,
      }
      await this.write({ ...state, rooms: [...state.rooms, room] })
      return room
    })
  }

  async updateRoom(input: UpdateRoomRequest): Promise<BotRoom> {
    return this.serial(async () => {
      const state = await this.read()
      const current = state.rooms.find(room => room.id === input.id)
      if (current === undefined) throw new Error('room not found')
      const memberIds = input.memberIds === undefined ? current.memberIds : [...new Set(input.memberIds)] as BotId[]
      if (memberIds.some(memberId => !state.bots.some(bot => bot.id === memberId))) throw new Error('room contains an unknown bot')
      if (current.directBotId === undefined && memberIds.length < 2) throw new Error('group chat must contain at least 2 Agents')
      if (current.directBotId !== undefined && (memberIds.length !== 1 || memberIds[0] !== current.directBotId)) throw new Error('direct chat must contain exactly its Bot')
      const removed = new Set(current.memberIds.filter(botId => !memberIds.includes(botId)))
      const { imagePath: oldImagePath, ...base } = current
      const imagePath = input.imagePath === undefined ? oldImagePath : input.imagePath.trim() || undefined
      const timestamp = now()
      const updated: BotRoom = {
        ...base,
        ...(input.name === undefined ? {} : { name: assertText(input.name, 'room name', 120) }),
        ...(imagePath === undefined ? {} : { imagePath }), memberIds,
        ...(input.mentionOnly === undefined ? {} : { mentionOnly: input.mentionOnly, policy: input.mentionOnly ? 'mention-only' : 'round-robin' }),
        ...(input.paused === undefined ? {} : { paused: input.paused }), revision: (current.revision ?? 0) + 1, updatedAt: timestamp,
      }
      const cancelled = state.runs.filter(run => removed.has(run.botId) && run.roomId === current.id && ['queued', 'running'].includes(run.status))
      const cancelledKeys = new Set(cancelled.map(run => `${run.roomId}:${run.botId}:${run.roomSequence}`))
      const runs = state.runs.map(run => removed.has(run.botId) && run.roomId === current.id && ['queued', 'running'].includes(run.status)
        ? (() => { const { leaseOwner: _owner, leaseExpiresAt: _expiry, ...baseRun } = run; return { ...baseRun, status: 'cancelled' as const, controlRevision: run.controlRevision + 1, error: 'Bot removed from room', finishedAt: timestamp, updatedAt: timestamp } })()
        : run)
      await this.write({ ...state, rooms: state.rooms.map(room => room.id === input.id ? updated : room), runs,
        mailbox: state.mailbox.map(item => cancelledKeys.has(`${item.roomId}:${item.botId}:${item.sequence}`) ? { ...item, status: 'settled', settledAt: timestamp } : item),
        bots: state.bots.map(bot => removed.has(bot.id) ? { ...bot, presence: 'idle' } : bot) })
      return updated
    })
  }

  async retryRun(input: RetryBotRunRequest): Promise<BotRun> {
    return this.serial(async () => {
      const state = await this.read(); const current = state.runs.find(run => run.id === input.id)
      if (current === undefined) throw new Error('bot run not found')
      if (current.controlRevision !== input.expectedRevision) throw new Error('bot run changed; refresh before retrying it')
      if (current.status !== 'failed' && current.status !== 'interrupted') throw new Error('only failed or interrupted runs can be retried')
      const room = state.rooms.find(item => item.id === current.roomId)
      if (!room?.memberIds.includes(current.botId)) throw new Error('Bot is no longer a room member')
      const { finishedAt: _finished, error: priorError, nextRetryAt: _next, requestId: _receipt, submission: _submission, leaseOwner: _owner, leaseExpiresAt: _expiry, ...base } = current
      const updated: BotRun = { ...base, status: 'queued', ...(priorError === undefined ? {} : { lastError: priorError }), maxAttempts: Math.max(current.maxAttempts, current.attempt + 3), controlRevision: current.controlRevision + 1, updatedAt: now() }
      await this.write({ ...state, runs: state.runs.map(run => run.id === current.id ? updated : run), mailbox: state.mailbox.map(item => { if (item.roomId !== current.roomId || item.botId !== current.botId || item.sequence !== current.roomSequence) return item; const { settledAt: _settled, claimedAt: _claimed, ...baseItem } = item; return { ...baseItem, status: 'pending' as const } }), bots: state.bots.map(bot => bot.id === current.botId ? { ...bot, presence: 'queued' } : bot) })
      return updated
    })
  }
  /** Permanently remove a Community room, its mailbox/history, and hidden Agent Session artifacts. */
  async deleteRoom(input: DeleteRoomRequest): Promise<void> {
    return this.serial(async () => {
      const state = await this.read()
      const room = state.rooms.find(item => item.id === input.id)
      if (room === undefined) return
      await this.removeSessions(new Set<SessionId>([
        ...state.roomAgentSessions.filter(link => link.roomId === room.id).map(link => link.sessionId),
        ...state.runs.filter(run => run.roomId === room.id).map(run => run.sessionId),
      ]))
      await this.write({
        ...state,
        rooms: state.rooms.filter(item => item.id !== room.id),
        messages: state.messages.filter(item => item.roomId !== room.id),
        runs: state.runs.filter(run => run.roomId !== room.id),
        mailbox: state.mailbox.filter(item => item.roomId !== room.id),
        roomAgentSessions: state.roomAgentSessions.filter(link => link.roomId !== room.id),
      })
    })
  }

  /**
   * Permanently remove an Agent: its direct chat, its runs and Sessions in every room, and its
   * group memberships. Group chats left with fewer than two members are removed with it, since
   * a group cannot be created or kept below that size.
   */
  async deleteBot(input: DeleteBotRequest): Promise<void> {
    return this.serial(async () => {
      const state = await this.read()
      const bot = state.bots.find(item => item.id === input.id)
      if (bot === undefined) return
      const orphansGroup = (room: BotRoom): boolean =>
        room.directBotId === undefined && room.memberIds.includes(bot.id) && room.memberIds.length - 1 < 2
      const removedRoomIds = new Set(state.rooms.filter(room => room.directBotId === bot.id || orphansGroup(room)).map(room => room.id))
      const touches = (roomId: BotRoomId, botId: BotId): boolean => removedRoomIds.has(roomId) || botId === bot.id
      await this.removeSessions(new Set<SessionId>([
        ...state.roomAgentSessions.filter(link => touches(link.roomId, link.botId)).map(link => link.sessionId),
        ...state.runs.filter(run => touches(run.roomId, run.botId)).map(run => run.sessionId),
      ]))
      await this.write({
        ...state,
        bots: state.bots.filter(item => item.id !== bot.id),
        rooms: state.rooms.filter(room => !removedRoomIds.has(room.id))
          .map(room => room.memberIds.includes(bot.id)
            ? { ...room, memberIds: room.memberIds.filter(member => member !== bot.id), updatedAt: now() }
            : room),
        messages: state.messages.filter(item => !removedRoomIds.has(item.roomId)),
        runs: state.runs.filter(run => !touches(run.roomId, run.botId)),
        mailbox: state.mailbox.filter(item => !touches(item.roomId, item.botId)),
        roomAgentSessions: state.roomAgentSessions.filter(link => !touches(link.roomId, link.botId)),
      })
    })
  }

  /** Quiesce and delete hidden Agent Sessions before their Community records are dropped. */
  private async removeSessions(sessionIds: ReadonlySet<SessionId>): Promise<void> {
    const agents = this.ctx.get('agents')
    if (agents?.dispose !== undefined) {
      await Promise.all([...sessionIds].map(sessionId => agents.dispose(sessionId)))
    }
    // Older/non-loop providers may not expose a tracked handle. Quiesce any
    // remaining live Agent before removing its durable artifact.
    const liveAgents = [...sessionIds]
      .map(sessionId => agents?.get(sessionId))
      .filter((agent): agent is NonNullable<typeof agent> => agent !== undefined)
    for (const agent of liveAgents) agent.cancel({ kind: 'disposed' }, { keepInbox: false })
    await Promise.all(liveAgents.map(agent => agent.whenIdle()))
    await Promise.all(liveAgents.map(agent => this.ctx.sessions.flush(agent.session).catch(() => undefined)))
    const persistence = this.ctx.get('sessionPersistence') as { remove(id: SessionId): Promise<void> } | undefined
    if (persistence !== undefined) await Promise.all([...sessionIds].map(sessionId => persistence.remove(sessionId)))
    // The projection cache keeps a per-Session fold shortcut that includes prompt text; drop it with the log.
    const projections = this.ctx.get('sessionProjectionCache') as { remove?: (id: SessionId) => Promise<void> } | undefined
    const removeProjection = projections?.remove?.bind(projections)
    if (removeProjection !== undefined) await Promise.all([...sessionIds].map(sessionId => removeProjection(sessionId)))
  }

  async sendRoomMessage(input: SendRoomMessageRequest): Promise<BotMessage> {
    return this.serial(async () => {
      const state = await this.read()
      const room = state.rooms.find(item => item.id === input.roomId)
      if (room === undefined) throw new Error('room not found')
      const text = assertText(input.text, 'room message')
      const mentions = this.mentions(state, room, text)
      // Explicit mentions remain authoritative. Without an @, route by the
      // request's content: one best-fit Agent for ordinary work, all matching
      // Agents for explicit multi-party/collaboration needs, and a stable
      // round-robin fallback when no profile vocabulary matches.
      const recipients = this.resolveRecipients(state, room, text, mentions)
      // A room an Agent paused by addressing @user is waiting for exactly this message; resume it so
      // the reply is not queued behind the pause. A pause with no such question stays in force.
      const roomMessages = state.messages.filter(item => item.roomId === room.id)
      const sinceUser = roomMessages.slice(roomMessages.findLastIndex(item => item.sender.kind === 'user') + 1)
      const resume = room.paused === true && sinceUser.some(item => item.sender.kind === 'bot' && USER_MENTION.test(item.text))
      const pending = state.runs.filter(run => run.status === 'queued' || run.status === 'running').length
      if (state.messages.length + 1 + recipients.length + pending > this.config.maxMessages) throw new Error('agent community message limit reached')
      if (state.runs.length + recipients.length > this.config.maxRuns) throw new Error('agent community run limit reached')
      const roomAgentSessions = [...state.roomAgentSessions]
      const createdRuns: BotRun[] = recipients.map(botId => {
        let link = roomAgentSessions.find(item => item.roomId === room.id && item.botId === botId)
        if (link === undefined) {
          link = { roomId: room.id, botId, sessionId: SessionId(id('session-bot')) }
          roomAgentSessions.push(link)
        }
        const timestamp = now()
        return {
          id: id<BotRunId>('run'), botId, roomId: room.id, sessionId: link.sessionId, origin: 'user', prompt: text,
          status: 'queued', controlRevision: 0, attempt: 0, maxAttempts: 3, createdAt: timestamp, updatedAt: timestamp,
        }
      })
      const sequence = room.sequence + 1
      const message: BotMessage = {
        id: id<BotMessageId>('message'), roomId: room.id,
        sender: { kind: 'user', name: input.senderName?.trim() || 'user' }, text, mentions,
        createdAt: now(), sequence, ...(createdRuns.length ? { runIds: createdRuns.map(run => run.id) } : {}),
      }
      const mailbox: BotMailboxItem[] = createdRuns.map(run => ({ id: id('mailbox'), roomId: room.id, botId: run.botId, messageId: message.id, sequence, status: 'pending', createdAt: message.createdAt }))
      const rooms = state.rooms.map(item => item.id === room.id
        ? { ...item, sequence, updatedAt: now(), ...(resume ? { paused: false } : {}) }
        : item)
      await this.write({
        ...state, rooms, messages: [...state.messages, message], runs: [...state.runs, ...createdRuns.map(run => ({ ...run, roomSequence: sequence, rootMessageId: message.id, round: 1 }))], mailbox: [...state.mailbox, ...mailbox], roomAgentSessions,
      })
      return message
    })
  }

  /** Adopt a scheduler-delivered prompt into the owning Community room without duplicating the Session input. */
  async adoptRoutine(input: RoutineCommunityDispatch): Promise<BotRun | undefined> {
    return this.serial(async () => {
      const state = await this.read()
      const link = state.roomAgentSessions.find(item => item.sessionId === input.sessionId)
      if (link === undefined) return undefined
      const room = state.rooms.find(item => item.id === link.roomId)
      const bot = state.bots.find(item => item.id === link.botId)
      if (room === undefined || bot === undefined || !room.memberIds.includes(bot.id)) return undefined
      const existing = state.runs.find(run => run.sessionId === input.sessionId && run.requestId === input.requestId)
      if (existing !== undefined) return existing
      const timestamp = now()
      const sequence = room.sequence + 1
      const message: BotMessage = {
        id: id<BotMessageId>('message'), roomId: room.id,
        sender: { kind: 'routine', botId: bot.id, name: 'Routine' }, text: input.text, mentions: [],
        createdAt: timestamp, sequence,
      }
      const run: BotRun = {
        id: id<BotRunId>('run'), botId: bot.id, roomId: room.id, sessionId: input.sessionId,
        origin: 'routine', prompt: input.text, status: 'queued', controlRevision: 0,
        createdAt: timestamp, updatedAt: timestamp, attempt: 0, maxAttempts: 3,
        roomSequence: sequence, rootMessageId: message.id, round: 1,
        requestId: input.requestId, submission: 'submitted',
      }
      const mailbox: BotMailboxItem = { id: id('mailbox'), roomId: room.id, botId: bot.id, messageId: message.id, sequence, status: 'pending', createdAt: timestamp }
      await this.write({
        ...state,
        rooms: state.rooms.map(item => item.id === room.id ? { ...item, sequence, updatedAt: timestamp } : item),
        messages: [...state.messages, { ...message, runId: run.id, runIds: [run.id], sessionId: input.sessionId }],
        runs: [...state.runs, run], mailbox: [...state.mailbox, mailbox],
      })
      return run
    })
  }

  /** Durable claims serialize each Bot and room and fence stale processes. */
  async claimRun(runId: BotRunId, owner = this.ownerId): Promise<BotRun | undefined> {
    return this.serial(async () => {
      const state = await this.read()
      const current = state.runs.find(run => run.id === runId)
      if (!current || !['queued', 'running'].includes(current.status)) return undefined
      const room = state.rooms.find(item => item.id === current.roomId)
      if (!room?.memberIds.includes(current.botId) || room.paused) return undefined
      const clock = Date.now()
      if (Date.parse(current.nextRetryAt ?? '') > clock) return undefined
      const leaseExpiry = Date.parse(current.leaseExpiresAt ?? '')
      const leaseExpired = current.status === 'running' && (!Number.isFinite(leaseExpiry) || leaseExpiry <= clock)
      if (current.status === 'running' && !leaseExpired) return undefined
      const competing = state.runs.filter(run => run.id !== current.id && ['queued', 'running'].includes(run.status)
        && (run.botId === current.botId || run.roomId === current.roomId))
      if (competing.some(run => run.status === 'running' && Date.parse(run.leaseExpiresAt ?? '') > clock)) return undefined
      if (competing.some(run => state.runs.indexOf(run) < state.runs.indexOf(current)
        && !state.rooms.find(item => item.id === run.roomId)?.paused)) return undefined
      const timestamp = now()
      const attempt = current.status === 'running' ? current.attempt + 1 : current.attempt + 1
      if (attempt > current.maxAttempts) {
        // An exhausted run must settle, otherwise it blocks every later run of the same room and Bot.
        const { leaseOwner: _owner, leaseExpiresAt: _lease, nextRetryAt: _next, ...base } = current
        const exhausted: BotRun = { ...base, status: 'failed', controlRevision: current.controlRevision + 1, updatedAt: timestamp, finishedAt: timestamp,
          error: current.error ?? current.lastError ?? 'Agent run exhausted its retry attempts' }
        await this.write({ ...state, runs: state.runs.map(run => run.id === runId ? exhausted : run),
          mailbox: state.mailbox.map(item => item.roomId === current.roomId && item.botId === current.botId && item.sequence === current.roomSequence ? { ...item, status: 'settled', settledAt: timestamp } : item),
          bots: state.bots.map(bot => bot.id === current.botId ? { ...bot, presence: 'failed' } : bot) })
        return undefined
      }
      const claimed: BotRun = { ...current, status: 'running', attempt, controlRevision: current.controlRevision + 1,
        startedAt: current.startedAt ?? timestamp, lastHeartbeatAt: timestamp, updatedAt: timestamp,
        leaseOwner: owner, leaseExpiresAt: new Date(clock + 30_000).toISOString(),
        requestId: leaseExpired ? `${current.id}:attempt:${attempt}` : current.requestId ?? `${current.id}:attempt:${attempt}`,
        submission: leaseExpired ? 'pending' : current.submission ?? 'pending',
        lastSeenSequence: state.roomAgentSessions.find(link => link.roomId === current.roomId && link.botId === current.botId)?.lastSeenSequence ?? 0 }
      await this.write({ ...state, runs: state.runs.map(run => run.id === runId ? claimed : run),
        mailbox: state.mailbox.map(item => item.roomId === claimed.roomId && item.botId === claimed.botId && item.sequence === claimed.roomSequence ? { ...item, status: 'claimed', claimedAt: timestamp } : item),
        bots: state.bots.map(bot => bot.id === claimed.botId ? { ...bot, presence: 'running' } : bot) })
      return claimed
    })
  }

  /** Replace a legacy room Session that predates the agent-community origin marker. */
  async rebindRunSession(runId: BotRunId, revision: number, owner: string, sessionId: SessionId): Promise<BotRun | undefined> {
    return this.serial(async () => {
      const state = await this.read()
      const current = state.runs.find(run => run.id === runId)
      if (current === undefined || current.status !== 'running' || current.controlRevision !== revision
        || current.leaseOwner !== owner || !(Date.parse(current.leaseExpiresAt ?? '') > Date.now())) return undefined
      const updated: BotRun = { ...current, sessionId, updatedAt: now() }
      await this.write({
        ...state,
        runs: state.runs.map(run => run.id === runId ? updated : run),
        roomAgentSessions: state.roomAgentSessions.map(link => link.roomId === current.roomId && link.botId === current.botId
          ? { ...link, sessionId } : link),
      })
      return updated
    })
  }

  async heartbeat(runId: BotRunId, revision: number, owner: string): Promise<boolean> {
    return this.serial(async () => {
      const state = await this.read()
      const run = state.runs.find(item => item.id === runId)
      if (!run || run.status !== 'running' || run.controlRevision !== revision || run.leaseOwner !== owner
        || !(Date.parse(run.leaseExpiresAt ?? '') > Date.now())) return false
      await this.write({ ...state, runs: state.runs.map(item => item.id === runId
        ? { ...item, lastHeartbeatAt: now(), leaseExpiresAt: new Date(Date.now() + 30_000).toISOString() } : item) })
      return true
    })
  }
  /** Admit a prompt under the lease, then persist the receipt after submission. */
  async dispatchRun(runId: BotRunId, submit: () => Promise<void>, revision?: number, owner = this.ownerId): Promise<boolean> {
    const admitted = await this.serial(async () => {
      const state = await this.read()
      const run = state.runs.find(item => item.id === runId)
      const room = state.rooms.find(item => item.id === run?.roomId)
      if (!run || run.status !== 'running' || run.leaseOwner !== owner || (revision !== undefined && run.controlRevision !== revision)
        || !(Date.parse(run.leaseExpiresAt ?? '') > Date.now()) || !room?.memberIds.includes(run.botId) || room.paused) return false
      await this.write({ ...state, runs: state.runs.map(item => item.id === runId ? { ...item, submission: 'submitting' as const } : item) })
      return true
    })
    if (!admitted) return false
    await submit()
    return this.serial(async () => {
      const state = await this.read()
      const run = state.runs.find(item => item.id === runId)
      if (!run || run.status !== 'running' || run.leaseOwner !== owner || (revision !== undefined && run.controlRevision !== revision)) return false
      await this.write({ ...state, runs: state.runs.map(item => item.id === runId ? { ...item, submission: 'submitted' as const } : item) })
      return true
    })
  }
  async settleRun(input: SettleBotRunRequest): Promise<boolean> {
    return this.serial(async () => {
      const state = await this.read()
      const current = state.runs.find(run => run.id === input.id)
      if (!current || current.status !== 'running' || current.controlRevision !== input.expectedRevision
        || current.leaseOwner !== (input.leaseOwner ?? this.ownerId) || !(Date.parse(current.leaseExpiresAt ?? '') > Date.now())) return false
      const room = state.rooms.find(item => item.id === current.roomId)
      if (!room?.memberIds.includes(current.botId)) return false
      const timestamp = now()
      const { leaseOwner: _owner, leaseExpiresAt: _lease, nextRetryAt: _next, ...base } = current
      let updated: BotRun = { ...base, status: input.status, controlRevision: current.controlRevision + 1,
        updatedAt: timestamp, finishedAt: timestamp, ...(input.error === undefined ? {} : { error: input.error.slice(0, 1000) }) }
      const messages = [...state.messages]
      const roomAgentSessions = [...state.roomAgentSessions]
      const followups: BotRun[] = []
      let sequence = room.sequence
      let paused = room.paused ?? false
      if (input.status === 'completed' && input.reply !== undefined) {
        if (messages.length >= this.config.maxMessages) throw new Error('agent community message limit reached')
        const bot = state.bots.find(item => item.id === current.botId)
        if (!bot) throw new Error('run bot not found')
        const text = assertText(input.reply.text, 'bot reply', 200_000)
        const mentions = this.mentions(state, room, text).filter(botId => botId !== current.botId)
        paused ||= USER_MENTION.test(text)
        const messageId = id<BotMessageId>('message')
        const rootMessageId = current.rootMessageId ?? state.messages.find(item => item.runIds?.includes(current.id))?.id ?? messageId
        sequence++
        const family = state.runs.filter(item => item.rootMessageId === rootMessageId || item.id === current.id)
        const rootMessage = state.messages.find(item => item.id === rootMessageId)
        const relayRecipients = this.resolveRelayRecipients(state, room, rootMessage?.text ?? current.prompt, text, mentions, family)
        const remaining = Math.max(0, 10 - family.length)
        if (!paused && room.directBotId === undefined && (current.round ?? 1) < 3) {
          for (const botId of relayRecipients.slice(0, remaining)) {
            if (family.some(run => run.botId === botId && ['queued', 'running'].includes(run.status))) continue
            if (state.runs.length + followups.length >= this.config.maxRuns) break
            let link = roomAgentSessions.find(item => item.roomId === room.id && item.botId === botId)
            if (!link) { link = { roomId: room.id, botId, sessionId: SessionId(id('session-bot')) }; roomAgentSessions.push(link) }
            followups.push({ id: id<BotRunId>('run'), botId, roomId: room.id, sessionId: link.sessionId, origin: 'bot-message', prompt: text,
              status: 'queued', attempt: 0, maxAttempts: 3, controlRevision: 0, createdAt: timestamp, updatedAt: timestamp,
              roomSequence: sequence, rootMessageId, round: (current.round ?? 1) + 1 })
          }
        }
        const startedAt = Date.parse(current.startedAt ?? current.createdAt)
        const durationMs = Number.isFinite(startedAt) ? Math.max(0, Date.parse(timestamp) - startedAt) : undefined
        messages.push({ id: messageId, roomId: room.id, sender: { kind: 'bot', botId: bot.id, name: bot.name }, text, mentions, sequence,
          createdAt: timestamp, runId: current.id, runIds: followups.map(run => run.id), sessionId: current.sessionId, sessionSeq: input.reply.sessionSeq,
          ...(durationMs === undefined ? {} : { durationMs }),
          ...(input.reply.reasoning === undefined ? {} : { reasoning: input.reply.reasoning }),
          ...(input.reply.toolActivity === undefined ? {} : { toolActivity: input.reply.toolActivity }),
          ...(input.reply.usage === undefined ? {} : { usage: input.reply.usage }) })
      }
      if (input.status === 'failed' && input.retry === true && current.attempt < current.maxAttempts) {
        const { finishedAt: _finished, requestId: _request, submission: _submission, error: failure, ...retry } = updated
        updated = { ...retry, status: 'queued', ...(failure === undefined ? {} : { lastError: failure }), nextRetryAt: new Date(Date.now() + Math.min(30_000, 500 * 2 ** current.attempt)).toISOString() }
      }
      const runs = [...state.runs.map(run => run.id === current.id ? updated
        : paused && run.roomId === room.id && run.status === 'queued' && run.origin === 'bot-message'
          ? { ...run, status: 'cancelled' as const, controlRevision: run.controlRevision + 1, finishedAt: timestamp, updatedAt: timestamp } : run), ...followups]
      const settledMessage = messages.find(item => item.runId === current.id)
      const mailbox: BotMailboxItem[] = [...state.mailbox.map(item => item.roomId === current.roomId && item.botId === current.botId && item.sequence === current.roomSequence
        ? { ...item, status: updated.status === 'queued' ? 'pending' as const : 'settled' as const, ...(updated.status === 'queued' ? {} : { settledAt: timestamp }) } : item),
        ...followups.flatMap(run => settledMessage === undefined ? [] : [{ id: id<string>('mailbox'), roomId: room.id, botId: run.botId, messageId: settledMessage.id, sequence, status: 'pending' as const, createdAt: timestamp }])]
      await this.write({ ...state, messages, runs, mailbox,
        rooms: state.rooms.map(item => item.id === room.id ? { ...item, sequence, paused, updatedAt: timestamp } : item),
        roomAgentSessions: roomAgentSessions.map(link => link.roomId === room.id && link.botId === current.botId && input.status === 'completed'
          ? { ...link, lastSeenSequence: Math.max(link.lastSeenSequence ?? 0, current.roomSequence ?? 0) } : link),
        bots: state.bots.map(bot => ({ ...bot, presence: runs.some(run => run.botId === bot.id && run.status === 'running') ? 'running'
          : runs.some(run => run.botId === bot.id && run.status === 'queued') ? 'queued' : bot.id === current.botId && input.status === 'failed' ? 'failed' : 'idle' })) })
      return true
    })
  }

  private resolveRecipients(state: PersistedState, room: BotRoom, text: string, mentions: readonly BotId[]): BotId[] {
    if (room.directBotId !== undefined) return [room.directBotId]
    const explicit = [...new Set(mentions)].filter(botId => room.memberIds.includes(botId))
    if (explicit.length > 0) return explicit
    if (room.memberIds.length === 0 || room.policy === 'mention-only' || room.mentionOnly) return []

    const eligible = this.eligibleRecipients(state, room)
    if (eligible.length === 0) return []
    const content = text.toLocaleLowerCase()
    const scored = this.scoreRecipients(state, eligible, content)
    const max = Math.max(...scored.map(item => item.score), 0)
    if (max > 0) return scored.filter(item => item.score === max).map(item => item.botId)

    // Start one stable lead for an unmentioned message. Broadcast-shaped
    // content is expanded only after that lead replies, so the room does not
    // create N simultaneous turns and can still stop after a sufficient reply.
    return [eligible[room.sequence % eligible.length] as BotId]
  }

  private resolveRelayRecipients(
    state: PersistedState,
    room: BotRoom,
    rootText: string,
    replyText: string,
    mentions: readonly BotId[],
    family: readonly BotRun[],
  ): BotId[] {
    const alreadyInFamily = new Set(family.map(run => run.botId))
    const explicit = [...new Set(mentions)].filter(botId => room.memberIds.includes(botId) && !alreadyInFamily.has(botId))
    if (explicit.length > 0) return explicit
    if (room.directBotId !== undefined || room.policy === 'mention-only' || room.mentionOnly) return []

    const eligible = this.eligibleRecipients(state, room).filter(botId => !alreadyInFamily.has(botId))
    if (eligible.length === 0) return []
    const rootContent = rootText.toLocaleLowerCase()
    const replyContent = replyText.toLocaleLowerCase()
    const broadRequest = this.isBroadRequest(rootContent)
    // A group greeting is addressed to the room, not just the stable lead:
    // let the lead answer first, then relay the same turn to the remaining
    // eligible members so the room does not look like a single-Agent chat.
    if (this.isGreeting(rootContent)) return eligible
    if (!broadRequest && !this.isRelayRequest(replyContent)) return []
    if (broadRequest) return eligible

    const scored = this.scoreRecipients(state, eligible, replyContent)
    const max = Math.max(...scored.map(item => item.score), 0)
    if (max > 0) return scored.filter(item => item.score === max).map(item => item.botId)
    // A lead may explicitly ask for another Agent without naming one. Pick
    // only the next stable participant; the next round cannot fan out again.
    return [eligible[0] as BotId]
  }

  private eligibleRecipients(state: PersistedState, room: BotRoom): BotId[] {
    return room.memberIds.filter(botId => state.bots.some(bot => bot.id === botId && bot.mentionOnly !== true))
  }

  private scoreRecipients(state: PersistedState, botIds: readonly BotId[], content: string): { botId: BotId; score: number }[] {
    return botIds.map(botId => {
      const bot = state.bots.find(item => item.id === botId)
      if (bot === undefined) return { botId, score: 0 }
      // System prompts contain generic operational words and are not routing
      // vocabulary. Only the Agent name and description may select a reply.
      const terms = new Set([
        bot.name,
        ...bot.description.split(/[^\p{L}\p{N}]+/u),
      ].map(term => term.trim().toLocaleLowerCase()).filter(term => term.length >= 2))
      return { botId, score: [...terms].reduce((total, term) => content.includes(term) ? total + Math.min(8, term.length) : total, 0) }
    })
  }

  private isBroadRequest(content: string): boolean {
    return /(?:\b(?:all|everyone|each|every|multiple|several|compare|comparison|collaborat|debate|discuss|different viewpoints)\b|全部|所有|每个|分别|各自|多个|多名|协作|合作|讨论|比较|不同观点|共同)/iu.test(content)
  }

  private isRelayRequest(content: string): boolean {
    return /(?:\b(?:consult|delegate|handoff|invite|ask|bring in|another agent|other agent|second opinion|expert)\b|(?:请|需要|让|交给|转给|邀请|咨询).{0,16}(?:其他|另一位|下一个|agent|智能体|专家|同事|参与))/iu.test(content)
  }

  private isGreeting(content: string): boolean {
    return /^(?:hi|hello|hey|嗨|你好|您好|早上好|晚上好|大家好)[\s!！,.，。?？~～]*$/iu.test(content.trim())
  }

  private mentions(state: PersistedState, room: BotRoom, text: string): BotId[] {
    const content = text.replace(/```[\s\S]*?```|`[^`]*`/gu, '').replace(/^>.*$/gmu, '')
    if (/(?<![\w@.])@(all|everyone)(?![\w-])/iu.test(content)) return [...room.memberIds]
    return room.memberIds.filter(botId => {
      const bot = state.bots.find(item => item.id === botId)
      return bot !== undefined && new RegExp(`(?<![a-z0-9_@.-])@${escapeRegExp(bot.name)}(?![a-z0-9_-])`, 'iu').test(content)
    })
  }
  async controlRun(input: ControlBotRunRequest): Promise<BotRun> {
    return this.serial(async () => {
      const state = await this.read(); const current = state.runs.find(run => run.id === input.id)
      if (current === undefined) throw new Error('bot run not found')
      if (current.controlRevision !== input.expectedRevision) throw new Error('bot run changed; refresh before controlling it')
      if (current.status !== 'queued' && current.status !== 'running') throw new Error('bot run is already terminal')
      if (input.action === 'steer') {
        if (current.status !== 'running' || current.sessionId === undefined) throw new Error('bot run is not live')
        const agent = this.ctx.get('agents')?.get(current.sessionId)
        const text = assertText(input.text ?? '', 'steer text')
        if (agent === undefined || agent.status !== 'running') throw new Error('bot is not live')
        agent.steer(createUserMessage({ content: [{ type: 'text', text }], source: { kind: 'user' } }))
        await this.ctx.sessions.flush(agent.session)
        return current
      }
      const agent = current.status === 'running' && current.sessionId !== undefined
        ? this.ctx.get('agents')?.get(current.sessionId)
        : undefined
      agent?.cancel({ kind: 'user' }, { keepInbox: false })
      if (agent !== undefined) await this.ctx.sessions.flush(agent.session)
      const status = input.action === 'cancel' ? 'cancelled' : input.action === 'interrupt' ? 'interrupted' : current.status
      const updated: BotRun = { ...current, status, controlRevision: current.controlRevision + 1, updatedAt: now(), finishedAt: now() }
      await this.write({
        ...state,
        runs: state.runs.map(run => run.id === current.id ? updated : run),
        mailbox: state.mailbox.map(item => item.roomId === current.roomId && item.botId === current.botId && item.sequence === current.roomSequence ? { ...item, status: 'settled', settledAt: now() } : item),
        bots: state.bots.map(bot => bot.id === current.botId ? { ...bot, presence: 'idle' } : bot),
      })
      return updated
    })
  }

  private async read(): Promise<PersistedState> {
    try {
      const raw = JSON.parse(await readFile(this.path, 'utf8')) as Partial<PersistedState> & {
        readonly runs?: readonly (Partial<BotRun> & Pick<BotRun, 'id' | 'botId' | 'roomId' | 'origin' | 'prompt' | 'status' | 'controlRevision' | 'createdAt' | 'updatedAt'>)[]
      }
      const rawVersion = Number(raw.version)
      if ((rawVersion !== 2 && rawVersion !== 1) || !Array.isArray(raw.bots) || !Array.isArray(raw.rooms) || !Array.isArray(raw.messages) || !Array.isArray(raw.runs)) {
        throw new Error('unsupported or corrupt Bot state; original file preserved')
      }
      const rooms = raw.rooms.map(room => ({
        ...room,
        policy: room.policy ?? (room.mentionOnly ? 'mention-only' : 'round-robin') as 'mention-only' | 'round-robin',
        sequence: room.sequence ?? (raw.messages ?? []).filter(message => message.roomId === room.id).length,
      })) as readonly BotRoom[]
      const runs = raw.runs.map(run => run.sessionId === undefined
        ? {
          ...run,
          sessionId: SessionId(`legacy-${run.id}`),
          status: 'interrupted' as const,
          error: 'Legacy prototype run has no Session receipt; send a new message to execute it.',
        }
        : run) as readonly BotRun[]
      const bots = raw.bots.map(bot => ({ ...bot, profile: withoutAutoCredentialNamespace(bot.profile ?? { profileId: String(bot.id), memoryNamespace: `bot:${String(bot.id)}:memory`, skillScope: String(bot.id) }, bot) })) as readonly BotIdentity[]
      const filteredBots = bots.filter(bot => bot.builtIn !== true && bot.id !== 'bot-default' && bot.name !== 'default')
      const filteredBotIds = new Set(filteredBots.map(bot => bot.id))
      const filteredRooms = rooms.filter(room => room.id !== 'room-lobby' && room.name !== 'Lobby')
        .map(room => ({ ...room, memberIds: room.memberIds.filter(botId => filteredBotIds.has(botId)) }))
        .filter(room => room.directBotId !== undefined ? filteredBotIds.has(room.directBotId) : room.memberIds.length > 0)
      return { ...raw, version: 2, bots: filteredBots, rooms: filteredRooms.map(room => ({ ...room, connection: room.connection ?? 'connected' })), runs: runs.map(run => ({ ...run, attempt: run.attempt ?? 0, maxAttempts: run.maxAttempts ?? 3 })), mailbox: raw.mailbox ?? [], roomAgentSessions: raw.roomAgentSessions ?? [] } as PersistedState
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
      return defaultState()
    }
  }
  private async write(state: PersistedState): Promise<void> {
    await mkdir(join(this.path, '..'), { recursive: true, mode: 0o700 })
    await writeFileAtomic(this.path, JSON.stringify(state) + '\n', { mode: 0o600, dirMode: 0o700 })
  }
  private serial<T>(operation: () => Promise<T>): Promise<T> {
    const next = this.tail.then(async () => {
      await mkdir(join(this.path, '..'), { recursive: true, mode: 0o700 })
      return withFileLock(this.lockPath, operation, { waitMs: 10_000 })
    })
    this.tail = next.catch(() => {})
    return next
  }
}

export function apply(ctx: Context, config: Config): void { ctx.provide('agentCommunity', new AgentCommunityService(ctx, config)) }
