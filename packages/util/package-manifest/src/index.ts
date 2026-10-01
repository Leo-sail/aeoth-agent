/**
 * Public package manifest and plugin display types with Aeoth configuration adaptation.
 * @module @deepseek-ai/dsh-package-manifest
 */

export {
  adaptAeothManifest,
  persistAeothManifest,
  withAeothProfileBundles,
  AEOTH_MANIFEST_ADAPTER_VERSION,
  AEOTH_MANIFEST_FIELDS,
} from './adapter.ts'

export type {
  AeothBundleManifest,
  AeothClientManifest,
  AeothManifest,
  AeothProfileManifest,
  AeothPackageManifest,
  DshBundleManifest,
  DshClientManifest,
  DshEnginesManifest,
  DshManifest,
  DshPackageManifest,
  DshProfileManifest,
  LocalizedText,
  PluginLocalizedMeta,
} from './types.ts'
