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
import { BotCommunityIcon } from './BotCommunityIcon.tsx'
import { BotCommunityPage } from './page.tsx'
import type { CommunityComposerReference } from './CommunityComposer.tsx'
import { en, zh, type AgentCommunityLocaleKey } from './locales.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' { interface LocaleNamespaceMap { 'agentCommunity': AgentCommunityLocaleKey } }

const NS = 'agentCommunity'
const PANEL_ID = 'agent-community' as MainPanelId
const inject = ['slots', 'locale', 'remote', 'remote.agentCommunity', 'remote.session', 'remote.fileReferences', 'remote.sessionReferenceResolver']
type Face = {
  remote: ClientRemote['agentCommunity']
  modelCatalog: () => ReturnType<ClientRemote['session']['modelCatalog']>
  lookupReferences: (sessionId: SessionId, query: string, signal: AbortSignal) => Promise<readonly CommunityComposerReference[]>
  lookupCommands: (sessionId: SessionId) => Promise<readonly { readonly name: string; readonly description: string }[]>
}
export type BotCommunityProps = PropsRuntime<'main'> & PropsLocale<typeof NS> & InjectFace<Face>

export { inject }

/** Register Bots as a built-in left-sidebar destination, not a Plugins-page item. */
export function apply(ctx: Context): void {
  const t = ctx.locale.bind(NS)
  ctx.effect(() => ctx.locale.register(NS, { en, zh }), 'agent-community: dictionaries')
  ctx.slots.inject('main', () => ctx.slots.register({
    name: 'main', key: PANEL_ID, locale: NS,
    inject: (): Face => ({
      remote: ctx.remote.agentCommunity,
      modelCatalog: () => ctx.remote.session.modelCatalog(),
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
          const path = candidate.path.includes(' ') ? `@\"${candidate.path}${candidate.kind === 'directory' ? '/' : ''}\"` : `@${candidate.path}${candidate.kind === 'directory' ? '/' : ''}`
          return { key: `file:${index}:${candidate.path}`, label: path, detail: candidate.kind, insert: path }
        }) : []
        const sessionItems = sessions.ok ? sessions.value.map(candidate => ({
          key: `session:${candidate.sessionId}`, label: candidate.displayTitle ?? candidate.label, detail: 'conversation', insert: candidate.mention,
        })) : []
        return [...fileItems, ...sessionItems]
      },
    }),
  }, BotCommunityPage))
  ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
    name: 'sidebar.panellist', id: PANEL_ID, order: 20, locale: NS, label: () => t('title'),
  }, BotCommunityIcon))
}
