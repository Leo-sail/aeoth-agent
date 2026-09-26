/** Filesystem ownership for the Electron-managed desktop installation. */

import { join } from 'node:path'
import { resolveAeothHome } from '@deepseek-ai/dsh-home-paths'

/** Stable desktop installation paths under the shared Aeoth home. */
export interface DesktopPaths {
  readonly profile: string
  readonly lock: string
}

/**
 * Resolve every Electron-owned path without changing the shared data roots.
 * @param aeothHome - Aeoth home shared with the installed runtime.
 * @returns immutable desktop path set.
 */
export function resolveDesktopPaths(aeothHome: string = resolveAeothHome()): DesktopPaths {
  return {
    profile: join(aeothHome, 'profiles', 'desktop'),
    lock: join(aeothHome, 'profiles', 'desktop', 'lock'),
  }
}
