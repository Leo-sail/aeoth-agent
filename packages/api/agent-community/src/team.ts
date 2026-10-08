/** Host-side team runtime: lead delivery, room activity, and member approval routing. */
import { randomUUID } from 'node:crypto'
import type { Context } from '@deepseek-ai/cordis'
import type { Agent } from '@deepseek-ai/dsh-agent'
import type { AgentCommunityService } from '@deepseek-ai/dsh-agent-community'
import type { BotRoom, BotTeamMembership, TeamApproval, TeamApprovalAnswer } from '@deepseek-ai/dsh-agent-community/types'
import type { SessionController } from '@deepseek-ai/dsh-api-session-controller'
import { createUserMessage } from '@deepseek-ai/dsh-llm'
import type { ContentBlock } from '@deepseek-ai/dsh-llm'
import type { SessionId } from '@deepseek-ai/dsh-session'
import type { ApprovalOutcome, ApprovalRequestEvent } from '@deepseek-ai/dsh-user-approval/types'
import type {} from '@deepseek-ai/dsh-permission-presets'

/** Durable attribution of one team-room message delivered into a lead Session. */
export interface AgentTeamMessageSource {
  readonly kind: 'agent-team'
  /** A message another participant addressed to this Session (`relay` context form). */
  readonly form: 'relay'
  readonly roomId: string
  readonly senderName: string
}

declare module '@deepseek-ai/dsh-llm' {
  interface MessageSourceMap {
    'agent-team': AgentTeamMessageSource
  }
}

const MAX_WAIT_MS = 3_600_000
const MIN_WAIT_MS = 1_000

interface PendingApproval {
  readonly view: TeamApproval
  readonly settle: (outcome: ApprovalOutcome) => void
}

/** Process-local team coordination owned by the Agent Community controller. */
export class TeamRuntime {
  private readonly waiters = new Map<string, Set<() => void>>()
  private readonly approvals = new Map<string, PendingApproval>()

  constructor(
    private readonly ctx: Context,
    private readonly service: () => AgentCommunityService,
    private readonly sessions: () => SessionController,
  ) {}

  /** Wake every `team_wait` caller of one room. */
  notify(roomId: string): void {
    const waiters = this.waiters.get(roomId)
    if (waiters === undefined) return
    this.waiters.delete(roomId)
    for (const wake of waiters) wake()
  }

  /**
   * Wait for the next activity of one team room.
   * @param roomId - team room to observe.
   * @param timeoutMs - bounded wait duration.
   * @param signal - caller cancellation.
   * @returns whether the wait ended by timeout.
   */
  async wait(roomId: string, timeoutMs: number, signal: AbortSignal): Promise<{ timedOut: boolean }> {
    const bounded = Math.min(MAX_WAIT_MS, Math.max(MIN_WAIT_MS, timeoutMs))
    return await new Promise((resolve) => {
      const waiters = this.waiters.get(roomId) ?? new Set<() => void>()
      this.waiters.set(roomId, waiters)
      const finish = (timedOut: boolean): void => {
        clearTimeout(timer)
        signal.removeEventListener('abort', onAbort)
        waiters.delete(wake)
        resolve({ timedOut })
      }
      const wake = (): void => { finish(false) }
      const onAbort = (): void => { finish(false) }
      const timer = setTimeout(() => { finish(true) }, bounded)
      timer.unref()
      waiters.add(wake)
      signal.addEventListener('abort', onAbort, { once: true })
    })
  }

  /**
   * Steer one team-room message into a session lead. A running lead receives
   * it at its nearest step boundary; an idle or cold lead starts a turn.
   * @param room - session-led team room.
   * @param senderName - display name of the author.
   * @param text - complete message for the lead.
   */
  async deliverToSessionLead(room: BotRoom, senderName: string, text: string): Promise<void> {
    const leader = room.team?.leader
    if (leader?.kind !== 'session') return
    const resolved = await this.sessions().resolveAgent(leader.sessionId)
    if ('error' in resolved) throw new Error(`team lead Session is unavailable: ${resolved.error.message}`)
    await this.steer(resolved.agent, room, senderName, text)
  }

  /**
   * Steer one message into a live member Session that is executing a turn.
   * @param sessionId - member room Session.
   * @param room - owning team room.
   * @param senderName - display name of the author.
   * @param text - message text.
   * @returns whether the member was running and received the message.
   */
  async steerRunningMember(sessionId: SessionId, room: BotRoom, senderName: string, text: string): Promise<boolean> {
    const agent = this.ctx.get('agents')?.get(sessionId)
    if (agent === undefined || agent.status !== 'running') return false
    await this.steer(agent, room, senderName, text)
    return true
  }

  private async steer(agent: Agent, room: BotRoom, senderName: string, text: string): Promise<void> {
    const content: ContentBlock[] = [{ type: 'text', text: `[Team "${room.name}"] ${senderName}:\n${text}` }]
    agent.steer(createUserMessage({ content, source: { kind: 'agent-team', form: 'relay', roomId: room.id, senderName } }))
    await this.ctx.sessions.flush(agent.session)
  }

  /**
   * Copy the session lead's permission preset onto one member Session before
   * its run, so members act under the same sandbox and approval policy. A lead
   * whose knobs match no preset leaves the member on its current policy.
   * @param room - owning team room.
   * @param member - member Agent about to receive work.
   */
  inheritLeadPolicy(room: BotRoom, member: Agent): void {
    const leader = room.team?.leader
    if (leader?.kind !== 'session') return
    const presets = this.ctx.get('permissionPresets')
    const lead = this.ctx.sessions.get(leader.sessionId)
    if (presets === undefined || lead === undefined) return
    const preset = presets.current(lead)
    if (preset === 'custom') return
    try {
      presets.set(member.session, preset)
    } catch (error) {
      this.ctx.logger.warn(`agent team: cannot copy lead preset "${preset}": ${String(error)}`)
    }
  }

  /**
   * Answer an approval that no open conversation claimed. Hidden member
   * Sessions are never retained by a client, so their questions fall through
   * every answerer; the team keeps them pending until a person decides from
   * the team room or the lead conversation.
   * @param request - the approval request after every other answerer delegated.
   * @param membership - the asking Session's team role.
   * @returns the human decision, or `cancelled` when the request is withdrawn.
   */
  async holdApproval(request: ApprovalRequestEvent, membership: BotTeamMembership): Promise<ApprovalOutcome> {
    if (request.signal?.aborted === true) return 'cancelled'
    const id = randomUUID()
    const view: TeamApproval = {
      id, roomId: membership.room.id, memberName: membership.name, sessionId: request.agent.id,
      toolName: request.toolName, ...(request.reason === undefined ? {} : { reason: request.reason }),
      createdAt: new Date().toISOString(),
    }
    await this.service().setRunAwaitingApproval(request.agent.id, true).catch(() => undefined)
    this.notify(membership.room.id)
    const outcome = await new Promise<ApprovalOutcome>((resolve) => {
      const onAbort = (): void => { settle('cancelled') }
      const settle = (value: ApprovalOutcome): void => {
        if (!this.approvals.delete(id)) return
        request.signal?.removeEventListener('abort', onAbort)
        resolve(value)
      }
      this.approvals.set(id, { view, settle })
      request.signal?.addEventListener('abort', onAbort, { once: true })
    })
    await this.service().setRunAwaitingApproval(request.agent.id, false).catch(() => undefined)
    this.notify(membership.room.id)
    return outcome
  }

  /** List pending member approvals, optionally for one room. */
  listApprovals(roomId?: string): readonly TeamApproval[] {
    return [...this.approvals.values()].map(item => item.view).filter(view => roomId === undefined || view.roomId === roomId)
  }

  /**
   * Decide one pending member approval.
   * @param answer - approval id and the human decision.
   * @returns whether the approval was still pending.
   */
  answerApproval(answer: TeamApprovalAnswer): boolean {
    const pending = this.approvals.get(answer.id)
    if (pending === undefined) return false
    pending.settle(answer.outcome)
    return true
  }
}

/**
 * Whether a team member Session is hidden from ordinary conversation answerers.
 * A session lead is the user's own conversation and keeps the normal approval path.
 * @param membership - resolved team role, if any.
 * @param sessionId - asking Session.
 * @returns whether the team approval queue owns its unanswered questions.
 */
export function isHiddenTeamSession(membership: BotTeamMembership | undefined, sessionId: SessionId): membership is BotTeamMembership {
  if (membership === undefined) return false
  const leader = membership.room.team?.leader
  return !(leader?.kind === 'session' && leader.sessionId === sessionId)
}
