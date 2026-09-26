/**
 * Shared filesystem path helpers for Aeoth Agent user data.
 *
 * The package name remains the upstream-compatible workspace name for now;
 * the public product namespace is Aeoth Agent.
 *
 * @module @deepseek-ai/dsh-home-paths
 */

import { opendir, realpath } from 'node:fs/promises'
import { homedir } from 'node:os'
import { basename, dirname, join, resolve } from 'node:path'
import {
  AEOTH_HOME_DIR_NAME,
  AEOTH_HOME_ENV,
  DEFAULT_AEOTH_HOME_DISPLAY,
  DSH_HOME_ENV,
} from './names.ts'

export {
  AEOTH_HOME_DIR_NAME,
  AEOTH_HOME_ENV,
  DEFAULT_AEOTH_HOME_DISPLAY,
  DSH_HOME_ENV,
} from './names.ts'

/** Legacy directory-name alias for {@link AEOTH_HOME_DIR_NAME}.
 * @deprecated Use {@link AEOTH_HOME_DIR_NAME}.
 */
export const DSH_HOME_DIR_NAME = AEOTH_HOME_DIR_NAME

/** Legacy display alias for {@link DEFAULT_AEOTH_HOME_DISPLAY}.
 * @deprecated Use {@link DEFAULT_AEOTH_HOME_DISPLAY}.
 */
export const DEFAULT_DSH_HOME_DISPLAY = DEFAULT_AEOTH_HOME_DISPLAY

/**
 * Give a native filesystem watcher one canonical spelling of a path, even
 * when its final components do not exist yet. The deepest existing ancestor
 * is resolved through {@link realpath}; when a suffix is missing, that
 * ancestor is also proved to be an enumerable directory before the suffix is
 * restored. This prevents Windows from treating a regular-file ancestor as
 * ordinary absence, and prevents short-name aliases from being mixed with
 * long paths emitted by the native watcher backend.
 * @param path - Watch target or root, resolved against the current directory.
 * @returns the target with its existing ancestor canonicalized.
 * @throws when ancestor traversal encounters an error other than absence, or
 * the existing ancestor of a missing suffix is not an enumerable directory.
 */
export async function canonicalizeWatchPath(path: string): Promise<string> {
  let current = resolve(path)
  const missing: string[] = []
  while (true) {
    try {
      const canonical = await realpath(current)
      if (missing.length > 0) {
        // A Windows file-as-parent probe reports ENOENT. Opening the resolved
        // ancestor preserves the cross-platform directory requirement.
        const directory = await opendir(canonical)
        await directory.close()
      }
      return join(canonical, ...missing.reverse())
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
      const parent = dirname(current)
      /* v8 ignore next -- a filesystem root exists, so traversal resolves before this guard */
      if (parent === current) throw error
      missing.push(basename(current))
      current = parent
    }
  }
}

/**
 * Resolve the default Aeoth Agent home using Node's platform path rules.
 * @returns the absolute default Aeoth Agent home path.
 */
export function defaultAeothHome(): string {
  return join(homedir(), AEOTH_HOME_DIR_NAME)
}

/** Resolve the legacy DSH default home with the Aeoth path rules.
 * @deprecated Use {@link defaultAeothHome}.
 * @returns the absolute default Aeoth home path.
 */
export const defaultDshHome = defaultAeothHome

/**
 * Expand supported tilde prefixes against the operating-system home.
 * @param path - configured path that may begin with `~`, `~/`, or `~\`.
 * @returns the expanded path, or the original value when no supported prefix is present.
 */
export function expandHomePath(path: string): string {
  if (path === '~') return homedir()
  if (path.startsWith('~/') || path.startsWith('~\\')) return join(homedir(), path.slice(2))
  return path
}

/**
 * Resolve the single-root Aeoth Agent home.
 *
 * Precedence, highest first: an explicit configured path, `$AEOTH_HOME`, the
 * legacy `$DSH_HOME`, then `~/.aeoth`. The agent keeps all user data under one
 * root. An empty or whitespace-only override is treated as unset, so a blank
 * value never resolves the home to the current working directory.
 * @param configured - explicit Aeoth home override, which has highest precedence.
 * @param env - environment mapping used to read the current and legacy overrides.
 * @returns the normalized absolute Aeoth home path.
 */
export function resolveAeothHome(configured?: string, env: Record<string, string | undefined> = process.env): string {
  const fromEnv = [env[AEOTH_HOME_ENV], env[DSH_HOME_ENV]].find(value => value !== undefined && value.trim().length > 0)
  const selected = configured ?? (fromEnv !== undefined && fromEnv.trim().length > 0 ? fromEnv : defaultAeothHome())
  return resolve(expandHomePath(selected))
}

/** Resolve a home using the legacy DSH naming.
 * @deprecated Use {@link resolveAeothHome}.
 * @param configured - explicit home override.
 * @param env - environment mapping used to read home overrides.
 * @returns the normalized absolute Aeoth home path.
 */
export const resolveDshHome = resolveAeothHome

/**
 * Join path segments onto the resolved Aeoth Agent home.
 * @param segments - path segments appended to the Aeoth home; an empty list returns the home itself.
 * @returns the normalized absolute joined path.
 */
export function aeothHomePath(...segments: string[]): string {
  return join(resolveAeothHome(), ...segments)
}

/** Join segments onto the resolved home using the legacy DSH naming.
 * @deprecated Use {@link aeothHomePath}.
 * @param segments - path segments appended to the home.
 * @returns the normalized absolute joined path.
 */
export const dshHomePath = aeothHomePath

/**
 * Join path segments onto the resolved Aeoth home's `cache` directory without creating it; no arguments returns the directory itself.
 * @param optionsOrSegment - explicit home override, or the first path segment; omission uses the default home resolution.
 * @param segments - additional path segments after the first child, if any.
 * @returns the normalized absolute cache path.
 */
export function aeothCachePath(optionsOrSegment: { aeothHome?: string } | string = {}, ...segments: string[]): string {
  if (typeof optionsOrSegment === 'string') return aeothHomePath('cache', optionsOrSegment, ...segments)
  return join(resolveAeothHome(optionsOrSegment.aeothHome), 'cache', ...segments)
}

/** Join segments onto the resolved cache directory using the legacy DSH naming.
 * @deprecated Use {@link aeothCachePath}.
 * @param optionsOrSegment - explicit legacy home override, or the first path segment.
 * @param segments - additional path segments after the first child.
 * @returns the normalized absolute cache path.
 */
export function dshCachePath(optionsOrSegment: { dshHome?: string } | string = {}, ...segments: string[]): string {
  if (typeof optionsOrSegment === 'string') return aeothHomePath('cache', optionsOrSegment, ...segments)
  return join(resolveAeothHome(optionsOrSegment.dshHome), 'cache', ...segments)
}

/**
 * Describe a resolved Aeoth home symbolically for user-facing display.
 *
 * It never returns an absolute machine path: the default home is labelled
 * `~/.aeoth`, and any configured home is labelled `$AEOTH_HOME`.
 * @param resolvedHome - the absolute path returned by {@link resolveAeothHome}.
 * @returns `~/.aeoth` for the default home, otherwise `$AEOTH_HOME`.
 */
export function aeothHomeDisplay(resolvedHome: string): string {
  return resolvedHome === resolve(defaultAeothHome()) ? DEFAULT_AEOTH_HOME_DISPLAY : `$${AEOTH_HOME_ENV}`
}

/** Describe a resolved home using the legacy DSH naming.
 * @deprecated Use {@link aeothHomeDisplay}.
 * @param resolvedHome - the absolute resolved home path.
 * @returns the symbolic home label.
 */
export const dshHomeDisplay = aeothHomeDisplay

export * from './adapter.ts'
