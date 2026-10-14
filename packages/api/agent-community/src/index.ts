/** Host Remote owner for native Bot Mode and Agent Community. */
import { credentialRef, credentialRefForNamespace } from '@deepseek-ai/dsh-credentials'
import { Context } from '@deepseek-ai/cordis'
import type { AgentCommunityService } from '@deepseek-ai/dsh-agent-community'
import type {
  BotCommunitySnapshot, BotId, BotIdentity, BotMessage, BotMailboxItem,
  BotRoom, BotRoomId, BotRun, ControlBotRunRequest,
  CreateBotRequest, CreateRoomRequest, DeleteRoomRequest, RetryBotRunRequest,
  SendRoomMessageRequest, UpdateBotRequest, UpdateRoomRequest,
  DeleteBotRequest,
} from '@deepseek-ai/dsh-agent-community/types'
import { Remote, RemoteError, remoteErrorOf, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol'

export type * from './types.ts'
export const name = 'agent-community-controller'
export const inject = ['agentCommunity']
declare module '@deepseek-ai/cordis' { interface Context { agentCommunityController: AgentCommunityController } }

export class AgentCommunityController extends TypertRemoteService {
  static inject = ['typert', ...inject]

  constructor(ctx: Context) {
    super(ctx, 'agentCommunityController', { namespace: 'agentCommunity' })
  }

  private service(): AgentCommunityService {
    const service = this.ctx.get('agentCommunity')
    if (service === undefined) throw new RemoteError('gateway/internal', 'agent community is unavailable', {})
    return service
  }

  private credentials(): import('@deepseek-ai/dsh-credentials').CredentialProvider {
    const credentials = this.ctx.get('credentials')
    if (credentials === undefined) throw new RemoteError('gateway/internal', 'credentials service is unavailable', {})
    return credentials
  }

  private async credentialTarget(botId: string, ref: string): Promise<{ bot: BotIdentity; ref: string; namespace: string; scopedRef: import('@deepseek-ai/dsh-credentials').CredentialRef }> {
    const bot = this.service().listBots().find(item => item.id === botId)
    if (bot === undefined) throw new Error('Bot not found')
    const namespace = bot.profile.credentialNamespace?.trim()
    if (namespace === undefined || namespace.length === 0) throw new Error('Bot has no credential namespace')
    const normalized = String(credentialRef(ref))
    return { bot, ref: normalized, namespace, scopedRef: credentialRefForNamespace(credentialRef(normalized), namespace) }
  }

  @Remote async snapshot(): Promise<BotCommunitySnapshot> { return this.service().snapshot() }
  @Remote listBots(): readonly BotIdentity[] { return this.service().listBots() }
  @Remote async createBot(input: CreateBotRequest): Promise<BotIdentity> {
    try { return await this.service().createBot(input) }
    catch (error) { throw new RemoteError('gateway/bad-request', String(error), {}) }
  }
  @Remote async updateBot(input: UpdateBotRequest): Promise<BotIdentity> {
    try { return await this.service().updateBot(input) }
    catch (error) { throw new RemoteError('gateway/bad-request', safeError(error), {}) }
  }
  @Remote async describeBotCredential(botId: string, ref: string): Promise<{ botId: string; ref: string; namespace: string } & import('@deepseek-ai/dsh-credentials/types').CredentialInfo> {
    try {
      const target = await this.credentialTarget(botId, ref)
      const info = await this.credentials().describe(target.scopedRef)
      return { botId: target.bot.id, ref: target.ref, namespace: target.namespace, ...info }
    } catch (error) { throw new RemoteError('gateway/bad-request', safeError(error), {}) }
  }
  @Remote async setBotCredential(botId: string, ref: string, value: string): Promise<void> {
    try {
      const target = await this.credentialTarget(botId, ref)
      await this.credentials().set(target.scopedRef, value)
    } catch (error) { throw new RemoteError('gateway/bad-request', safeError(error), {}) }
  }
  @Remote async copyBotCredentialFromDeployment(botId: string, ref: string): Promise<void> {
    try {
      const target = await this.credentialTarget(botId, ref)
      const global = await this.credentials().resolve(credentialRef(target.ref))
      if (global === undefined) throw new Error('deployment credential is not configured')
      await this.credentials().set(target.scopedRef, global.value)
    } catch (error) { throw new RemoteError('gateway/bad-request', safeError(error), {}) }
  }
  @Remote async unsetBotCredential(botId: string, ref: string): Promise<void> {
    try {
      const target = await this.credentialTarget(botId, ref)
      await this.credentials().unset(target.scopedRef)
    } catch (error) { throw new RemoteError('gateway/bad-request', safeError(error), {}) }
  }
  @Remote('deleteBot')
  async deleteBot(input: DeleteBotRequest): Promise<void> {
    try { await this.service().deleteBot(input) }
    catch (error) { throwRemoteRequestError(error) }
  }
  @Remote listRooms(): readonly BotRoom[] { return this.service().listRooms() }
  @Remote async createRoom(input: CreateRoomRequest): Promise<BotRoom> {
    try { return await this.service().createRoom(input) }
    catch (error) { throwRemoteRequestError(error) }
  }
  @Remote listMessages(roomId: BotRoomId): readonly BotMessage[] { return this.service().listMessages(roomId) }
  @Remote('deleteRoom')
  async deleteRoom(input: DeleteRoomRequest): Promise<void> {
    try { await this.service().deleteRoom(input) }
    catch (error) { throwRemoteRequestError(error) }
  }
  @Remote async updateRoom(input: UpdateRoomRequest): Promise<BotRoom> {
    try { return await this.service().updateRoom(input) }
    catch (error) { throw new RemoteError('gateway/bad-request', String(error), {}) }
  }
  @Remote async sendRoomMessage(input: SendRoomMessageRequest): Promise<BotMessage> {
    try { return await this.service().sendMessage(input) }
    catch (error) { throwRemoteRequestError(error) }
  }
  @Remote listRuns(botId?: BotId): readonly BotRun[] { return this.service().listRuns(botId) }
  @Remote listMailbox(roomId?: BotRoomId): readonly BotMailboxItem[] { return this.service().snapshot().mailbox.filter(item => roomId === undefined || item.roomId === roomId) }
  @Remote async retryRun(input: RetryBotRunRequest): Promise<BotRun> {
    try { return await this.service().retryRun(input) }
    catch (error) { throw new RemoteError('gateway/bad-request', String(error), {}) }
  }
  @Remote async controlRun(input: ControlBotRunRequest): Promise<BotRun> {
    try { return await this.service().controlRun(input) }
    catch (error) { throw new RemoteError('gateway/bad-request', String(error), {}) }
  }
}

function throwRemoteRequestError(error: unknown): never {
  if (remoteErrorOf(error) !== undefined) throw error
  throw new RemoteError('gateway/bad-request', safeError(error), {})
}

function safeError(error: unknown): string {
  const text = error instanceof Error ? error.message : String(error)
  return text.replace(/(api[_-]?key|token|secret)\s*[:=]\s*\S+/giu, '$1=[redacted]').slice(0, 1000)
}

export default AgentCommunityController
