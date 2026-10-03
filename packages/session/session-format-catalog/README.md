---
description: "Build-static first-party Session format codec and migration catalog"
kind: "package-library"
---

# @deepseek-ai/dsh-session-format-catalog

English | [中文](README.zh.md)

## Summary

`dsh-session-format-catalog` gives persistence one deterministic Session format reader without consulting mounted plugins. It assembles codecs and adjacent edges from the earliest supported format through the [current writer format](../../../docs/session-format-status.md), checks the complete gap-free chain at module initialization, and exposes physical dispatch, header-only classification, single-pass row restoration, and current record encoding through `sessionFormatCatalog`.

This package is part of the Aeoth Desktop runtime. Electron and the application-owned Host are the product entry points; this README documents the package contract.

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

### When to use it

Import this library from persistence and test-support readers that need the complete first-party released-format inventory before any feature plugin mounts. Feature compositions do not register or reorder its entries. No runtime invariant companion is published because construction rejects an invalid static inventory and each completed restore validates its result; mutable row-decoder state belongs to one caller-owned streaming restore.

### Entry point

```text
const descriptor = sessionFormatCatalog.readHeader(physicalHeader)
const catalog = createSessionFormatCatalogWithChildren(childFacts)
const restore = catalog.createRestore(physicalHeader, { recovery: 'recoverable', validation: 'transformed' })
for (const row of physicalRows) restore.decodeRow(row)
const current = restore.finish()
const headerRecord = sessionFormatCatalog.encodeCurrentHeader(current.header, current.inheritedEventCount)
const eventRecords = current.events.map(sessionFormatCatalog.encodeCurrentEvent)
```



The catalog contains all supported historical readers directly. A profile cannot add, remove, or reorder an edge by mounting a feature plugin. Its peer dependency on `dsh-session` supplies the installed current event vocabulary and current restoration rules, while historical edge validators remain frozen. The browser-safe `./message-projections` export assembles current plugin-owned interpreters for detached constructors and surface folds; it does not mount recovery listeners.

`createSessionFormatCatalogWithChildren(childFacts)` binds explicit child evidence to V3→V4 during assembly; see the [catalog-completion specification](../session-format-v3-to-v4/README.md). `historicalSessionFormatCatalog` restores V0–V3 using the fixed released-V3 event vocabulary to collect child prerequisites without recursively completing their catalogs. An ignorable V3 extension remains opaque even when the installed writer knows its name. Isolated transcript replay explicitly supplies an empty array; persistence must collect the complete available direct-child set. Keep the supplied evidence unchanged for the catalog’s lifetime. Each restore owns independent stage state. The static `sessionFormatCatalog` supports header and native current-format reads; historical body reads require the child-bound catalog.

-----

<a id="understand-the-implementation"></a>
## Understand the implementation

<details>
<summary>Implementation internals — click to expand</summary>

[`src/generated.ts`](src/generated.ts) is the static owner of codec and edge ordering. [`src/current.ts`](src/current.ts) delegates final header, envelope, message, surface, seed, and current request-header validation to the installed Session semantics. The low-level constructor rejects duplicate codecs, duplicate edges, gaps, and entries beyond the current version before any Session read can begin.

</details>

-----

<a id="further-exploration"></a>
## Further Exploration

- [Migration machinery](../session-format/README.md) — catalog construction and dispatch behavior.
- [Released v0 to v1 edge](../session-format-v0-to-v1/README.md) — codec and validator ownership.
- [Released v1 to v2 edge](../session-format-v1-to-v2/README.md) — Assistant stream embedding and cardinality-changing reference remapping.
- [Released V2 to V3 specification](../session-format-v2-to-v3/README.md#v2-to-v3-specification) — transformations, preservation, and refusal.
- [V3 to V4 specification](../session-format-v3-to-v4/README.md#v3-to-v4-specification) — conversion, reference remapping, and delivery-generation validation.
- [JSONL persistence](../session-persistence-jsonl/README.md) — immutable generation naming and exclusive publication.

-----

<a id="model-experience"></a>
## Model Experience

### Catalog dispatch

#### What the model sees

Nothing directly. The catalog only restores the `SessionEvent` history consumed by request reconstruction.

#### Token effect

Zero direct tokens.

#### KV Cache effect

No direct effect; restored history determines cache identity in its consumer.

## Known Limitations and Deferred Work

<a id="known-limitations-and-deferred-work"></a>

- **First-party build inventory only** — external migration ownership and distribution are not supported.
- **Generated ordering is closed** — runtime plugin registration cannot supply a missing historical edge.

<a id="dev-note"></a>
### Dev Note

<details>
<summary>Working context for maintainers — click to expand</summary>

None.

</details>
## Desktop delivery

- The package is retained only as part of the Aeoth Desktop source and runtime closure.
- It does not own an independent product entry point or installer.

## License

The package follows the repository license. Third-party notices and provenance are recorded in [THIRD_PARTY_NOTICES.md](../../../THIRD_PARTY_NOTICES.md).
