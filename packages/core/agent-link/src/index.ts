/** Native durable A2A service and model-facing outbound tools. */
import { randomUUID } from 'node:crypto'
import { mkdir, readFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { Context } from '@deepseek-ai/cordis'
import type { Agent } from '@deepseek-ai/dsh-agent'
import { createUserMessage } from '@deepseek-ai/dsh-llm'
import { SessionId, type SessionEvent } from '@deepseek-ai/dsh-session'
import { withFileLock, writeFileAtomic } from '@deepseek-ai/dsh-atomic-write'
import { resolveAeothHome } from '@deepseek-ai/dsh-home-paths'
import { defineTool } from '@deepseek-ai/dsh-tools'
import z from '@deepseek-ai/schemastery'
import type { JsonValue } from '@deepseek-ai/dsh-util-values'
import type { AgentCard, AgentLinkConfig, AgentLinkInterface, AgentLinkMessage, AgentLinkProtocolMessage, AgentLinkProtocolTask, AgentLinkRpcRequest, AgentLinkRpcResponse, AgentLinkTask } from './types.ts'

export type * from './types.ts'
export const name = 'agent-link'
export const inject = ['agents', 'tools']
export const Config: z<AgentLinkConfig> = z.object({
  agentName: z.string().default('Aeoth Agent'),
  description: z.string().default('Native Aeoth Agent-to-Agent endpoint.'),
  version: z.string().default('0.1.0'),
  publicUrl: z.string(),
  bearerToken: z.string(),
  maxTasks: z.number().step(1).min(1).default(128),
  maxMessageBytes: z.number().step(1).min(256).max(1_048_576).default(64 * 1024),
  requestTimeoutMs: z.number().step(1).min(1000).max(300_000).default(30_000),
  maxPingPongTurns: z.number().step(1).min(1).max(20).default(5),
  statePath: z.string(),
  agentId: z.string(),
})
declare module '@deepseek-ai/cordis' { interface Context { agentLink: AgentLinkService } }

const JSONRPC_VERSION = '2.0'
interface PersistedState { readonly version: 1; readonly tasks: readonly AgentLinkTask[] }
function now(): string { return new Date().toISOString() }
function text(value: unknown): string {
  if (typeof value !== 'string' || value.trim() === '') throw new Error('A2A message must be non-empty text')
  return value.trim()
}
function messageText(message: AgentLinkMessage): string {
  if (message.message !== undefined) return text(message.message)
  const parts = message.parts?.flatMap(part => {
    if ('kind' in part) return part.kind === 'text' ? [part.text] : []
    if ('text' in part) return typeof part.text === 'string' ? [part.text] : []
    return part.content.$case === 'text' ? [part.content.value] : []
  }).join('')
  return text(parts)
}
function loopback(url: string): boolean {
  try { const host = new URL(url).hostname; return host === '127.0.0.1' || host === '::1' || host === 'localhost' } catch { return false }
}
function allowedUrl(url: string): boolean {
  const parsed = new URL(url)
  return parsed.protocol === 'https:' || (parsed.protocol === 'http:' && loopback(url))
}
function bytes(value: string): number { return Buffer.byteLength(value, 'utf8') }

const TASK_STATES: Readonly<Record<string, AgentLinkTask['status']>> = {
  TASK_STATE_SUBMITTED: 'submitted', TASK_STATE_WORKING: 'working', TASK_STATE_COMPLETED: 'completed',
  TASK_STATE_FAILED: 'failed', TASK_STATE_CANCELED: 'cancelled',
}
function taskState(value: unknown): AgentLinkTask['status'] | undefined {
  if (typeof value === 'string') return TASK_STATES[value]
  if (typeof value === 'number') return ({ 1: 'submitted', 2: 'working', 3: 'completed', 4: 'failed', 5: 'cancelled' } as const)[value as 1 | 2 | 3 | 4 | 5]
  return undefined
}
function offsetFromToken(value: unknown): number {
  if (value === undefined || value === '') return 0
  if (typeof value !== 'string') throw new Error('invalid A2A page token')
  const decoded = Buffer.from(value, 'base64url').toString('utf8')
  const offset = Number(decoded)
  if (!Number.isSafeInteger(offset) || offset < 0 || String(offset) !== decoded) throw new Error('invalid A2A page token')
  return offset
}

export class AgentLinkService {
  private readonly path: string
  private readonly lockPath: string
  private readonly config: Required<Pick<AgentLinkConfig, 'agentName' | 'description' | 'version' | 'maxTasks' | 'maxMessageBytes' | 'requestTimeoutMs' | 'maxPingPongTurns'>> & AgentLinkConfig
  private tail: Promise<unknown> = Promise.resolve()

  constructor(private readonly ctx: Context, config: AgentLinkConfig = {}) {
    const profile = ctx.get('profileContext') as { dir?: string } | undefined
    const root = resolve(config.statePath ?? join(profile?.dir ?? resolveAeothHome(), 'agent-link'))
    this.path = root.endsWith('.json') ? root : join(root, 'tasks.json')
    this.lockPath = join(this.path, '..', '.tasks-write')
    this.config = {
      agentName: config.agentName ?? 'Aeoth Agent', description: config.description ?? 'Native Aeoth Agent-to-Agent endpoint.', version: config.version ?? '0.1.0',
      maxTasks: config.maxTasks ?? 128, maxMessageBytes: config.maxMessageBytes ?? 64 * 1024,
      requestTimeoutMs: config.requestTimeoutMs ?? 30_000, maxPingPongTurns: config.maxPingPongTurns ?? 5, ...config,
    }
    this.installTools()
    ctx.on('agent/created', ({ agent }) => { void this.ensureTaskInputForAgent(agent); void this.settleForAgent(agent) })
    ctx.on('agent/status', ({ agent }) => { if (agent.status === 'idle') void this.settleForAgent(agent) })
    ctx.effect(() => {
      const timer = setInterval(() => { void this.recoverTasks() }, 1_000)
      timer.unref()
      queueMicrotask(() => { void this.recoverTasks() })
      return () => { clearInterval(timer) }
    }, 'agent-link task recovery')
  }

  authorize(authorization: string | undefined): boolean {
    return this.config.bearerToken === undefined || authorization === `Bearer ${this.config.bearerToken}`
  }

  card(localBaseUrl?: string): AgentCard {
    const endpoint = this.config.publicUrl?.replace(/\/$/u, '') ?? localBaseUrl?.replace(/\/$/u, '')
    if (endpoint === undefined) throw new Error('A2A publicUrl must be configured when no loopback HTTP origin is available')
    const supportedInterfaces: AgentLinkInterface[] = [
      { url: `${endpoint}/a2a`, protocolBinding: 'JSONRPC', protocolVersion: '1.0' },
    ]
    const scheme = 'aeothBearer'
    return {
      name: this.config.agentName, description: this.config.description, version: this.config.version, supportedInterfaces,
      capabilities: { streaming: true, pushNotifications: false, extensions: [], extendedAgentCard: false },
      securitySchemes: this.config.bearerToken
        ? { [scheme]: { httpAuthSecurityScheme: { scheme: 'bearer', description: 'Bearer token' } } }
        : {},
      securityRequirements: this.config.bearerToken ? [{ schemes: { [scheme]: { list: [] } } }] : [],
      defaultInputModes: ['text/plain'], defaultOutputModes: ['text/plain'],
      skills: [{
        id: 'agent-task', name: 'Agent task', description: 'Accept a bounded durable task and return its result.',
        tags: ['agent-task'], examples: [], inputModes: ['text/plain'], outputModes: ['text/plain'], securityRequirements: [],
      }],
    }
  }

  async listTasks(owner?: string): Promise<readonly AgentLinkTask[]> { return (await this.read()).tasks.filter(task => owner === undefined || task.owner === owner) }
  async getTask(id: string, owner?: string): Promise<AgentLinkTask | undefined> { const task = (await this.read()).tasks.find(item => item.id === id); return task === undefined || (owner !== undefined && task.owner !== owner) ? undefined : task }

  async inbound(message: AgentLinkMessage, owner = 'peer'): Promise<AgentLinkTask> {
    const prompt = messageText(message)
    if (bytes(prompt) > this.config.maxMessageBytes) throw new Error('A2A message exceeds the configured limit')
    const existing = message.taskId === undefined ? undefined : await this.getTask(message.taskId)
    if (existing !== undefined) {
      if (existing.owner !== owner) throw new Error('A2A task is owned by another peer')
      await this.ensureTaskInput(existing)
      return existing
    }
    const task = await this.mutate(async state => {
      if (state.tasks.length >= this.config.maxTasks) throw new Error('A2A task limit reached')
      const agent = await this.resolveAgent(message.metadata?.agentId)
      const createdAt = now()
      const task: AgentLinkTask = {
        id: message.taskId ?? randomUUID(), contextId: message.contextId ?? randomUUID(), status: 'working', message: prompt,
        agentId: agent.id, sessionId: agent.session.id, owner, createdAt, updatedAt: createdAt,
      }
      return { state: { ...state, tasks: [...state.tasks, task] }, value: task }
    })
    // Persist first, then admit the Session input. If the process dies between
    // these two commits, startup recovery can safely replay the same rpcId.
    await this.ensureTaskInput(task)
    return task
  }

  async cancelTask(id: string, owner?: string): Promise<AgentLinkTask> {
    return this.mutate(async state => {
      const task = state.tasks.find(item => item.id === id)
      if (task === undefined) throw new Error('A2A task not found')
      if (owner !== undefined && task.owner !== owner) throw new Error('A2A task is owned by another peer')
      if (task.status === 'completed' || task.status === 'failed' || task.status === 'cancelled') return { state, value: task }
      if (task.sessionId !== undefined) {
        const agent = await this.resumeAgent(task.sessionId)
        agent?.cancel({ kind: 'user' }, { keepInbox: false })
      }
      const updated: AgentLinkTask = { ...task, status: 'cancelled', updatedAt: now(), error: 'Cancelled by peer' }
      return { state: { ...state, tasks: state.tasks.map(item => item.id === id ? updated : item) }, value: updated }
    })
  }

  async rpc(request: AgentLinkRpcRequest, owner = 'peer'): Promise<AgentLinkRpcResponse> {
    try {
      const params = request.params ?? {}
      switch (request.method) {
        case 'GetAgentCard':
        case 'agent/getAuthenticatedExtendedCard': return rpcResult(request.id, this.card())
        case 'SendMessage':
        case 'SendStreamingMessage':
        case 'message/send':
        case 'message/stream': {
          const raw = params.message
          const contextId = stringParam(params.contextId)
          const taskId = stringParam(params.taskId)
          const metadata = params.metadata !== null && typeof params.metadata === 'object' && !Array.isArray(params.metadata)
            ? params.metadata as Record<string, unknown>
            : undefined
          const rawMessage = typeof raw === 'string' ? { message: raw } : { ...(raw as AgentLinkMessage) }
          const mergedMetadata = { ...rawMessage.metadata, ...metadata }
          const message: AgentLinkMessage = {
            ...rawMessage,
            ...(contextId === undefined ? {} : { contextId }),
            ...(taskId === undefined ? {} : { taskId }),
            ...(Object.keys(mergedMetadata).length === 0 ? {} : { metadata: mergedMetadata }),
          }
          const task = await this.inbound(message, owner)
          return rpcResult(request.id, { task: this.toProtocolTask(task) })
        }
        case 'GetTask':
        case 'tasks/get': {
          const task = await this.getTask(text(params.id), owner)
          if (task === undefined) return rpcError(request.id, -32004, 'Task not found')
          const protocolTask = this.toProtocolTask(task)
          const historyLength = params.historyLength
          const result = typeof historyLength === 'number' && Number.isSafeInteger(historyLength) && historyLength >= 0
            ? { ...protocolTask, history: historyLength === 0 ? [] : (protocolTask.history ?? []).slice(-historyLength) }
            : protocolTask
          return rpcResult(request.id, result)
        }
        case 'ListTasks':
        case 'tasks/list': {
          let tasks = await this.listTasks(owner)
          const contextId = stringParam(params.contextId)
          const state = taskState(params.status)
          const after = stringParam(params.statusTimestampAfter)
          const afterTime = after === undefined ? undefined : Date.parse(after)
          if (after !== undefined && !Number.isFinite(afterTime)) throw new Error('invalid A2A status timestamp')
          tasks = tasks.filter(task => (contextId === undefined || task.contextId === contextId)
            && (state === undefined || task.status === state)
            && (afterTime === undefined || Date.parse(task.updatedAt) >= afterTime))
          const pageSize = params.pageSize === undefined ? 50 : params.pageSize
          if (typeof pageSize !== 'number' || !Number.isSafeInteger(pageSize) || pageSize < 1 || pageSize > 100) {
            throw new Error('A2A page size must be an integer from 1 through 100')
          }
          const offset = offsetFromToken(params.pageToken)
          const totalSize = tasks.length
          const page = tasks.slice(offset, offset + pageSize)
          const nextOffset = offset + page.length
          const nextPageToken = nextOffset < totalSize ? Buffer.from(String(nextOffset)).toString('base64url') : ''
          const historyLength = params.historyLength
          const includeArtifacts = params.includeArtifacts === true
          const protocolTasks = page.map(task => {
            const protocolTask = this.toProtocolTask(task)
            const history = typeof historyLength === 'number' && Number.isSafeInteger(historyLength) && historyLength >= 0
              ? historyLength === 0 ? [] : (protocolTask.history ?? []).slice(-historyLength)
              : protocolTask.history
            const artifacts = includeArtifacts ? protocolTask.artifacts : undefined
            return { ...protocolTask, ...(history === undefined ? {} : { history }), ...(artifacts === undefined ? { artifacts: [] } : { artifacts }) }
          })
          return rpcResult(request.id, { tasks: protocolTasks, nextPageToken, pageSize, totalSize })
        }
        case 'CancelTask':
        case 'tasks/cancel': return rpcResult(request.id, this.toProtocolTask(await this.cancelTask(text(params.id), owner)))
        case 'SubscribeToTask':
        case 'tasks/resubscribe': {
          const task = await this.getTask(text(params.id), owner)
          return task === undefined ? rpcError(request.id, -32004, 'Task not found') : rpcResult(request.id, this.toProtocolTask(task))
        }
        default: return rpcError(request.id, -32601, `Method not found: ${request.method}`)
      }
    } catch (error) {
      return rpcError(request.id, -32000, safeError(error))
    }
  }

  async discover(url: string): Promise<AgentCard> {
    const base = new URL(url)
    if (!allowedUrl(base.toString())) throw new Error('A2A peer URL must use HTTPS or loopback HTTP')
    const target = new URL('/.well-known/agent-card.json', base).toString()
    const response = await fetch(target, { signal: AbortSignal.timeout(this.config.requestTimeoutMs) })
    if (!response.ok) throw new Error(`A2A Agent Card failed: ${response.status}`)
    return await response.json() as AgentCard
  }

  async call(url: string, message: string, contextId?: string, bearerToken?: string): Promise<AgentLinkProtocolTask> {
    if (!allowedUrl(url)) throw new Error('A2A peer URL must use HTTPS or loopback HTTP')
    const response = await fetch(url, {
      method: 'POST', signal: AbortSignal.timeout(this.config.requestTimeoutMs),
      headers: { 'content-type': 'application/json', ...(bearerToken ? { authorization: `Bearer ${bearerToken}` } : {}) },
      body: JSON.stringify({ jsonrpc: JSONRPC_VERSION, id: randomUUID(), method: 'message/send', params: { message: { messageId: randomUUID(), role: 'user', parts: [{ kind: 'text', text: text(message) }] }, ...(contextId ? { contextId } : {}) } }),
    })
    if (!response.ok) throw new Error(`A2A call failed: ${response.status}`)
    const body = await response.json() as AgentLinkRpcResponse
    if (body.error) throw new Error(body.error.message)
    const task = (body.result as { task?: AgentLinkProtocolTask } | undefined)?.task
    if (task === undefined) throw new Error('A2A peer returned no task')
    return task
  }

  toProtocolTask(task: AgentLinkTask): AgentLinkProtocolTask {
    const state = ({
      submitted: 'TASK_STATE_SUBMITTED', working: 'TASK_STATE_WORKING', completed: 'TASK_STATE_COMPLETED',
      failed: 'TASK_STATE_FAILED', cancelled: 'TASK_STATE_CANCELED',
    } as const)[task.status]
    const history: AgentLinkProtocolMessage[] = [{ messageId: `${task.id}:input`, role: 'ROLE_USER', parts: [{ text: task.message }], contextId: task.contextId }]
    if (task.response !== undefined) history.push({ messageId: `${task.id}:output`, role: 'ROLE_AGENT', parts: [{ text: task.response }], contextId: task.contextId })
    return {
      id: task.id, contextId: task.contextId,
      status: { state, timestamp: task.updatedAt, ...(task.error === undefined ? {} : { message: { messageId: `${task.id}:error`, role: 'ROLE_AGENT', parts: [{ text: task.error }], contextId: task.contextId } }) },
      history,
      ...(task.response === undefined ? {} : { artifacts: [{ artifactId: `${task.id}:artifact`, parts: [{ text: task.response }] }] }),
    }
  }

  private async resolveAgent(requested: unknown): Promise<Agent> {
    const agents = this.ctx.get('agents')
    if (agents === undefined) throw new Error('Agent runtime is unavailable')
    const target = typeof requested === 'string' ? requested : this.config.agentId
    if (target !== undefined) {
      const exact = agents.get(target as SessionId)
      if (exact !== undefined) return exact
      const sessionController = (this.ctx as any).get('sessionController') as { create?: (request: { sessionId: SessionId }) => Promise<unknown> } | undefined
      if (sessionController?.create !== undefined) {
        await sessionController.create({ sessionId: target as SessionId })
        const resumed = agents.get(target as SessionId)
        if (resumed !== undefined) return resumed
      }
      throw new Error('Requested A2A Agent is not available')
    }
    const roots = agents.roots().filter(item => item.status === 'idle' || item.status === 'running')
    if (roots.length > 1) throw new Error('A2A target Agent is ambiguous; configure agentId')
    const agent = roots[0]
    if (agent === undefined) throw new Error('No live Agent is available for inbound A2A work')
    return agent
  }

  private async recoverTasks(): Promise<void> {
    const state = await this.read()
    for (const task of state.tasks) {
      if (task.status !== 'working' || task.sessionId === undefined) continue
      try {
        const agent = await this.resumeAgent(task.sessionId)
        if (agent === undefined) continue
        await this.ensureTaskInput(task, agent)
        if (agent.status === 'idle') await this.settleForAgent(agent)
      } catch (error) {
        this.ctx.logger.warn(`agent-link task recovery failed: ${safeError(error)}`)
      }
    }
  }

  private async ensureTaskInputForAgent(agent: Agent): Promise<void> {
    const tasks = await this.listTasks()
    for (const task of tasks) {
      if (task.status === 'working' && task.sessionId === agent.session.id) await this.ensureTaskInput(task, agent)
    }
  }

  private async resumeAgent(sessionId: string): Promise<Agent | undefined> {
    const agents = this.ctx.get('agents')
    if (agents === undefined) return undefined
    const current = agents.get(sessionId as SessionId)
    if (current !== undefined) return current
    const controller = (this.ctx as { get(name: 'sessionController'): { create?: (request: { sessionId: SessionId }) => Promise<unknown> } | undefined }).get('sessionController')
    if (controller?.create === undefined) return undefined
    await controller.create({ sessionId: SessionId(sessionId) })
    return agents.get(sessionId as SessionId)
  }

  private async ensureTaskInput(task: AgentLinkTask, knownAgent?: Agent): Promise<void> {
    const latest = await this.getTask(task.id)
    if (latest?.status !== 'working' || latest.owner !== task.owner) return
    if (task.sessionId === undefined) return
    const agent = knownAgent ?? await this.resumeAgent(task.sessionId)
    if (agent === undefined) return
    const present = agent.session.snapshotEvents().some(event => event.type === 'user/message'
      && event.data.source.kind === 'user' && 'rpcId' in event.data.source && event.data.source.rpcId === task.id)
    if (present) return
    agent.followup(createUserMessage({
      content: [{ type: 'text', text: `[Untrusted A2A peer input]\n${task.message}` }],
      source: { kind: 'user', rpcId: task.id },
    }))
  }

  private async settleForAgent(agent: Agent): Promise<void> {
    await this.mutate(async state => {
      let changed = false
      const tasks = state.tasks.map(task => {
        if (task.status !== 'working' || task.agentId !== agent.id) return task
        const result = findTaskResult(agent.session.snapshotEvents(), task.id)
        if (result.kind === 'pending') return task
        changed = true
        return { ...task, status: result.kind === 'reply' ? 'completed' as const : 'failed' as const,
          ...(result.kind === 'reply' ? { response: result.text, lastEventSeq: result.seq } : { error: result.message }), updatedAt: now() }
      })
      return { state: changed ? { ...state, tasks } : state, value: undefined }
    })
  }

  private installTools(): void {
    const tools = this.ctx.get('tools')
    if (tools === undefined) return
    const discover = (args: { url: string }): Promise<AgentCard> => this.discover(args.url)
    const call = (args: { url: string; message: string; contextId?: string }): Promise<AgentLinkProtocolTask> => this.call(args.url, args.message, args.contextId)
    tools.register(defineTool({
      name: 'a2a_discover', description: 'Discover a remote A2A Agent Card.',
      parameters: { url: { type: 'string', required: true } },
      output: { schema: { type: 'object', additionalProperties: true }, render: (_args, value) => [{ type: 'text', text: JSON.stringify(value) }] },
      async execute(args) { return await discover(args) as unknown as Record<string, JsonValue> },
    }))
    tools.register(defineTool({
      name: 'a2a_call', description: 'Send a bounded task to a remote A2A Agent.',
      parameters: { url: { type: 'string', required: true }, message: { type: 'string', required: true }, contextId: { type: 'string' } },
      output: { schema: { type: 'object', additionalProperties: true }, render: (_args, value) => [{ type: 'text', text: JSON.stringify(value) }] },
      async execute(args) { return await call(args) as unknown as Record<string, JsonValue> },
    }))
  }

  private async read(): Promise<PersistedState> {
    try {
      const raw = JSON.parse(await readFile(this.path, 'utf8')) as Partial<PersistedState>
      if (raw.version !== 1 || !Array.isArray(raw.tasks)) throw new Error('unsupported or corrupt A2A state')
      return { version: 1, tasks: raw.tasks }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return { version: 1, tasks: [] }
      throw error
    }
  }

  private async write(state: PersistedState): Promise<void> {
    await mkdir(join(this.path, '..'), { recursive: true, mode: 0o700 })
    await writeFileAtomic(this.path, JSON.stringify(state) + '\n', { mode: 0o600, dirMode: 0o700 })
  }

  private async mutate<T>(operation: (state: PersistedState) => Promise<{ readonly state: PersistedState; readonly value: T }>): Promise<T> {
    const next = this.tail.then(async () => {
      await mkdir(join(this.path, '..'), { recursive: true, mode: 0o700 })
      return withFileLock(this.lockPath, async () => {
      const current = await this.read()
      const result = await operation(current)
      if (result.state !== current) await this.write(result.state)
      return result.value
      }, { waitMs: 10_000 })
    })
    this.tail = next.catch(() => {})
    return next
  }
}

function stringParam(value: unknown): string | undefined { return typeof value === 'string' && value.trim() ? value : undefined }
function findTaskResult(events: readonly SessionEvent[], requestId: string):
  | { readonly kind: 'pending' }
  | { readonly kind: 'reply'; readonly text: string; readonly seq: number }
  | { readonly kind: 'error'; readonly message: string } {
  const start = events.findIndex(event => event.type === 'user/message' && event.data.source.kind === 'user'
    && 'rpcId' in event.data.source && event.data.source.rpcId === requestId)
  if (start < 0) return { kind: 'pending' }
  const turnStart = events.slice(0, start).findLast(event => event.type === 'turn/start')
    ?? events.slice(start + 1).find(event => event.type === 'turn/start')
  if (turnStart?.type !== 'turn/start') return { kind: 'pending' }
  const ended = events.find(event => event.type === 'turn/end' && event.data.turn === turnStart.data.turn)
  if (ended?.type !== 'turn/end') return { kind: 'pending' }
  if (ended.data.reason.kind === 'error') return { kind: 'error', message: ended.data.reason.error.message }
  if (ended.data.reason.kind === 'aborted' || ended.data.reason.kind === 'interrupted') return { kind: 'error', message: `A2A task stopped: ${ended.data.reason.kind}` }
  const assistant = events.slice(start + 1).findLast(event => event.type === 'assistant/message' && event.data.turn === turnStart.data.turn)
  if (assistant?.type !== 'assistant/message') return { kind: 'error', message: 'A2A Agent completed without a text response' }
  const response = assistant.data.message.content.flatMap(block => block.type === 'text' ? [block.text] : []).join('').trim()
  return response ? { kind: 'reply', text: response, seq: Number(assistant.seq) } : { kind: 'error', message: 'A2A Agent returned no text response' }
}
function safeError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error)
  return message.replace(/(api[_-]?key|token|secret)\s*[:=]\s*\S+/giu, '$1=[redacted]').slice(0, 1000)
}
export function isLoopbackUrl(url: string): boolean { return loopback(url) }
export function rpcResult(id: unknown, result: unknown): AgentLinkRpcResponse { return { jsonrpc: JSONRPC_VERSION, ...(id === undefined ? {} : { id: id as string | number | null }), result } }
export function rpcError(id: unknown, code: number, message: string): AgentLinkRpcResponse { return { jsonrpc: JSONRPC_VERSION, ...(id === undefined ? {} : { id: id as string | number | null }), error: { code, message } } }
export function apply(ctx: Context, config: AgentLinkConfig): void { ctx.provide('agentLink', new AgentLinkService(ctx, config)) }
