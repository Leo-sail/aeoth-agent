import type { Context } from '@deepseek-ai/cordis'
import type { ClientRemote } from '@deepseek-ai/dsh-api-remotes/client'
import type {} from '@deepseek-ai/dsh-api-remotes/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type { MainPanelId } from '@deepseek-ai/dsh-client-ui-layout/client'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar/client'
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import { AgentsIcon } from './AgentsIcon.tsx'
import { GroupChatIcon } from './GroupChatIcon.tsx'
import { BotCommunityPage } from './page.tsx'
import type { CommunityComposerReference } from './CommunityComposer.tsx'
import { en, zh, type AgentCommunityLocaleKey } from './locales.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' { interface LocaleNamespaceMap { 'agentCommunity': AgentCommunityLocaleKey } }

const NS = 'agentCommunity'
const inject = ['slots', 'locale', 'remote', 'remote.agentCommunity', 'remote.session', 'remote.fileReferences', 'remote.sessionReferenceResolver']
/** 页面模式：`agents` 只展示 Agent 直聊，`teams` 只展示群聊。 */
export type BotCommunityMode = 'agents' | 'teams'
type Face = {
  remote: ClientRemote['agentCommunity']
  modelCatalog: () => ReturnType<ClientRemote['session']['modelCatalog']>
  lookupReferences: (sessionId: SessionId, query: string, signal: AbortSignal) => Promise<readonly CommunityComposerReference[]>
  lookupCommands: (sessionId: SessionId) => Promise<readonly { readonly name: string; readonly description: string }[]>
  mode: BotCommunityMode
}
export type BotCommunityProps = PropsRuntime<'main'> & PropsLocale<typeof NS> & InjectFace<Face>

export { inject }

/** 注册「Agent」与「协作团队」两个并列的左侧入口；两者共用同一页面组件，仅 mode 不同。 */
export function apply(ctx: Context): void {
  const t = ctx.locale.bind(NS)
  ctx.effect(() => ctx.locale.register(NS, { en, zh }), 'agent-community: dictionaries')

  const face = (mode: BotCommunityMode): Face => ({
    remote: ctx.remote.agentCommunity,
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
  for (const entry of entries) {
    ctx.slots.inject('main', () => ctx.slots.register({ name: 'main', key: entry.id, locale: NS, inject: () => face(entry.mode) }, BotCommunityPage))
    ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({ name: 'sidebar.panellist', id: entry.id, order: entry.order, locale: NS, label: () => t(entry.label) }, entry.icon))
  }
}
