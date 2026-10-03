/** Legacy/internal text part accepted at the inbound boundary. */
export interface AgentLinkPart { readonly kind: 'text'; readonly text: string }
/** A2A v1.0 JSON text part used in protocol responses and accepted on input. */
export interface AgentLinkProtocolPart { readonly text: string }
export interface AgentLinkProtoJsonTextPart { readonly content: { readonly $case: 'text'; readonly value: string } }
/** Inbound message accepts internal, JSON, and SDK-created v1 text part shapes. */
export interface AgentLinkMessage {
  readonly messageId?: string
  readonly role?: 'user' | 'agent' | 'ROLE_USER' | 'ROLE_AGENT'
  readonly parts?: readonly (AgentLinkPart | AgentLinkProtocolPart | AgentLinkProtoJsonTextPart)[]
  readonly message?: string
  readonly contextId?: string
  readonly taskId?: string
  readonly metadata?: Record<string, unknown>
}
export interface AgentLinkProtocolMessage {
  readonly messageId: string
  readonly role: 'ROLE_USER' | 'ROLE_AGENT'
  readonly parts: readonly AgentLinkProtocolPart[]
  readonly contextId?: string
  readonly taskId?: string
  readonly metadata?: Record<string, unknown>
}
export interface AgentLinkSecurityRequirement {
  readonly schemes: Readonly<Record<string, { readonly list: readonly string[] }>>
}
export interface AgentLinkSkill {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly tags: readonly string[]
  readonly examples: readonly string[]
  readonly inputModes: readonly string[]
  readonly outputModes: readonly string[]
  readonly securityRequirements: readonly AgentLinkSecurityRequirement[]
}
export interface AgentLinkInterface {
  readonly url: string
  readonly protocolBinding: 'JSONRPC' | 'HTTP+JSON'
  readonly protocolVersion: '1.0'
  readonly tenant?: string
}
export interface AgentCard {
  readonly name: string
  readonly description: string
  readonly version: string
  readonly supportedInterfaces: readonly AgentLinkInterface[]
  readonly capabilities: {
    readonly streaming: boolean
    readonly pushNotifications: boolean
    readonly extensions: readonly []
    readonly extendedAgentCard: boolean
  }
  readonly securitySchemes: Readonly<Record<string, unknown>>
  readonly securityRequirements: readonly AgentLinkSecurityRequirement[]
  readonly defaultInputModes: readonly string[]
  readonly defaultOutputModes: readonly string[]
  readonly skills: readonly AgentLinkSkill[]
}
export type AgentLinkTaskStatus = 'submitted' | 'working' | 'completed' | 'failed' | 'cancelled'
export interface AgentLinkTask {
  readonly id: string
  readonly contextId: string
  readonly status: AgentLinkTaskStatus
  readonly message: string
  readonly response?: string
  readonly error?: string
  readonly agentId?: string
  readonly sessionId?: string
  readonly createdAt: string
  readonly updatedAt: string
  readonly lastEventSeq?: number
  readonly owner?: string
}
export interface AgentLinkProtocolTask {
  readonly id: string
  readonly contextId: string
  readonly status: {
    readonly state: 'TASK_STATE_SUBMITTED' | 'TASK_STATE_WORKING' | 'TASK_STATE_COMPLETED' | 'TASK_STATE_FAILED' | 'TASK_STATE_CANCELED'
    readonly timestamp?: string
    readonly message?: AgentLinkProtocolMessage
  }
  readonly history?: readonly AgentLinkProtocolMessage[]
  readonly artifacts?: readonly { readonly artifactId: string; readonly parts: readonly AgentLinkProtocolPart[] }[]
}
export interface AgentLinkConfig {
  readonly agentName?: string
  readonly description?: string
  readonly version?: string
  readonly publicUrl?: string
  readonly bearerToken?: string
  readonly maxTasks?: number
  readonly maxMessageBytes?: number
  readonly requestTimeoutMs?: number
  readonly maxPingPongTurns?: number
  readonly statePath?: string
  readonly agentId?: string
}
export interface AgentLinkRpcRequest { readonly jsonrpc: '2.0'; readonly id?: string | number | null; readonly method: string; readonly params?: Record<string, unknown> }
export interface AgentLinkRpcResponse { readonly jsonrpc: '2.0'; readonly id?: string | number | null; readonly result?: unknown; readonly error?: { readonly code: number; readonly message: string; readonly data?: unknown } }
