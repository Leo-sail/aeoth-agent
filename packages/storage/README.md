---
description: "Typed durable application data and storage backends."
kind: "package-group"
---

# packages/storage

English | [中文](README.zh.md)

## Overview

Typed durable application data and storage backends. This page indexes the packages retained by the Aeoth Desktop runtime.

## Packages

- [`@deepseek-ai/dsh-storage`](storage/README.md) — Storage hub (ctx.storage): named backend registry plus mounted data-form facilities for the Aeoth Agent
- [`@deepseek-ai/dsh-storage-domain`](storage-domain/README.md) — Domain data form (ctx.storage.domain): schema-validated, event-emitting KV domains over storage backends for the Aeoth Agent
- [`@deepseek-ai/dsh-storage-json`](storage-json/README.md) — JSON file KV storage backend for the Aeoth Agent storage hub
- [`@deepseek-ai/dsh-storage-sqlite`](storage-sqlite/README.md) — SQLite storage backend (kv facet) for the Aeoth Agent storage hub

## Development

Build the full composition with `pnpm run build:official`; packaging is owned by [apps/desktop](../../apps/desktop/README.md).
