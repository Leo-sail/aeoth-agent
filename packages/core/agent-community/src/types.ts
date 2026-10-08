import type { SessionId, SessionSeq } from '@deepseek-ai/dsh-session/types'

export type BotId = string & { readonly __brand: 'BotId' }
export type BotRoomId = string & { readonly __brand: 'BotRoomId' }
export type BotRunId = string & { readonly __brand: 'BotRunId' }
export type BotMessageId = string & { readonly __brand: 'BotMessageId' }

export type BotRunStatus = 'queued' | 'running' | 'completed' | 'interrupted' | 'failed' | 'cancelled'
export type BotPresence = 'idle' | 'queued' | 'running' | 'waiting-human' | 'failed' | 'offline'
export type BotRoomPolicy = 'mention-only' | 'round-robin'
export type BotMessageSenderKind = 'user' | 'bot' | 'a2a' | 'routine'
export type BotConnectionState = 'connected' | 'reconnecting' | 'disconnected'

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
}

export interface BotRun {
  readonly id: BotRunId
  readonly botId: BotId
  readonly roomId: BotRoomId
  readonly sessionId: SessionId
  readonly origin: 'user' | 'routine' | 'a2a' | 'bot-message'
  readonly prompt: string
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

export interface CreateRoomRequest {
  readonly directBotId?: string
  readonly name: string
  readonly memberIds?: readonly string[]
  readonly imagePath?: string
  readonly mentionOnly?: boolean
  readonly paused?: boolean
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
  readonly reply?: { readonly text: string; readonly sessionSeq: SessionSeq; readonly reasoning?: string; readonly toolActivity?: readonly { readonly name: string; readonly status: string; readonly detail?: string }[]; readonly usage?: BotMessageUsage }
}
