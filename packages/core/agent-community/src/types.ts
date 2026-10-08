import type { SessionId, SessionSeq } from '@deepseek-ai/dsh-session/types'

export type BotId = string & { readonly __brand: 'BotId' }
export type BotRoomId = string & { readonly __brand: 'BotRoomId' }
export type BotRunId = string & { readonly __brand: 'BotRunId' }
export type BotMessageId = string & { readonly __brand: 'BotMessageId' }

export type BotRunStatus = 'queued' | 'running' | 'completed' | 'interrupted' | 'failed' | 'cancelled'
export type BotPresence = 'idle' | 'queued' | 'running' | 'waiting-human' | 'failed' | 'offline'
export type BotRoomPolicy = 'mention-only' | 'round-robin'
export type BotMessageSenderKind = 'user' | 'bot' | 'a2a' | 'routine' | 'leader'
export type BotConnectionState = 'connected' | 'reconnecting' | 'disconnected'

/** Run origins created by team rooms; every other origin belongs to ordinary rooms. */
export type BotTeamRunOrigin = 'team-assign' | 'team-message' | 'team-report' | 'team-user'
/** Presentation role of one team-room message. */
export type BotTeamMessageKind = 'assign' | 'message' | 'report' | 'summary' | 'notice'

/**
 * The lead of one team room. A `session` lead is the user's own conversation
 * (main or direct chat) that assembled the team; a `bot` lead is a member Agent
 * chosen when the user created a fixed team.
 */
export type BotTeamLeader =
  | { readonly kind: 'session'; readonly sessionId: SessionId }
  | { readonly kind: 'bot'; readonly botId: BotId }

/** Team configuration carried by a team room; absent on ordinary group chats and direct chats. */
export interface BotTeam {
  readonly leader: BotTeamLeader
  /** Model- and UI-facing lead name; `lead` is the addressable target in team tools. */
  readonly leaderName: string
  /** Shared working directory of every member Session; the lead Session cwd for session-led teams. */
  readonly workspace?: string
  readonly status: 'active' | 'dismissed'
}

export interface BotAvatar {
  readonly seed: string
  readonly locked: boolean
  readonly assetPath?: string
}

export interface BotProfileBinding {
  readonly profileId: string
  readonly scopeId?: string
  readonly memoryNamespace: string
  readonly skillScope?: string
  readonly agentPreset?: string
  readonly credentialNamespace?: string
}

export interface BotIdentity {
  readonly id: BotId
  readonly name: string
  readonly description: string
  readonly avatar: BotAvatar
  readonly provider?: string
  readonly model?: string
  readonly workspace?: string
  readonly systemPrompt?: string
  readonly mentionOnly?: boolean
  readonly presence?: BotPresence
  readonly profile: BotProfileBinding
  readonly builtIn?: boolean
  readonly createdAt: string
  readonly updatedAt: string
}

export interface BotMailboxItem {
  readonly id: string
  readonly roomId: BotRoomId
  readonly botId: BotId
  readonly messageId: BotMessageId
  readonly sequence: number
  readonly status: 'pending' | 'claimed' | 'settled'
  readonly createdAt: string
  readonly claimedAt?: string
  readonly settledAt?: string
}

export interface BotRoom {
  readonly directBotId?: BotId
  readonly id: BotRoomId
  readonly name: string
  readonly imagePath?: string
  readonly memberIds: readonly BotId[]
  readonly mentionOnly: boolean
  readonly policy?: BotRoomPolicy
  readonly sequence: number
  readonly connection: BotConnectionState
  readonly paused?: boolean
  readonly revision?: number
  readonly createdAt: string
  readonly updatedAt: string
  /** Present on team rooms only. */
  readonly team?: BotTeam
  /** Read-only view filled by snapshots: each member's hidden room Session, keyed by Bot id. */
  readonly memberSessions?: Readonly<Record<string, SessionId>>
}

export interface DeleteRoomRequest {
  readonly id: string
}

export interface DeleteBotRequest {
  readonly id: string
}

export interface UpdateRoomRequest {
  readonly id: string
  readonly name?: string
  readonly imagePath?: string
  readonly memberIds?: readonly string[]
  readonly mentionOnly?: boolean
  readonly paused?: boolean
}

export interface BotMessageUsage {
  readonly uncachedInputTokens: number
  readonly outputTokens: number
  readonly totalTokens: number
  readonly cacheReadTokens?: number
  readonly cacheWriteTokens?: number
  readonly reasoningTokens?: number
  readonly routes?: readonly { readonly provider: string; readonly model: string }[]
}

export interface BotMessage {
  readonly id: BotMessageId
  readonly roomId: BotRoomId
  readonly sender: { readonly kind: BotMessageSenderKind; readonly botId?: BotId; readonly name: string }
  readonly text: string
  readonly mentions: readonly BotId[]
  readonly createdAt: string
  readonly runId?: BotRunId
  readonly runIds?: readonly BotRunId[]
  readonly sessionId?: SessionId
  readonly sessionSeq?: SessionSeq
  readonly reasoning?: string
  readonly toolActivity?: readonly { readonly name: string; readonly status: string; readonly detail?: string }[]
  readonly usage?: BotMessageUsage
  /** Wall-clock duration from run admission to the persisted Agent reply. */
  readonly durationMs?: number
  readonly sequence?: number
  /** Team-room presentation role; absent in ordinary rooms. */
  readonly kind?: BotTeamMessageKind
  /** Team-room addressees by name (`lead`, member names, or `all`). */
  readonly targetNames?: readonly string[]
}

export interface BotRun {
  readonly id: BotRunId
  readonly botId: BotId
  readonly roomId: BotRoomId
  readonly sessionId: SessionId
  readonly origin: 'user' | 'routine' | 'a2a' | 'bot-message' | BotTeamRunOrigin
  readonly prompt: string
  /** Team assignment metadata: the subject the lead gave and who dispatched it. */
  readonly assignment?: { readonly subject: string; readonly fromName: string }
  /** The member Session is blocked on a human approval; derived presence is `waiting-human`. */
  readonly awaitingApproval?: boolean
  readonly status: BotRunStatus
  readonly controlRevision: number
  readonly createdAt: string
  readonly updatedAt: string
  readonly error?: string
  readonly lastError?: string
  readonly startedAt?: string
  readonly finishedAt?: string
  readonly roomSequence?: number
  readonly attempt: number
  readonly maxAttempts: number
  readonly nextRetryAt?: string
  readonly lastHeartbeatAt?: string
  readonly leaseOwner?: string
  readonly leaseExpiresAt?: string
  readonly requestId?: string
  readonly submission?: 'pending' | 'submitting' | 'submitted'
  readonly rootMessageId?: BotMessageId
  readonly round?: number
  readonly lastSeenSequence?: number
}

export interface BotCommunitySnapshot {
  readonly bots: readonly BotIdentity[]
  readonly rooms: readonly BotRoom[]
  readonly messages: readonly BotMessage[]
  readonly runs: readonly BotRun[]
  readonly mailbox: readonly BotMailboxItem[]
}

export interface CreateBotRequest {
  readonly name: string
  readonly description?: string
  readonly avatarSeed?: string
  readonly avatarLocked?: boolean
  readonly provider?: string
  readonly model?: string
  readonly workspace?: string
  readonly systemPrompt?: string
  readonly mentionOnly?: boolean
  readonly profile?: Partial<BotProfileBinding>
}

export interface UpdateBotRequest {
  readonly id: string
  readonly name?: string
  readonly description?: string
  readonly avatarSeed?: string
  readonly avatarLocked?: boolean
  readonly provider?: string
  readonly model?: string
  readonly workspace?: string
  readonly systemPrompt?: string
  readonly profile?: Partial<BotProfileBinding>
  readonly mentionOnly?: boolean
}

/** Redacted status of one Bot-scoped LLM credential reference. */
export interface BotCredentialInfo {
  readonly botId: BotId
  readonly ref: string
  readonly namespace: string
  readonly configured: boolean
  readonly source?: string
  readonly writable: boolean
}

/** Team configuration accepted by `createRoom`; exactly one of the lead fields is set. */
export interface CreateTeamRequest {
  readonly leaderBotId?: string
  readonly leaderSessionId?: string
  readonly leaderName: string
  readonly workspace?: string
}

/** One durable team-room message plus the member runs it dispatches. */
export interface PostTeamMessageRequest {
  readonly roomId: string
  readonly sender: { readonly kind: 'leader' | 'bot' | 'user'; readonly botId?: string; readonly name: string }
  readonly text: string
  readonly kind: BotTeamMessageKind
  /** Members that receive a run for this message; empty when only the lead Session is addressed. */
  readonly targetBotIds: readonly string[]
  readonly targetNames: readonly string[]
  readonly origin: BotTeamRunOrigin
  readonly assignment?: { readonly subject: string; readonly fromName: string }
}

/** The committed team-room message and the member runs it queued. */
export interface TeamMessageResult {
  readonly message: BotMessage
  readonly runs: readonly BotRun[]
}

export interface DismissTeamRequest {
  readonly roomId: string
  readonly summary: string
}

/** One member approval waiting for a person, raised by a hidden team member Session. */
export interface TeamApproval {
  readonly id: string
  readonly roomId: BotRoomId
  readonly memberName: string
  readonly sessionId: SessionId
  readonly toolName: string
  readonly reason?: string
  readonly createdAt: string
}

/** A person's decision on one {@link TeamApproval}. */
export interface TeamApprovalAnswer {
  readonly id: string
  readonly outcome: 'allowed-once' | 'rejected'
}

/** What the conversation that leads a team needs to show about it. */
export interface TeamOverview {
  readonly room: BotRoom
  readonly members: readonly {
    readonly botId: BotId
    readonly name: string
    readonly presence: BotPresence
    readonly sessionId?: SessionId
  }[]
  readonly approvals: readonly TeamApproval[]
}

/** Resolved team role of one live Session. */
export interface BotTeamMembership {
  readonly room: BotRoom
  readonly role: 'lead' | 'member'
  readonly name: string
  readonly botId?: BotId
}

export interface CreateRoomRequest {
  readonly directBotId?: string
  readonly name: string
  readonly memberIds?: readonly string[]
  readonly imagePath?: string
  readonly mentionOnly?: boolean
  readonly paused?: boolean
  /** Create a team room led by one member Agent or by one existing Session. */
  readonly team?: CreateTeamRequest
}

export interface SendRoomMessageRequest {
  readonly roomId: string
  readonly text: string
  readonly senderName?: string
}

export interface RetryBotRunRequest {
  readonly id: string
  readonly expectedRevision: number
}

export interface ControlBotRunRequest {
  /** Wire requests arrive from JSON without the runtime-only BotRunId brand marker. */
  readonly id: string
  readonly action: 'steer' | 'interrupt' | 'cancel'
  readonly expectedRevision: number
  readonly text?: string
  readonly retryFromAttempt?: number
}

export interface SettleBotRunRequest {
  readonly id: string
  readonly expectedRevision: number
  readonly status: 'completed' | 'interrupted' | 'failed'
  readonly error?: string
  readonly retry?: boolean
  readonly leaseOwner?: string
  readonly reply?: {
    readonly text: string
    readonly sessionSeq: SessionSeq
    readonly reasoning?: string
    readonly toolActivity?: readonly { readonly name: string; readonly status: string; readonly detail?: string }[]
    readonly usage?: BotMessageUsage
  }
}
