/** Model-facing team tools and policy installed in every top-level and Agent Session. */
import type { Context } from '@deepseek-ai/cordis'
import type { Agent } from '@deepseek-ai/dsh-agent'
import type { AgentCommunityService } from '@deepseek-ai/dsh-agent-community'
import type { BotId, BotIdentity, BotRoom, BotRun, BotTeamMembership } from '@deepseek-ai/dsh-agent-community/types'
import { defineTool } from '@deepseek-ai/dsh-tools'
import type { JsonValue } from '@deepseek-ai/dsh-util-values'
import type {} from '@deepseek-ai/dsh-system-prompt'
import type { TeamRuntime } from './team.ts'

/** Controller capabilities the team tools borrow. */
export interface TeamToolHost {
  readonly service: () => AgentCommunityService
  readonly runtime: TeamRuntime
  /** Start queued member runs now instead of waiting for the recovery scan. */
  readonly schedule: (runs: readonly BotRun[]) => void
}

/** Display name of a top-level conversation that leads a team. */
export const MAIN_LEAD_NAME = '太易'

const POLICY = `Agent team: you can work with the user's persistent Agents as a team, and you lead it. Call team_agents to see which Agents exist and what each is for. When a request splits into parts that benefit from different Agents' expertise or from parallel work, or the user asks for a team or for specific Agents, call team_assemble with only the Agents the work needs, then give each part to a member with team_assign. Otherwise do the work yourself.

Assigned members work in parallel, in your working directory, under your permission settings, with their own tools and skills. Each member's final reply arrives to you as a team message. While members work you may do your own part, check team_status, or call team_wait; you do not need to wait in this turn, because reports start a new turn when they arrive. Reassign or use team_message to resolve gaps, conflicts, or questions. Members share one working directory, so give them disjoint files to change and review the combined result. When every needed report is in, call team_dismiss with a summary of the outcome, then answer the user.

If your task came from a team lead, you are a team member: do the assigned work, and make your final reply a complete report for the lead (what you did, results, files changed, open problems). Use team_message to ask the lead or another member something, or to share information they need; do not wait for replies unless you cannot continue without them.`

const ARRAY_OF_NAMES = { type: 'array', required: true, items: { type: 'string' } } as const

function jsonOutput(): { schema: { type: 'json' }; render: (args: unknown, value: JsonValue) => [{ type: 'text'; text: string }] } {
  return { schema: { type: 'json' }, render: (_args, value) => [{ type: 'text', text: JSON.stringify(value) }] }
}

/** Error text the model can act on. */
class TeamToolError extends Error {}

function caller(agent: Agent | undefined): Agent {
  if (agent === undefined) throw new TeamToolError('team tools require a calling Agent')
  return agent
}

function normalized(name: string): string {
  return name.trim().replace(/^@/u, '').toLocaleLowerCase()
}

function memberNames(room: BotRoom, bots: readonly BotIdentity[]): string[] {
  return room.memberIds.flatMap(id => bots.find(bot => bot.id === id)?.name ?? [])
}

/** Resolve member names to Bot ids inside one team; `all` expands to every member except `exclude`. */
function resolveMembers(
  room: BotRoom, bots: readonly BotIdentity[], names: readonly string[], exclude?: BotId,
): { ids: BotId[]; names: string[] } {
  const wanted = names.map(normalized)
  const ids = new Set<BotId>()
  for (const name of wanted) {
    if (name === 'all') {
      for (const id of room.memberIds) if (id !== exclude) ids.add(id)
      continue
    }
    if (name === 'lead') continue
    const bot = bots.find(item => item.name === name && room.memberIds.includes(item.id))
    if (bot === undefined) {
      throw new TeamToolError(`"${name}" is not a member of team "${room.name}". Members: ${memberNames(room, bots).join(', ') || 'none'}. Add Agents with team_assemble.`)
    }
    if (bot.id !== exclude) ids.add(bot.id)
  }
  return { ids: [...ids], names: [...ids].map(id => bots.find(bot => bot.id === id)?.name ?? id) }
}

function senderOf(membership: BotTeamMembership): { kind: 'leader' | 'bot'; botId?: string; name: string } {
  return membership.role === 'lead'
    ? { kind: 'leader', ...(membership.botId === undefined ? {} : { botId: membership.botId }), name: membership.name }
    : { kind: 'bot', ...(membership.botId === undefined ? {} : { botId: membership.botId }), name: membership.name }
}

function subjectOf(task: string, subject: string | undefined): string {
  const explicit = subject?.trim()
  if (explicit) return explicit.slice(0, 120)
  const line = task.trim().split('\n')[0] ?? ''
  return line.length > 80 ? `${line.slice(0, 79)}…` : line
}

/** Install the team tool set into one exact Agent scope. */
function install(agent: Agent, host: TeamToolHost): () => void {
  const scoped = agent.ctx
  const disposers: Array<() => unknown> = []
  const service = host.service

  async function membershipOf(target: Agent): Promise<BotTeamMembership | undefined> {
    return await service().teamMembership(target.id)
  }

  async function requireTeam(target: Agent): Promise<BotTeamMembership> {
    const membership = await membershipOf(target)
    if (membership === undefined) throw new TeamToolError('You are not in a team. A lead creates one with team_assemble.')
    return membership
  }

  async function requireLead(target: Agent): Promise<BotTeamMembership> {
    const membership = await requireTeam(target)
    if (membership.role !== 'lead') throw new TeamToolError(`Only the lead of team "${membership.room.name}" can do this. Use team_message to ask the lead.`)
    return membership
  }

  try {
    disposers.push(scoped.systemPrompt.section({ name: 'agent-team:policy', order: scoped.systemPrompt.getSectionOrder('TEAM_POLICY'), text: POLICY }))

    disposers.push(scoped.tools.register(defineTool({
      name: 'team_agents',
      description: 'List the persistent Agents you can put in a team, with what each is for and whether it is busy, plus your current team and role.',
      parameters: {},
      output: jsonOutput(),
      isConcurrencySafe: () => true,
      async execute(_args, exec) {
        const self = caller(exec.agent)
        const [snapshot, membership, link] = await Promise.all([service().snapshot(), membershipOf(self), service().roomLinkOf(self.id)])
        const team = membership?.room
        return {
          ...(team === undefined ? {} : { team: { name: team.name, role: membership?.role ?? 'member', status: team.team?.status ?? 'active', members: memberNames(team, snapshot.bots) } }),
          agents: snapshot.bots.filter(bot => bot.id !== link?.bot.id).map(bot => ({
            name: bot.name, description: bot.description, presence: bot.presence ?? 'idle',
            ...(bot.model === undefined ? {} : { model: bot.model }),
            ...(team === undefined ? {} : { inTeam: team.memberIds.includes(bot.id) }),
          })),
        }
      },
    })))

    disposers.push(scoped.tools.register(defineTool({
      name: 'team_assemble',
      description: 'Form a team that you lead from existing Agents, or add Agents to the team you already lead. The team appears to the user as a group chat. Choose only the Agents the work needs.',
      parameters: {
        members: { ...ARRAY_OF_NAMES, description: 'Agent names from team_agents.' },
        name: { type: 'string', description: 'Short team name shown to the user; defaults to the brief\'s first line.' },
        brief: { type: 'string', description: 'Goal and context shared with every member before assignments.' },
      },
      output: jsonOutput(),
      async execute(args, exec) {
        const self = caller(exec.agent)
        const membership = await membershipOf(self)
        if (membership !== undefined && membership.role === 'member') {
          throw new TeamToolError(`You are a member of team "${membership.room.name}"; only its lead adds members. Use team_message to suggest it.`)
        }
        if (membership?.room.team?.leader.kind === 'bot') {
          throw new TeamToolError(`You lead the fixed team "${membership.room.name}"; its members are chosen by the user. Use team_assign.`)
        }
        const link = await service().roomLinkOf(self.id)
        if (link !== undefined && link.room.directBotId === undefined) {
          throw new TeamToolError('Only a conversation with the user can lead a team.')
        }
        const snapshot = await service().snapshot()
        const requested = [...new Set(args.members.map(normalized))]
        const unknown = requested.filter(name => !snapshot.bots.some(bot => bot.name === name))
        if (unknown.length > 0) throw new TeamToolError(`Unknown Agents: ${unknown.join(', ')}. Available: ${snapshot.bots.map(bot => bot.name).join(', ') || 'none'}.`)
        const selected = snapshot.bots.filter(bot => requested.includes(bot.name) && bot.id !== link?.bot.id)
        if (selected.length === 0) throw new TeamToolError('Choose at least one Agent other than yourself.')
        const brief = args.brief?.trim()
        const active = membership?.room.team?.status === 'active' ? membership.room : undefined
        let room: BotRoom
        let added: string[]
        if (active !== undefined) {
          const fresh = selected.filter(bot => !active.memberIds.includes(bot.id))
          room = fresh.length === 0 ? active : await service().updateRoom({
            id: active.id, memberIds: [...active.memberIds, ...fresh.map(bot => bot.id)],
          })
          added = fresh.map(bot => bot.name)
        } else {
          const cwd = self.session.header.cwd
          const leaderName = link?.bot.name ?? MAIN_LEAD_NAME
          const name = args.name?.trim() || subjectOf(brief ?? '', undefined) || `${leaderName} 的团队`
          room = await service().createRoom({
            name: name.slice(0, 120), memberIds: selected.map(bot => bot.id), mentionOnly: false,
            team: { leaderSessionId: self.id, leaderName, ...(cwd === undefined ? {} : { workspace: cwd }) },
          })
          added = selected.map(bot => bot.name)
        }
        if (brief) {
          const lead = await membershipOf(self)
          await service().postTeamMessage({
            roomId: room.id, sender: { kind: 'leader', name: lead?.name ?? MAIN_LEAD_NAME }, text: brief,
            kind: 'message', targetBotIds: [], targetNames: ['all'], origin: 'team-message',
          })
        }
        host.runtime.notify(room.id)
        return {
          team: room.name, lead: room.team?.leaderName ?? MAIN_LEAD_NAME, added,
          members: room.memberIds.flatMap((id) => {
            const bot = snapshot.bots.find(item => item.id === id)
            return bot === undefined ? [] : [{ name: bot.name, description: bot.description }]
          }),
          next: 'Give each member its part with team_assign.',
        }
      },
    })))

    disposers.push(scoped.tools.register(defineTool({
      name: 'team_assign',
      description: 'Give a task to one or more team members. Lead only. Members start at once and work in parallel; a member already working takes the new task after its current one. Each member reports back with its final reply.',
      parameters: {
        to: { ...ARRAY_OF_NAMES, description: 'Member names, or "all".' },
        task: { type: 'string', required: true, description: 'Complete, self-contained instructions and acceptance criteria. Members do not see your conversation.' },
        subject: { type: 'string', description: 'Short title shown in the team chat.' },
      },
      output: jsonOutput(),
      async execute(args, exec) {
        const self = caller(exec.agent)
        const membership = await requireLead(self)
        const snapshot = await service().snapshot()
        const room = membership.room
        const targets = resolveMembers(room, snapshot.bots, args.to, membership.botId)
        if (targets.ids.length === 0) throw new TeamToolError('Name at least one member other than yourself.')
        const subject = subjectOf(args.task, args.subject)
        const result = await service().postTeamMessage({
          roomId: room.id, sender: senderOf(membership), text: args.task, kind: 'assign',
          targetBotIds: targets.ids, targetNames: targets.names, origin: 'team-assign',
          assignment: { subject, fromName: membership.name },
        })
        host.schedule(result.runs)
        host.runtime.notify(room.id)
        return {
          subject,
          assigned: result.runs.map(run => ({
            member: snapshot.bots.find(bot => bot.id === run.botId)?.name ?? run.botId, assignment: run.id,
          })),
        }
      },
    })))

    disposers.push(scoped.tools.register(defineTool({
      name: 'team_message',
      description: 'Send a message to your team lead ("lead"), to members by name, or to "all". A recipient that is working receives it at its next step; an idle one starts working on it.',
      parameters: {
        to: { ...ARRAY_OF_NAMES, description: '"lead", member names, or "all".' },
        message: { type: 'string', required: true, description: 'Self-contained message.' },
      },
      output: jsonOutput(),
      async execute(args, exec) {
        const self = caller(exec.agent)
        const membership = await requireTeam(self)
        const room = membership.room
        const snapshot = await service().snapshot()
        const toLead = membership.role !== 'lead' && args.to.some(name => ['lead', 'all'].includes(normalized(name)))
        const targets = resolveMembers(room, snapshot.bots, args.to, membership.botId)
        const leaderBotId = room.team?.leader.kind === 'bot' ? room.team.leader.botId : undefined
        const memberSessions = room.memberSessions ?? {}
        const needRun: BotId[] = []
        const delivered: { to: string; status: 'steered' | 'queued' }[] = []
        const recipients = [
          ...targets.ids,
          ...(toLead && leaderBotId !== undefined && !targets.ids.includes(leaderBotId) ? [leaderBotId] : []),
        ]
        for (const botId of recipients) {
          const name = botId === leaderBotId ? 'lead' : snapshot.bots.find(bot => bot.id === botId)?.name ?? botId
          const sessionId = memberSessions[botId]
          if (sessionId !== undefined && await host.runtime.steerRunningMember(sessionId, room, membership.name, args.message)) {
            delivered.push({ to: name, status: 'steered' })
          } else {
            needRun.push(botId)
            delivered.push({ to: name, status: 'queued' })
          }
        }
        const result = await service().postTeamMessage({
          roomId: room.id, sender: senderOf(membership), text: args.message, kind: 'message',
          targetBotIds: needRun, targetNames: [...(toLead ? ['lead'] : []), ...targets.names], origin: 'team-message',
        })
        if (toLead && room.team?.leader.kind === 'session') {
          await host.runtime.deliverToSessionLead(room, membership.name, args.message)
          delivered.push({ to: 'lead', status: 'steered' })
        }
        if (delivered.length === 0) throw new TeamToolError('Name at least one recipient other than yourself.')
        host.schedule(result.runs)
        host.runtime.notify(room.id)
        return { delivered }
      },
    })))

    disposers.push(scoped.tools.register(defineTool({
      name: 'team_status',
      description: 'Show your team: each member\'s activity, every assignment with its status and report excerpt, and approvals waiting for the user.',
      parameters: {},
      output: jsonOutput(),
      isConcurrencySafe: () => true,
      async execute(_args, exec) {
        const membership = await requireTeam(caller(exec.agent))
        const snapshot = await service().snapshot()
        const room = snapshot.rooms.find(item => item.id === membership.room.id) ?? membership.room
        const nameOf = (botId: BotId): string => snapshot.bots.find(bot => bot.id === botId)?.name ?? botId
        const runs = snapshot.runs.filter(run => run.roomId === room.id && run.origin === 'team-assign').slice(-40)
        return {
          team: room.name, status: room.team?.status ?? 'active', lead: room.team?.leaderName ?? '', you: membership.name, role: membership.role,
          members: room.memberIds.map((id) => {
            const bot = snapshot.bots.find(item => item.id === id)
            return { name: nameOf(id), presence: bot?.presence ?? 'idle', ...(bot === undefined ? {} : { description: bot.description }) }
          }),
          assignments: runs.map((run) => {
            const reply = snapshot.messages.find(message => message.runId === run.id)
            return {
              assignment: run.id, member: nameOf(run.botId), subject: run.assignment?.subject ?? '', status: run.status,
              ...(run.awaitingApproval === true ? { waitingFor: 'user approval' } : {}),
              ...(run.error === undefined ? {} : { error: run.error }),
              ...(reply === undefined ? {} : { report: reply.text.length > 600 ? `${reply.text.slice(0, 600)}…` : reply.text }),
            }
          }),
          pendingApprovals: host.runtime.listApprovals(room.id).map(item => ({ member: item.memberName, tool: item.toolName })),
        }
      },
    })))

    disposers.push(scoped.tools.register(defineTool({
      name: 'team_wait',
      description: 'Wait until something changes in your team (a report, a message, an assignment finishing, an approval). Returns at once when no member is working.',
      parameters: {
        timeout_ms: { type: 'integer', description: 'Maximum wait in milliseconds, 1000 to 3600000. Defaults to 120000.' },
      },
      output: jsonOutput(),
      async execute(args, exec) {
        const membership = await requireTeam(caller(exec.agent))
        const runs = await service().listRuns()
        const working = runs.some(run => run.roomId === membership.room.id && (run.status === 'queued' || run.status === 'running'))
        if (!working && host.runtime.listApprovals(membership.room.id).length === 0) {
          return { timedOut: false, idle: true, note: 'No member is working. Check team_status, assign more work, or finish.' }
        }
        const result = await host.runtime.wait(membership.room.id, args.timeout_ms ?? 120_000, exec.signal)
        return { timedOut: result.timedOut, idle: false }
      },
    })))

    disposers.push(scoped.tools.register(defineTool({
      name: 'team_dismiss',
      description: 'Finish the team\'s work: post your summary to the team chat and stop any unfinished assignments. Lead only. Answer the user afterwards.',
      parameters: {
        summary: { type: 'string', required: true, description: 'Outcome of the team\'s work for the team chat.' },
      },
      output: jsonOutput(),
      async execute(args, exec) {
        const membership = await requireLead(caller(exec.agent))
        const room = await service().dismissTeam({ roomId: membership.room.id, summary: args.summary })
        host.runtime.notify(room.id)
        return { dismissed: true, team: room.name }
      },
    })))
  } catch (error: unknown) {
    for (const dispose of disposers.reverse()) void dispose()
    throw error
  }
  return () => { for (const dispose of disposers.reverse()) void dispose() }
}

/**
 * Install team tools in every live or later top-level and Agent Session.
 * Delegated subagents are excluded: a team member is a persistent Agent.
 * @param ctx - controller context carrying the Agent registry.
 * @param host - controller capabilities used by the tools.
 */
export function installTeamTools(ctx: Context, host: TeamToolHost): void {
  const installed = new Map<Agent, () => void>()
  const maybeInstall = (agent: Agent): void => {
    if (installed.has(agent) || agent.session.header.origin === 'subagent') return
    try {
      installed.set(agent, install(agent, host))
    } catch (error) {
      ctx.logger.warn(`agent team tools unavailable for "${agent.id}": ${String(error)}`)
    }
  }
  for (const agent of ctx.agents.list()) maybeInstall(agent)
  ctx.on('agent/created', ({ agent }) => { maybeInstall(agent) })
  ctx.on('agent/disposed', ({ agent }) => {
    installed.get(agent)?.()
    installed.delete(agent)
  })
  ctx.effect(() => () => {
    for (const dispose of installed.values()) dispose()
    installed.clear()
  }, 'agent-community: team tools')
}
