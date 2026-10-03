/** Shared Web/Desktop management surface using renderer-bound observables. */
import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-api-remotes/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-plugin-manager/client'
import type {} from '@deepseek-ai/dsh-client-ui-workspace/client'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type { SessionTarget } from '@deepseek-ai/dsh-api-session-controller/client'
import { MemoryCard } from './MemoryCard.tsx'
import { MemorySettingsController } from './controller.ts'
import { en, zh, type MemorySettingsLocaleKey } from './locales.ts'
export const NS = 'settings.memory'
export const inject = ['slots', 'locale', 'remote', 'remote.memory', 'uiWorkspace']
declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap { 'settings.memory': MemorySettingsLocaleKey }
}
export function apply(ctx: Context): void {
  const t = ctx.locale.bind(NS)
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'memory: dictionaries')
  const controller = new MemorySettingsController(ctx.remote.memory)
  ctx.effect(() => () => controller.dispose(), 'memory: controller')
  ctx.slots.inject('plugins.item', () => ctx.slots.register({
    name: 'plugins.item', id: 'memory', order: 30, label: () => t('title'), locale: NS,
    inject: () => ({ ...controller.inject(), openSession: (id: SessionTarget) => ctx.uiWorkspace.openSession(id) }),
  }, MemoryCard))
}
