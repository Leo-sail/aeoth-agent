---
description: "Shell 执行、环境处理与面向模型的命令。"
kind: "package-group"
---

# packages/shell

[English](README.md) | 中文

## 概述

Shell 执行、环境处理与面向模型的命令。 本页索引太易桌面运行时保留的包。

## 包

- [`@deepseek-ai/dsh-bash-local`](bash-local/README.zh.md) — Local-subprocess implementation of the Aeoth Agent bash executor seam
- [`@deepseek-ai/dsh-bash-sandbox`](bash-sandbox/README.zh.md) — Sandbox-consuming implementation of the Aeoth Agent bash executor seam (confines every command via ctx.sandbox, reports denial/enforcement result facts)
- [`@deepseek-ai/dsh-pwsh-local`](pwsh-local/README.zh.md) — Local PowerShell implementation of the Aeoth Agent bash executor seam
- [`@deepseek-ai/dsh-pwsh-sandbox`](pwsh-sandbox/README.zh.md) — Sandbox-consuming implementation of the Aeoth Agent PowerShell executor seam (confines every command via ctx.sandbox, reports denial/enforcement result facts)
- [`@deepseek-ai/dsh-shell`](shell/README.zh.md) — Abstract bash executor seam (ctx.shell) for the Aeoth Agent
- [`@deepseek-ai/dsh-shell-env`](shell-env/README.zh.md) — Tool-independent managed DSH_* shell environment registry
- [`@deepseek-ai/dsh-tool-bash`](tool-bash/README.zh.md) — Model-facing bash tool with optional generic background-job and sandbox-escalation support
- [`@deepseek-ai/dsh-tool-bash-persistent`](tool-bash-persistent/README.zh.md) — Model-facing owner-scoped persistent Bash tool backed by the Harness PTY service
- [`@deepseek-ai/dsh-tool-pwsh`](tool-pwsh/README.zh.md) — Model-facing pwsh tool over the bash executor seam
- [`@deepseek-ai/dsh-tool-pwsh-persistent`](tool-pwsh-persistent/README.zh.md) — Model-facing owner-scoped persistent PowerShell tool backed by the Harness PTY service

## 开发

使用 `pnpm run build` 构建完整组合；打包由 [apps/desktop](../../apps/desktop/README.zh.md) 负责。
