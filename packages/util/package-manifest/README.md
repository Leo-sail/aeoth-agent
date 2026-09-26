---
description: "Shared package manifest types and the Aeoth-to-DSH compatibility adapter."
kind: "package-library"
---

# @deepseek-ai/dsh-package-manifest

English | [中文](README.zh.md)

## Summary

This package defines the inherited `Dsh*` manifest types and the runtime adapter that lets Aeoth-owned package metadata evolve without changing inherited loaders. `aeoth` is the public source field; `dsh` is the compatibility projection consumed by the inherited runtime.

## Table of Contents

- [Use this package](#use-this-package)
- [Understand the implementation](#understand-the-implementation)
- [Further Exploration](#further-exploration)
- [Model Experience](#model-experience)
- [Known Limitations and Deferred Work](#known-limitations-and-deferred-work)
- [Dev Note](#dev-note)

-----

<a id="use-this-package"></a>
## Use this package

Use the type exports for package declarations. Use the adapter exports at every runtime package-manifest read or write boundary.

```ts
import {
  adaptAeothManifest,
  persistAeothManifest,
  withAeothProfileBundles,
} from '@deepseek-ai/dsh-package-manifest'
import type { AeothPackageManifest } from '@deepseek-ai/dsh-package-manifest'

const raw: Partial<AeothPackageManifest> = {
  name: 'example-dsh-plugin',
  version: '1.0.0',
  aeoth: {
    client: { platform: 'web', immediately: true },
  },
}

const compatible = adaptAeothManifest(raw)
```

`DshPackageManifest` describes the package.json fields used by DSH, with required `name` and `version`; it is not an exhaustive npm schema. Local profile readers use `Partial<DshPackageManifest>` because profiles need no published version. `DshManifest` describes only public author fields under `dsh`. `DshBundleManifest.patch` is one patch file path or an ordered list of them, each relative to the package root; the launcher applies a list in order as one bundle layer. TypeScript checks the example and erases `import type`; these interfaces do not parse JSON or write a file.

The adapter contract is deliberately narrow:

| Input or operation | Result |
|---|---|
| `aeoth` only | Read as an internal `dsh` projection; writes persist both fields. |
| `dsh` only | Read and write as inherited metadata; no `aeoth` field is added. |
| Both fields | `aeoth` wins on conflicts; known sections are merged and the `dsh` projection is synchronized. |
| `withAeothProfileBundles` | Changes only the public profile bundle list, then regenerates the compatible projection. |

Adapter v2 accepts ordered patch arrays. It removes the retired UI-only team bundle from Aeoth profiles only when its replacement team bundle is already enabled; other bundles and inherited-only manifests remain unchanged.

`LocalizedText` carries literal text or a language map with a required English fallback. `PluginLocalizedMeta` carries optional display title, description, an image data URL resolved from `package.json.icon`, and metadata diagnostics for installed plugins. [App boot](../../boot/app-boot/README.md) reads these values; this package only supplies their types.

Public composition declarations are defined in [`src/types.ts`](src/types.ts). Internal `configTrees`, `sessionFormatMigration`, and generated `moduleFallback` metadata remain owned by their image-packer, catalog, and launcher readers; the public types do not expose them.

-----

<a id="understand-the-implementation"></a>
## Understand the implementation

<details>
<summary>Implementation internals — click to expand</summary>

- [`src/types.ts`](src/types.ts) contains the inherited `Dsh*` declarations and the Aeoth-owned source declarations.
- [`src/adapter.ts`](src/adapter.ts) is the only translation boundary. Upstream manifest changes should be handled there first.
- `AEOTH_MANIFEST_ADAPTER_VERSION` identifies the adapter contract used by diagnostics and migration notes.
- Profile boot, plugin management, Client module discovery, Typert registration, Web watch discovery, and package verification read through the adapter instead of reading `manifest.dsh` from raw JSON.
- No runtime invariant companion is published because package metadata normalization has no independently persisted state.

The inherited runtime may continue to consume the normalized `dsh` view internally. That is intentional: public configuration naming stays isolated while upstream package and protocol compatibility remains intact.

</details>

-----

<a id="further-exploration"></a>
## Further Exploration

- [Profile launcher](../../boot/app-boot/README.md#profiles) — profile loading, bundle composition, and persistence.
- [Plugin manager](../../boot/plugin-manager/README.md) — install, enable, disable, and reconcile profile bundles.
- [Public package metadata](../../../.agents/notes/implemented/architecture/2026-09-10-public-package-manifest.md) — field placement and reader ownership.

<a id="model-experience"></a>
## Model Experience

None, as the adapter only normalizes package metadata before runtime composition and does not add model input or change agent behavior.

#### KV Cache effect

No model input changes, so provider cache reuse is unaffected.

## Known Limitations and Deferred Work

<a id="known-limitations-and-deferred-work"></a>

- **Compatibility projection, not a full migration engine.** The adapter maps the current bundle/profile/client fields; a future upstream manifest shape must first be handled in `src/adapter.ts`.
- **Compatibility is declarative.** `manifestVersion` and `engines.dsh` remain declarations; installers and loaders do not automatically reject incompatible versions.
- **Legacy fields remain visible internally.** This is required for the inherited runtime and does not make `dsh` the Aeoth public source of truth.

<a id="dev-note"></a>
### Dev Note

<details>
<summary>Working context for maintainers — click to expand</summary>

When updating the inherited harness, change the adapter and its focused regression matrix before changing profile, plugin-manager, or client business logic. Keep pure upstream manifests free of generated `aeoth` fields.

</details>
