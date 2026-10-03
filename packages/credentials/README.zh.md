---
description: "凭据存储与提供方授权。"
kind: "package-group"
---

# packages/credentials

[English](README.md) | 中文

## 概述

凭据存储与提供方授权。 本页索引太易桌面运行时保留的包。

## 包

- [`@deepseek-ai/dsh-authorization`](authorization/README.zh.md) — Authorization seam (ctx.authorization): plugin-owned flows that obtain a credential through a conversation with the human
- [`@deepseek-ai/dsh-credentials`](credentials/README.zh.md) — Abstract credential seam (ctx.credentials): settings carry references to secrets, providers own the values
- [`@deepseek-ai/dsh-credentials-local`](credentials-local/README.zh.md) — File-backed credentials provider ($AEOTH_HOME/.env under the live process environment) for the Aeoth Agent
- [`@deepseek-ai/dsh-deepseek-account`](deepseek-account/README.zh.md) — Read account state and resolve official API credentials
- [`@deepseek-ai/dsh-deepseek-account-platform`](deepseek-account-platform/README.zh.md) — Authorize DeepSeek accounts through browser PKCE

## 开发

使用 `pnpm run build:official` 构建完整组合；打包由 [apps/desktop](../../apps/desktop/README.zh.md) 负责。
