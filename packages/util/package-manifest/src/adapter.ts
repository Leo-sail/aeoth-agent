/**
 * Translate Aeoth-owned package metadata to the inherited DSH manifest field.
 *
 * `aeoth` is the source-of-truth field for Aeoth-authored manifests. `dsh` is
 * retained as a generated compatibility projection for the inherited loader.
 * Upstream manifest changes belong in this module instead of leaking through
 * profile, bundle, and plugin-manager code.
 *
 * @module @deepseek-ai/dsh-package-manifest/adapter
 */

import type {
  AeothManifest,
  DshManifest,
} from './types.ts'

/** Adapter mapping version persisted by Aeoth tooling and diagnostics. */
export const AEOTH_MANIFEST_ADAPTER_VERSION = 2 as const

/** Public and inherited package manifest field names. */
export const AEOTH_MANIFEST_FIELDS = {
  public: 'aeoth',
  upstream: 'dsh',
} as const

function object(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
}

function mergeSection<T extends object>(upstream: unknown, own: unknown): T | undefined {
  const upstreamObject = object(upstream)
  const ownObject = object(own)
  if (Object.keys(upstreamObject).length === 0 && Object.keys(ownObject).length === 0) return undefined
  return { ...upstreamObject, ...ownObject } as T
}

/**
 * Project the Aeoth-owned manifest field into the upstream DSH field.
 * Public values win when both fields exist; omitted sections remain omitted.
 * A manifest that only has the inherited field is left inherited-only so
 * reading a dependency never turns it into an Aeoth-owned package.
 *
 * @param manifest - raw or partially normalized package metadata.
 * @returns metadata with an internal, synchronized `dsh` view.
 */
export function adaptAeothManifest<T extends object>(
  manifest: T,
): T & { dsh?: DshManifest } {
  const raw = object(manifest)
  const upstream = object(raw.dsh)
  let own = object(raw.aeoth)
  const profile = object(own.profile)
  const bundles = profile.bundles
  const hasUpstream = Object.keys(upstream).length > 0
  const hasOwn = Object.keys(own).length > 0
  if (!hasOwn) return { ...manifest, ...(hasUpstream ? { dsh: raw.dsh as DshManifest } : {}) }
  const normalized: Record<string, unknown> = { ...upstream, ...own }
  for (const key of ['bundle', 'profile', 'client'] as const) {
    const merged = mergeSection(upstream[key], own[key])
    if (merged !== undefined) normalized[key] = merged
    else delete normalized[key]
  }
  return {
    ...manifest,
    // Preserve public fields, normalizing only a recognized retired alias.
    aeoth: own as AeothManifest,
    ...(hasUpstream || hasOwn ? { dsh: normalized as DshManifest } : {}),
  }
}

/**
 * Prepare metadata for persistence without changing the Aeoth source field.
 * The generated DSH projection stays present so an unmodified upstream loader
 * can consume the same profile or bundle.
 *
 * @param manifest - normalized package metadata.
 * @returns metadata safe to serialize.
 */
export function persistAeothManifest<T extends object>(
  manifest: T,
): T & { aeoth?: AeothManifest; dsh?: DshManifest } {
  return adaptAeothManifest(manifest)
}

/**
 * Update one profile bundle list while preserving the Aeoth-owned source field.
 *
 * @param manifest - current profile manifest.
 * @param bundles - ordered active bundle names.
 * @returns updated and adapted manifest.
 */
export function withAeothProfileBundles<T extends object>(
  manifest: T,
  bundles: readonly string[],
): T & { dsh?: DshManifest } {
  const raw = object(manifest)
  const aeoth = object(raw.aeoth) as AeothManifest
  const dsh = object(raw.dsh) as DshManifest
  if (Object.keys(aeoth).length === 0) {
    return adaptAeothManifest({
      ...manifest,
      dsh: {
        ...dsh,
        profile: { ...dsh?.profile, bundles: [...bundles] },
      },
    })
  }
  return adaptAeothManifest({
    ...manifest,
    aeoth: {
      ...aeoth,
      profile: { ...aeoth.profile, bundles: [...bundles] },
    },
  })
}
