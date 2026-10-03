/** Native HTTP adapter for the durable Aeoth A2A service. */
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-host-desktop-server'
import type { AgentLinkRpcRequest } from '@deepseek-ai/dsh-agent-link/types'
import type { AgentLinkService } from '@deepseek-ai/dsh-agent-link'

export const name = 'agent-link-http'
export const inject = ['webServer', 'agentLink']
declare module '@deepseek-ai/cordis' { interface Context { agentLinkHttp: AgentLinkHttp } }

const MAX_BODY = 64 * 1024
const CARD_PATH = '/.well-known/agent-card.json'
const RPC_PATH = '/a2a'
const TASK_PREFIX = '/a2a/tasks/'

export class AgentLinkHttp {
  constructor(private readonly ctx: Context) {
    ctx.effect(() => {
      const card = ctx.webServer.register({ kind: 'exact', path: CARD_PATH, handler: (req, res) => this.handleCard(req, res) })
      const rpc = ctx.webServer.register({ kind: 'exact', path: RPC_PATH, handler: (req, res) => this.handleRpc(req, res) })
      const tasks = ctx.webServer.register({ kind: 'prefix', path: TASK_PREFIX.slice(0, -1), handler: (req, res) => this.handleTask(req, res) })
      return () => { card(); rpc(); tasks() }
    }, 'agent-link HTTP routes')
  }

  private service(): AgentLinkService { const service = this.ctx.get('agentLink'); if (service === undefined) throw new Error('A2A service unavailable'); return service }
  private allowed(req: IncomingMessage, res: ServerResponse): boolean {
    if (!this.service().authorize(req.headers.authorization)) { json(res, 401, { error: 'unauthorized' }); return false }
    return true
  }
  private async handleCard(req: IncomingMessage, res: ServerResponse): Promise<void> {
    if (req.method !== 'GET') { method(res, 'GET'); return }
    if (!this.allowed(req, res)) return
    const webServer = this.ctx.webServer
    const localBaseUrl = webServer.host === '127.0.0.1' ? `http://127.0.0.1:${String(webServer.port)}` : undefined
    json(res, 200, this.service().card(localBaseUrl))
  }
  private async handleRpc(req: IncomingMessage, res: ServerResponse): Promise<void> {
    if (req.method !== 'POST') { method(res, 'POST'); return }
    if (!this.allowed(req, res)) return
    try {
      const body = await readJson(req)
      const request = body as AgentLinkRpcRequest
      if (request.jsonrpc !== '2.0' || typeof request.method !== 'string') { json(res, 400, { error: 'invalid JSON-RPC request' }); return }
      const owner = req.headers['x-a2a-peer']?.toString() ?? 'peer'
      if (request.method === 'message/stream' || request.method === 'SendStreamingMessage') {
        const accepted = await this.service().rpc({ ...request, method: 'message/send' }, owner)
        if (accepted.error !== undefined || accepted.result === undefined) { jsonRpc(res, accepted); return }
        const taskId = (accepted.result as { task?: { id?: unknown } }).task?.id
        if (typeof taskId !== 'string') { jsonRpc(res, accepted); return }
        await this.streamRpc(request.id, taskId, owner, res)
        return
      }
      if (request.method === 'SubscribeToTask' || request.method === 'tasks/resubscribe') {
        const taskId = request.params?.id
        if (typeof taskId !== 'string' || taskId.trim() === '') { jsonRpc(res, { jsonrpc: '2.0', ...(request.id === undefined ? {} : { id: request.id }), error: { code: -32602, message: 'Task id is required' } }); return }
        await this.streamRpc(request.id, taskId, owner, res)
        return
      }
      jsonRpc(res, await this.service().rpc(request, owner))
    } catch (error) { json(res, 400, { error: safeError(error) }) }
  }
  private async handleTask(req: IncomingMessage, res: ServerResponse): Promise<void> {
    if (!this.allowed(req, res)) return
    const path = new URL(req.url ?? '/', 'http://localhost').pathname
    const rest = path.slice(TASK_PREFIX.length).split('/').filter(Boolean)
    const id = rest[0]
    if (!id) { json(res, 404, { error: 'task not found' }); return }
    if (rest[1] === 'cancel') {
      if (req.method !== 'POST') { method(res, 'POST'); return }
      try { json(res, 200, { task: this.service().toProtocolTask(await this.service().cancelTask(id, req.headers['x-a2a-peer']?.toString() ?? 'peer')) }) } catch (error) { json(res, 404, { error: safeError(error) }) }
      return
    }
    if (rest[1] === 'stream') {
      if (req.method !== 'GET') { method(res, 'GET'); return }
      await this.stream(id, req.headers['x-a2a-peer']?.toString() ?? 'peer', res)
      return
    }
    if (req.method !== 'GET') { method(res, 'GET'); return }
    const task = await this.service().getTask(id, req.headers["x-a2a-peer"]?.toString() ?? "peer")
    if (!task) { json(res, 404, { error: 'task not found' }); return }
    json(res, 200, { task: this.service().toProtocolTask(task) })
  }
  private async streamRpc(id: string | number | null | undefined, taskId: string, owner: string, res: ServerResponse): Promise<void> {
    res.statusCode = 200; res.setHeader('content-type', 'text/event-stream'); res.setHeader('cache-control', 'no-cache'); res.setHeader('connection', 'keep-alive')
    const started = Date.now(); let last = ''
    while (!res.destroyed && Date.now() - started < 30_000) {
      const task = await this.service().getTask(taskId, owner)
      if (!task) { res.write(`event: error\ndata: ${JSON.stringify({ jsonrpc: '2.0', id, error: { code: -32004, message: 'Task not found' } })}\n\n`); res.end(); return }
      const payload = JSON.stringify({ jsonrpc: '2.0', ...(id === undefined ? {} : { id }), result: { task: this.service().toProtocolTask(task) } })
      if (payload !== last) { res.write(`event: task\ndata: ${payload}\n\n`); last = payload }
      if (['completed', 'failed', 'cancelled'].includes(task.status)) { res.end(); return }
      await new Promise(resolve => setTimeout(resolve, 250))
    }
    if (!res.destroyed) res.end()
  }

  private async stream(id: string, owner: string, res: ServerResponse): Promise<void> {
    res.statusCode = 200; res.setHeader('content-type', 'text/event-stream'); res.setHeader('cache-control', 'no-cache'); res.setHeader('connection', 'keep-alive')
    const started = Date.now(); let last = ''
    while (!res.destroyed && Date.now() - started < 30_000) {
      const task = await this.service().getTask(id, owner)
      if (!task) { res.write(`event: error\ndata: ${JSON.stringify({ error: 'task not found' })}\n\n`); res.end(); return }
      const value = JSON.stringify(this.service().toProtocolTask(task))
      if (value !== last) { res.write(`event: task\ndata: ${value}\n\n`); last = value }
      if (['completed', 'failed', 'cancelled'].includes(task.status)) { res.end(); return }
      await new Promise(resolve => setTimeout(resolve, 250))
    }
    if (!res.destroyed) res.end()
  }
}

export function apply(ctx: Context): void { ctx.provide('agentLinkHttp', new AgentLinkHttp(ctx)) }
function method(res: ServerResponse, value: string): void { res.statusCode = 405; res.setHeader('allow', value); res.end() }
function json(res: ServerResponse, status: number, value: unknown): void { res.statusCode = status; res.setHeader('content-type', 'application/json'); res.end(JSON.stringify(value)) }
function jsonRpc(res: ServerResponse, value: unknown): void { res.statusCode = 200; res.setHeader('content-type', 'application/json'); res.end(JSON.stringify(value)) }
async function readJson(req: IncomingMessage): Promise<unknown> {
  let size = 0; const chunks: Buffer[] = []
  for await (const chunk of req) { const value = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as string); size += value.byteLength; if (size > MAX_BODY) throw new Error('request body too large'); chunks.push(value) }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'))
}
function safeError(error: unknown): string { return error instanceof Error ? error.message : String(error) }

