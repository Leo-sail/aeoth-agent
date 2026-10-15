---
description: "供桌面渲染器调用的类型化 Host 操作。"
kind: "package-group"
---

# packages/api

[English](README.md) | 中文

## 概述

供桌面渲染器调用的类型化 Host 操作。 本页索引太易桌面运行时保留的包。

## 包

- [`@deepseek-ai/dsh-api-account-controller`](account-controller/README.zh.md) — Expose safe account operations over authenticated Remote
- [`@deepseek-ai/dsh-api-gateway`](gateway/README.zh.md) — Typert Remote Host dispatcher and Client API endpoint
- [`@deepseek-ai/dsh-api-job-controller`](job-controller/README.zh.md) — Job Remote observation stream and the reference-counted client job-output service
- [`@deepseek-ai/dsh-api-memory-controller`](memory-controller/README.zh.md) — Memory and skill management Remote namespace for Desktop runtime
- [`@deepseek-ai/dsh-api-remotes`](remotes/README.zh.md) — Remote BFF assembly for application-selected Host capabilities
- [`@deepseek-ai/dsh-api-session-controller`](session-controller/README.zh.md) — Session Remote commands, cold reads, and live control transport
- [`@deepseek-ai/dsh-api-settings-controller`](settings-controller/README.zh.md) — Remote owner for the configuration surfaces over the settings-domain seams
- [`@deepseek-ai/dsh-api-terminal-controller`](terminal-controller/README.zh.md) — Session-owned interactive terminals with shell discovery, screen recovery and typed Remote control
- [`@deepseek-ai/dsh-api-workspace-controller`](workspace-controller/README.zh.md) — Workspace Remote commands and reconnect-safe state transport
- [`@deepseek-ai/dsh-api-workspace-files`](workspace-files/README.zh.md) — Workspace file service and Client resource provider: bounded reads, directory listing, and live metadata over the workspaceFiles Remote namespace

## 开发

使用 `pnpm run build` 构建完整组合；打包由 [apps/desktop](../../apps/desktop/README.zh.md) 负责。
