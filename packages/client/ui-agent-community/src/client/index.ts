import type { Context } from '@deepseek-ai/cordis'
import type { ClientRemote } from '@deepseek-ai/dsh-api-remotes/client'
import type {} from '@deepseek-ai/dsh-api-remotes/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type { MainPanelId } from '@deepseek-ai/dsh-client-ui-layout/client'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar/client'
import type {} from '@deepseek-ai/dsh-client-ui-workspace/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import { AgentsIcon } from './AgentsIcon.tsx'
import { GroupChatIcon } from './GroupChatIcon.tsx'
import { BotCommunityPage } from './page.tsx'
import { TeamDock, type TeamDockInjected } from './TeamDock.tsx'
import type { CommunityComposerReference } from './CommunityComposer.tsx'
import { en, zh, type AgentCommunityLocaleKey } from './locales.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' { interface LocaleNamespaceMap { 'agentCommunity': AgentCommunityLocaleKey } }

const NS = 'agentCommunity'
const inject = ['slots', 'locale', 'remote', 'remote.agentCommunity', 'remote.session', 'remote.fileReferences', 'remote.sessionReferenceResolver', 'uiWorkspace', 'layout']
const TEAMS_PANEL = 'teams' as MainPanelId
/** 页面模式：`agents` 只展示 Agent 直聊，`teams` 只展示群聊。 */
export type BotCommunityMode = 'agents' | 'teams'
type Face = {
  remote: ClientRemote['agentCommunity']
  modelCatalog: () => ReturnType<ClientRemote['session']['modelCatalog']>
  lookupReferences: (sessionId: SessionId, query: string, signal: AbortSignal) => Promise<readonly CommunityComposerReference[]>
  lookupCommands: (sessionId: SessionId) => Promise<readonly { readonly name: string; readonly description: string }[]>
  mode: BotCommunityMode
  /** Show one Session (a team member's or the team lead's conversation) in the main column. */
  openSession: (sessionId: SessionId) => void
  /** Room requested by another surface (the lead conversation header); consumed once. */
  takePreferredRoom: () => string | undefined
  /** Observe later room requests while the page is mounted. */
  onPreferredRoom: (listener: () => void) => () => void
}
export type BotCommunityProps = PropsRuntime<'main'> & PropsLocale<typeof NS> & InjectFace<Face>

export { inject }

/** 注册「Agent」与「协作团队」两个并列的左侧入口；两者共用同一页面组件，仅 mode 不同。 */
export function apply(ctx: Context): void {
  const t = ctx.locale.bind(NS)
  ctx.effect(() => ctx.locale.register(NS, { en, zh }), 'agent-community: dictionaries')

  // One pending room request shared by the conversation header and the Teams page.
  let preferredRoom: string | undefined
  const preferredListeners = new Set<() => void>()
  const openRoom = (roomId: string): void => {
    preferredRoom = roomId
    for (const listener of preferredListeners) listener()
    ctx.layout.selectPanel(TEAMS_PANEL)
  }
  const openSession = (sessionId: SessionId): void => {
    ctx.layout.selectPanel(null)
    ctx.uiWorkspace.openSession(sessionId)
  }

  const face = (mode: BotCommunityMode): Face => ({
    remote: ctx.remote.agentCommunity,
    openSession,
    takePreferredRoom: () => { const value = preferredRoom; preferredRoom = undefined; return value },
    onPreferredRoom: (listener) => { preferredListeners.add(listener); return () => { preferredListeners.delete(listener) } },
    modelCatalog: () => ctx.remote.session.modelCatalog(),
    mode,
    lookupCommands: async (sessionId) => {
      const result = await ctx.remote.commands.list(sessionId)
      return result.ok ? result.value : []
    },
    lookupReferences: async (sessionId, query, signal) => {
      const [files, sessions] = await Promise.all([
        ctx.remote.fileReferences.list(sessionId, query, signal),
        ctx.remote.sessionReferenceResolver.candidates(sessionId, query, signal),
      ])
      const fileItems = files.ok ? files.value.map((candidate, index) => {
        const path = candidate.path.includes(' ') ? `@"${candidate.path}${candidate.kind === 'directory' ? '/' : ''}"` : `@${candidate.path}${candidate.kind === 'directory' ? '/' : ''}`
        return { key: `file:${index}:${candidate.path}`, label: path, detail: candidate.kind, insert: path }
      }) : []
      const sessionItems = sessions.ok ? sessions.value.map(candidate => ({
        key: `session:${candidate.sessionId}`, label: candidate.displayTitle ?? candidate.label, detail: 'conversation', insert: candidate.mention,
      })) : []
      return [...fileItems, ...sessionItems]
    },
  })

  const entries: readonly {
    readonly id: MainPanelId
    readonly mode: BotCommunityMode
    readonly order: number
    readonly label: AgentCommunityLocaleKey
    readonly icon: typeof AgentsIcon
  }[] = [
    { id: 'agents' as MainPanelId, mode: 'agents', order: 20, label: 'agents', icon: AgentsIcon },
    { id: 'teams' as MainPanelId, mode: 'teams', order: 21, label: 'teams', icon: GroupChatIcon },
  ]
  const dock: TeamDockInjected = {
    teamOverview: async (sessionId) => {
      const result = await ctx.remote.agentCommunity.teamOverview(sessionId)
      return result.ok ? result.value : []
    },
    answerApproval: async (answer) => { await ctx.remote.agentCommunity.answerTeamApproval(answer) },
    openSession,
    openRoom,
  }
  ctx.slots.inject('conversation.input.dock', () => ctx.slots.register({
    name: 'conversation.input.dock',
    id: 'agent-community-team',
    order: -10,
    locale: NS,
    inject: () => dock,
  }, TeamDock))

  for (const entry of entries) {
    ctx.slots.inject('main', () => ctx.slots.register({ name: 'main', key: entry.id, locale: NS, inject: () => face(entry.mode) }, BotCommunityPage))
    ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({ name: 'sidebar.panellist', id: entry.id, order: entry.order, locale: NS, label: () => t(entry.label) }, entry.icon))
  }
}
