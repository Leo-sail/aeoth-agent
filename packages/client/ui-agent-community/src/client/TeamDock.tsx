import { useEffect, useState } from 'react'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import type { TeamApprovalAnswer, TeamOverview } from '@deepseek-ai/dsh-agent-community/types'
import { Button, IconUsersOutlineRegular, StateDot, type StateDotState } from '@deepseek-ai/dsh-client-ui-primitives'
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import css from './TeamDock.module.css'

/** Business actions injected by the Agent Community plugin. */
export interface TeamDockInjected {
  /** Teams led by one conversation, active first. */
  teamOverview: (sessionId: SessionId) => Promise<readonly TeamOverview[]>
  answerApproval: (answer: TeamApprovalAnswer) => Promise<void>
  openSession: (sessionId: SessionId) => void
  openRoom: (roomId: string) => void
}

export type TeamDockProps = PropsRuntime<'conversation.input.dock'> & TeamDockInjected & PropsLocale<'agentCommunity'>

const POLL_MS = 2000

function presenceDot(presence: string): StateDotState {
  switch (presence) {
    case 'running': return 'ongoing'
    case 'waiting-human': return 'warning'
    case 'failed': return 'error'
    case 'queued': return 'idle'
    default: return 'done'
  }
}

/**
 * Bar above the composer of a conversation that leads an active team: member
 * activity with links to their sessions, approvals members are waiting for,
 * and the way into the team chat.
 */
export function TeamDock({ sessionId, teamOverview, answerApproval, openSession, openRoom, t }: TeamDockProps) {
  const [teams, setTeams] = useState<readonly TeamOverview[]>([])
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let alive = true
    const refresh = (): void => {
      void teamOverview(sessionId).then((value) => { if (alive) setTeams(value) }).catch(() => undefined)
    }
    refresh()
    const timer = window.setInterval(refresh, POLL_MS)
    return () => { alive = false; window.clearInterval(timer) }
  }, [sessionId, teamOverview])

  const active = teams.filter(team => team.room.team?.status === 'active' || team.approvals.length > 0)
  if (active.length === 0) return null

  const answer = (id: string, outcome: TeamApprovalAnswer['outcome']): void => {
    if (busy) return
    setBusy(true)
    void answerApproval({ id, outcome }).finally(() => { setBusy(false) })
  }

  return <div className={css.dock}>
    {active.map(team => <section key={team.room.id} className={css.team} aria-label={team.room.name}>
      <div className={css.heading}>
        <IconUsersOutlineRegular size={14} />
        <strong className={css.name}>{team.room.name}</strong>
        <span className={css.members}>
          {team.members.map(member => <button key={member.botId} type="button" className={css.member} disabled={member.sessionId === undefined}
            title={`${t(`presence.${member.presence}`)} · ${t('openSession')}`}
            onClick={() => { if (member.sessionId !== undefined) openSession(member.sessionId) }}>
            <StateDot state={presenceDot(member.presence)} />{member.name}
          </button>)}
        </span>
        <Button size="sm" variant="ghost" onClick={() => { openRoom(team.room.id) }}>{t('headerOpenRoom')}</Button>
      </div>
      {team.approvals.map(item => <div key={item.id} role="status" className={css.approval}>
        <span className={css.approvalText} title={item.reason}>{t('approvalRequest', { member: item.memberName, tool: item.toolName })}{item.reason ? `：${item.reason.slice(0, 200)}` : ''}</span>
        <Button size="sm" variant="outline" disabled={busy} onClick={() => { answer(item.id, 'rejected') }}>{t('approvalReject')}</Button>
        <Button size="sm" disabled={busy} onClick={() => { answer(item.id, 'allowed-once') }}>{t('approvalAllow')}</Button>
      </div>)}
    </section>)}
  </div>
}
