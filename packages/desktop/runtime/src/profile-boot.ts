/** Desktop profile boot: compose the packaged Desktop application and own its lifecycle. */

import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { FiberState, type Context } from '@deepseek-ai/cordis'
import {
  boot,
  installFailLoud,
  createRuntimeResolution,
  PluginPackages,
  readProfilePatches,
  type Profile,
  type ProfileContext,
  type RuntimeResolution,
} from '@deepseek-ai/dsh-app-boot'
import { resolveAeothHome } from '@deepseek-ai/dsh-home-paths'
import { installProxyFromEnvironment } from '@deepseek-ai/dsh-http-proxy'
import { DSH_LAUNCH_ENVIRONMENT_KEY, type LaunchEnvironmentSnapshot } from '@deepseek-ai/dsh-launch-environment'
import { createProcessShutdown, type ProcessShutdown } from './process-shutdown.ts'

const NAME = 'aeoth'

/** Absolute package.json path used as the Desktop runtime resolution anchor. */
export const INSTALL_ANCHOR = fileURLToPath(new URL('../package.json', import.meta.url))

/** Root config written beside the application-owned Desktop profile. */
const PROFILE_ROOT_CONFIG = `# Aeoth Desktop profile root. The runtime composes this file from the packaged bundle and user patch layers.
[]
`

/** Root config filename inside the Desktop profile directory. */
export const PROFILE_ROOT_FILENAME = 'cordis.yml'

/** The application-owned profile and its independent runtime anchor. */
export interface ResolvedProfileRuntime {
  readonly profile: Profile
  readonly installAnchor: string
}

/** Inputs supplied by the Electron Desktop Host. */
export interface RunProfileOptions {
  readonly environment: LaunchEnvironmentSnapshot
  readonly profile: string
  readonly resolvedProfile: ResolvedProfileRuntime
  readonly packageManager?: ProfileContext['packageManager']
}

async function composeProfile(resolved: ResolvedProfileRuntime): Promise<{ profile: Profile; resolution: RuntimeResolution }> {
  writeFileSync(join(resolved.profile.dir, PROFILE_ROOT_FILENAME), PROFILE_ROOT_CONFIG)
  return {
    profile: resolved.profile,
    resolution: await createRuntimeResolution({ installAnchor: resolved.installAnchor, profile: resolved.profile }),
  }
}

/**
 * Boot the packaged Desktop profile and leave process lifetime to Electron's Host controller.
 * The Desktop surface has no public CLI; all profile and package state is owned by the application.
 */
export async function runProfile(options: RunProfileOptions): Promise<{ ctx: Context; shutdown: ProcessShutdown }> {
  const disposeProxy = await installProxyFromEnvironment(options.environment, (message) => {
    process.stderr.write(`${NAME}: ${message}\n`)
  })
  const app: { current?: Context } = {}
  const listeners = new Set<() => void>()
  let ready = false
  let interrupted = false
  let stopForSignal: ((code: number) => void) | undefined
  const terminate = (): void => { interrupted = true; stopForSignal?.(0) }
  const interrupt = (): void => { interrupted = true; stopForSignal?.(130) }
  let disposal: Promise<void> | undefined
  const dispose = (): Promise<void> => disposal ??= (async () => {
    process.off('SIGTERM', terminate)
    process.off('SIGINT', interrupt)
    listeners.clear()
    const failures: unknown[] = []
    for (const release of [() => app.current?.fiber.dispose(), disposeProxy]) {
      try { await release() } catch (error) { failures.push(error) }
    }
    if (failures.length === 1) throw failures[0]
    if (failures.length > 1) throw new AggregateError(failures, 'aeoth: Desktop profile cleanup failed')
  })()

  try {
    const composed = await composeProfile(options.resolvedProfile)
    const shutdown = createProcessShutdown(dispose)
    stopForSignal = code => shutdown.interrupt(code)
    process.on('SIGTERM', terminate)
    process.on('SIGINT', interrupt)
    installFailLoud(NAME, process, dispose)
    const profileContext: ProfileContext = {
      name: options.profile,
      ...(options.packageManager === undefined ? {} : { packageManager: options.packageManager }),
      dir: composed.profile.dir,
      patchPath: composed.profile.patchPath,
      installAnchor: options.resolvedProfile.installAnchor,
      startedBundles: composed.profile.layers.map(layer => layer.packageName),
      cwd: process.cwd(),
      home: resolveAeothHome(),
      overlays: [],
      telemetryDisabledEnv: process.env.DSH_TELEMETRY_DISABLED,
    }
    const rootConfig = join(composed.profile.dir, PROFILE_ROOT_FILENAME)
    const ctx = await boot(NAME, rootConfig, readProfilePatches(NAME, profileContext, composed.profile), async (hostCtx) => {
      app.current = hostCtx
      hostCtx.provide('profileContext', profileContext)
      hostCtx.provide(DSH_LAUNCH_ENVIRONMENT_KEY, options.environment)
      hostCtx.provide('appReady', {
        onReady(listener: () => void) {
          if (ready) { listener(); return () => {} }
          listeners.add(listener)
          return () => { listeners.delete(listener) }
        },
      })
      await hostCtx.plugin(PluginPackages, { resolution: composed.resolution })
    })
    app.current = ctx
    if (!interrupted && ctx.fiber.state === FiberState.ACTIVE && ctx.get('loader') !== undefined) {
      ready = true
      for (const listener of [...listeners]) listener()
      listeners.clear()
    }
    return { ctx, shutdown }
  } catch (error) {
    try { await dispose() } catch (cleanupError) {
      throw new AggregateError([error, cleanupError], 'aeoth: Desktop profile startup and cleanup failed')
    }
    throw error
  }
}
