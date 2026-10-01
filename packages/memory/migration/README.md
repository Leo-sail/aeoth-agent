---
description: "Previewable, fingerprinted, confirmable, and reversible migration of legacy MCP memory exports."
kind: "package-reference"
---

# @deepseek-ai/dsh-memory-migration

English | [中文](README.zh.md)

## Summary

The migration service turns legacy JSON, JSONL, graph-entity, Markdown-entry, and line-oriented MCP memory exports into a preview plan. A user must explicitly apply the plan. The source fingerprint is checked again before apply, the plan records before/after snapshots, and rollback refuses to overwrite memory that changed after the migration.

## Use this package

The base bundle mounts the service and the `memory` Remote namespace exposes preview, list, apply, and rollback operations to the Web/Desktop management page. The service writes owner-only journals under the active profile's `memories/migrations/plans/` directory.

The parser recognizes the Aeoth reference-memory observation prefix, common `memory`/`user` arrays, graph entities, JSONL records, `§`-separated entries, and plain non-empty lines. Non-text values are reported as skipped; malformed structural objects, invalid arrays, and invalid Aeoth observations reject preview before any write.

## Model Experience

No model tool is added. Migration is a user-controlled administrative operation; `/memory` and the model `memory` tool see the imported entries only after explicit apply.

### Token and KV-cache effects

Plans are kept outside session history and do not enter the model prompt. Imported entries are still bounded by the active `MemoryRuntime` target limits before persistence.

## Known Limitations and Deferred Work

- Automatic rollback is intentionally refused when either memory target differs from the recorded post-apply snapshot; the user must review the current entries.
- The source must be a regular file below the 8 MiB preview limit and is not followed through a symbolic link.
- Provider-specific formats without recognizable text/entity fields require a provider export or a custom parser before migration.

## Source map

| File | Role |
|---|---|
| [`src/index.ts`](src/index.ts) | Parser, journal, fingerprint gate, apply and rollback state machine |
