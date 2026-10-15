---
description: "执行隔离与平台策略。"
kind: "package-group"
---

# packages/sandbox

[English](README.md) | 中文

## 概述

执行隔离与平台策略。 本页索引太易桌面运行时保留的包。

## 包

- [`@deepseek-ai/dsh-sandbox`](sandbox/README.zh.md) — Abstract process-sandbox seam (ctx.sandbox) for the Aeoth Agent: same-world confinement vocabulary and the SandboxProvider contract
- [`@deepseek-ai/dsh-sandbox-local`](sandbox-local/README.zh.md) — Local process-sandbox backends for the Aeoth Agent sandbox seam: bwrap, the npm-distributed landlock-run launcher, macOS Seatbelt, or the Windows ACL restricted-token runner — functionally probed, fail-closed
- [`@deepseek-ai/dsh-sandbox-policy`](sandbox-policy/README.zh.md) — Per-call sandbox policy resolver and current model context: deployment fallbacks plus each session's mode and workspace root, shared by every enforcing capability family
- [`@deepseek-ai/dsh-sandbox-windows-acl`](sandbox-windows-acl/README.zh.md) — Windows ACL write-restriction sandbox backend (restricted-token spawn with capability-SID write allowlist) for the Aeoth Agent sandbox seam

## 开发

使用 `pnpm run build` 构建完整组合；打包由 [apps/desktop](../../apps/desktop/README.zh.md) 负责。
