/** Aeoth Desktop application bundle: local HTTP transport and Electron renderer integration. */

import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Context } from '@deepseek-ai/cordis'
import z from '@deepseek-ai/schemastery'
import { addHarnessSourceSection } from '@deepseek-ai/dsh-app-boot'
import type {} from '@deepseek-ai/dsh-client-connection'
import * as DesktopStatic from '@deepseek-ai/dsh-host-desktop-static'
import type {} from '@deepseek-ai/dsh-host-desktop-server'
import type {} from '@deepseek-ai/dsh-shell-env'

/** Stable Cordis plugin name. */
export const name = 'desktop-app'

/** This installation's root, from either source or built entry. */
const SOURCE_ROOT = fileURLToPath(new URL('../../../..', import.meta.url))
const LOOPBACK_HOST = '127.0.0.1'
const DESKTOP_URL = 'DSH_DESKTOP_URL' as const

/** Desktop-only configuration. */
export interface Config {
  /** Register the Desktop orientation prompt and shell URL variable. */
  surfaceContext: boolean
}

export const Config: z<Config> = z.object({
  surfaceContext: z.boolean().default(true),
})

export const inject = ['webServer']

function localDesktopUrl(ctx: Context): string {
  const port = ctx.webServer?.port
  if (port === undefined) throw new Error('desktop-app: webServer service missing while resolving Desktop URL')
  return `http://${LOOPBACK_HOST}:${String(port)}`
}

function resolveDistIndex(): string {
  const require = createRequire(import.meta.url)
  let packageRoot: string
  try {
    packageRoot = dirname(require.resolve('@deepseek-ai/dsh-desktop-frontend/package.json'))
  } catch {
    throw new Error('desktop-app: @deepseek-ai/dsh-desktop-frontend is not resolvable from this composition')
  }
  return join(packageRoot, 'dist', 'index.html')
}

function desktopSurfacePrompt(url: string): string {
  return `You are interacting with the user through the Aeoth Agent Desktop application at ${url}. `
    + 'When the user refers to "this app" without naming another target, they mean the Aeoth Desktop application. '
    + 'The application does not provide implicit file, screen, DOM, or browser context; inspect the workspace or use the available tools when needed.'
}

/** Mount the Desktop transport, static renderer, model orientation, and shell environment. */
export function apply(ctx: Context, config: Config): void {
  ctx.plugin(DesktopStatic, { distIndex: resolveDistIndex() })
  if (!config.surfaceContext) return
  ctx.inject(['systemPrompt'], (promptCtx) => {
    addHarnessSourceSection(promptCtx, SOURCE_ROOT)
    promptCtx.systemPrompt.section({
      name: 'app:desktop-surface',
      order: promptCtx.systemPrompt.getSectionOrder('WEB_SURFACE'),
      text: () => desktopSurfacePrompt(localDesktopUrl(promptCtx)),
    })
  })
  ctx.inject(['shellEnv'], (runtimeCtx) => {
    runtimeCtx.shellEnv.register({
      name: 'desktop-runtime',
      variables: {
        [DESKTOP_URL]: { description: 'Canonical local URL used by the Aeoth Desktop renderer.' },
      },
      resolve: () => ({ [DESKTOP_URL]: localDesktopUrl(runtimeCtx) }),
    })
  })
}
