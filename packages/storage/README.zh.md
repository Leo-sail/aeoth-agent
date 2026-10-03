---
description: "类型化持久应用数据与存储后端。"
kind: "package-group"
---

# packages/storage

[English](README.md) | 中文

## 概述

类型化持久应用数据与存储后端。 本页索引太易桌面运行时保留的包。

## 包

- [`@deepseek-ai/dsh-storage`](storage/README.zh.md) — Storage hub (ctx.storage): named backend registry plus mounted data-form facilities for the Aeoth Agent
- [`@deepseek-ai/dsh-storage-domain`](storage-domain/README.zh.md) — Domain data form (ctx.storage.domain): schema-validated, event-emitting KV domains over storage backends for the Aeoth Agent
- [`@deepseek-ai/dsh-storage-json`](storage-json/README.zh.md) — JSON file KV storage backend for the Aeoth Agent storage hub
- [`@deepseek-ai/dsh-storage-sqlite`](storage-sqlite/README.zh.md) — SQLite storage backend (kv facet) for the Aeoth Agent storage hub

## 开发

使用 `pnpm run build:official` 构建完整组合；打包由 [apps/desktop](../../apps/desktop/README.zh.md) 负责。
