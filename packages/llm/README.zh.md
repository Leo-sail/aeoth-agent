---
description: "模型请求、提供方路由、重试与 token 计量。"
kind: "package-group"
---

# packages/llm

[English](README.md) | 中文

## 概述

模型请求、提供方路由、重试与 token 计量。 本页索引太易桌面运行时保留的包。

## 包

- [`@deepseek-ai/dsh-deepseek-llm-api-extensions`](deepseek-llm-api-extensions/README.zh.md) — Additive request-field registry for the official DeepSeek LLM API adapter
- [`@deepseek-ai/dsh-llm`](llm/README.zh.md) — Provider-neutral LLM service interface for the Aeoth Agent
- [`@deepseek-ai/dsh-llm-deepseek`](llm-deepseek/README.zh.md) — DeepSeek Messages adapter
- [`@deepseek-ai/dsh-llm-deepseek-account`](llm-deepseek-account/README.zh.md) — DeepSeek account provider authentication and discovery
- [`@deepseek-ai/dsh-llm-deepseek-api-key`](llm-deepseek-api-key/README.zh.md) — DeepSeek api-key provider authentication and discovery
- [`@deepseek-ai/dsh-llm-pi-ai`](llm-pi-ai/README.zh.md) — pi-ai-backed DeepSeek adapter for the Aeoth Agent LLM seam (design-verification twin of dsh-llm-deepseek)
- [`@deepseek-ai/dsh-llm-retry`](llm-retry/README.zh.md) — Provider-routed LLM request retry policy for the Aeoth Agent
- [`@deepseek-ai/dsh-plugin-package-inventory-deepseek`](plugin-package-inventory-deepseek/README.zh.md) — Active Loader-backed plugin package inventory for official DeepSeek LLM API requests
- [`@deepseek-ai/dsh-token-meter`](token-meter/README.zh.md) — Replay-aware token measurement service (ctx.tokenMeter) for the Aeoth Agent

## 开发

使用 `pnpm run build` 构建完整组合；打包由 [apps/desktop](../../apps/desktop/README.zh.md) 负责。
