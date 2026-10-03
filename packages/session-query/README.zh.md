---
description: "会话搜索、读取与导出。"
kind: "package-group"
---

# packages/session-query

[English](README.md) | 中文

## 概述

会话搜索、读取与导出。 本页索引太易桌面运行时保留的包。

## 包

- [`@deepseek-ai/dsh-session-log-export`](session-log-export/README.zh.md) — Web Session-log export command and shared download dialog
- [`@deepseek-ai/dsh-session-query`](session-query/README.zh.md) — Combined session query service contract with concrete reads, traces, and filters
- [`@deepseek-ai/dsh-session-query-sqlite`](session-query-sqlite/README.zh.md) — Concrete ctx.sessionQuery backend with SQLite FTS5 search
- [`@deepseek-ai/dsh-tool-session-query`](tool-session-query/README.zh.md) — Workspace-authorized model-facing session history search, trace, and event read tools

## 开发

使用 `pnpm run build:official` 构建完整组合；打包由 [apps/desktop](../../apps/desktop/README.zh.md) 负责。
