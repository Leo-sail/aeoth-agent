/**
 * Aeoth-owned to upstream-compatible launch adaptation.
 *
 * Keep public names in Aeoth-facing callers. Only this module translates the
 * public launch/home options and environment into the inherited runtime names.
 * Update this file first when an upstream release changes that compatibility
 * surface.
 *
 * @module @deepseek-ai/dsh-home-paths/adapter
 */

import { AEOTH_HOME_ENV, DSH_HOME_ENV } from './names.ts'

/** Adapter contract version for persisted upgrade and compatibility checks. */
export const AEOTH_UPSTREAM_ADAPTER_VERSION = 1 as const

/** Public and inherited names owned by this adapter. */
export const AEOTH_UPSTREAM_NAMES = {
  publicCommand: 'aeoth',
  upstreamCommand: 'dsh',
  publicHomeEnv: AEOTH_HOME_ENV,
  upstreamHomeEnv: DSH_HOME_ENV,
  publicBinOption: 'aeothBin',
  upstreamBinOption: 'dshBin',
  publicHomeOption: 'aeothHome',
  upstreamHomeOption: 'dshHome',
} as const

/** Aeoth-facing home options accepted by public plugin configuration. */
export interface AeothHomeConfig {
  aeothHome?: string
  /** Legacy caller alias accepted during the compatibility window. */
  dshHome?: string
}

/** Upstream home options consumed after the adapter boundary. */
export interface UpstreamHomeConfig {
  dshHome?: string
}

/**
 * Translate public home options into the inherited option name.
 *
 * @param options - public and legacy home options.
 * @returns upstream-compatible home options.
 * @throws when both public and legacy names are supplied.
 */
export function adaptAeothHomeConfig(options: AeothHomeConfig = {}): UpstreamHomeConfig {
  if (options.aeothHome !== undefined && options.dshHome !== undefined) {
    throw new Error('Aeoth home configuration accepts either aeothHome or dshHome, not both')
  }
  const home = options.aeothHome ?? options.dshHome
  return home === undefined ? {} : { dshHome: home }
}

/** Aeoth-facing launch options accepted by a public adapter boundary. */
export interface AeothLaunchConfig {
  aeothBin?: string
  aeothHome?: string
  /** Legacy caller alias accepted during the compatibility window. */
  dshBin?: string
  /** Legacy caller alias accepted during the compatibility window. */
  dshHome?: string
}

/** Upstream launch options consumed after the adapter boundary. */
export interface UpstreamLaunchConfig {
  dshBin?: string
  dshHome?: string
}

/**
 * Translate one public launch configuration into the inherited runtime names.
 *
 * @param options - Aeoth-facing launch options, including legacy aliases.
 * @returns upstream-compatible launch options.
 * @throws when a public option and its legacy alias are both supplied.
 */
export function adaptAeothLaunchConfig(options: AeothLaunchConfig = {}): UpstreamLaunchConfig {
  if (options.aeothBin !== undefined && options.dshBin !== undefined) {
    throw new Error('Aeoth launch accepts either aeothBin or dshBin, not both')
  }
  if (options.aeothHome !== undefined && options.dshHome !== undefined) {
    throw new Error('Aeoth launch accepts either aeothHome or dshHome, not both')
  }
  return {
    ...options.aeothBin === undefined && options.dshBin === undefined
      ? {}
      : { dshBin: options.aeothBin ?? options.dshBin },
    ...options.aeothHome === undefined && options.dshHome === undefined
      ? {}
      : { dshHome: options.aeothHome ?? options.dshHome },
  }
}

/**
 * Set both public and inherited home variables for a child process.
 *
 * @param environment - parent or caller-provided environment.
 * @param home - resolved home to force into the child, or undefined to preserve it.
 * @returns a copied environment with the adapter's compatibility variables applied.
 */
export function adaptAeothHomeEnvironment(
  environment: NodeJS.ProcessEnv,
  home?: string,
): NodeJS.ProcessEnv {
  return home === undefined
    ? { ...environment }
    : { ...environment, [AEOTH_HOME_ENV]: home, [DSH_HOME_ENV]: home }
}
