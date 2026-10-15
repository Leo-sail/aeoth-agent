---
description: "通过 SSH 提供远端文件、进程及沙箱能力。"
kind: "package-group"
---

# packages/ssh

[English](README.md) | 中文

## 概述

通过 SSH 提供远端文件、进程及沙箱能力。 本页索引太易桌面运行时保留的包。

## 包

- [`@deepseek-ai/dsh-fs-ssh`](fs-ssh/README.zh.md) — Filesystem provider over the shared POSIX SSH helper
- [`@deepseek-ai/dsh-sandbox-ssh`](sandbox-ssh/README.zh.md) — Remote POSIX sandbox argv provider over the shared SSH helper
- [`@deepseek-ai/dsh-ssh`](ssh/README.zh.md) — Shared OpenSSH connection and versioned POSIX remote helper
- [`@deepseek-ai/dsh-subprocess-ssh`](subprocess-ssh/README.zh.md) — Subprocess and terminal provider over the shared POSIX SSH helper

## 开发

使用 `pnpm run build` 构建完整组合；打包由 [apps/desktop](../../apps/desktop/README.zh.md) 负责。
