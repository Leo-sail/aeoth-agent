---
description: "Model requests, provider routing, retries and token accounting."
kind: "package-group"
---

# packages/llm

English | [中文](README.zh.md)

## Overview

Model requests, provider routing, retries and token accounting. This page indexes the packages retained by the Aeoth Desktop runtime.

## Packages

- [`@deepseek-ai/dsh-deepseek-llm-api-extensions`](deepseek-llm-api-extensions/README.md) — Additive request-field registry for the official DeepSeek LLM API adapter
- [`@deepseek-ai/dsh-llm`](llm/README.md) — Provider-neutral LLM service interface for the Aeoth Agent
- [`@deepseek-ai/dsh-llm-deepseek`](llm-deepseek/README.md) — DeepSeek Messages adapter
- [`@deepseek-ai/dsh-llm-deepseek-account`](llm-deepseek-account/README.md) — DeepSeek account provider authentication and discovery
- [`@deepseek-ai/dsh-llm-deepseek-api-key`](llm-deepseek-api-key/README.md) — DeepSeek api-key provider authentication and discovery
- [`@deepseek-ai/dsh-llm-pi-ai`](llm-pi-ai/README.md) — pi-ai-backed DeepSeek adapter for the Aeoth Agent LLM seam (design-verification twin of dsh-llm-deepseek)
- [`@deepseek-ai/dsh-llm-retry`](llm-retry/README.md) — Provider-routed LLM request retry policy for the Aeoth Agent
- [`@deepseek-ai/dsh-plugin-package-inventory-deepseek`](plugin-package-inventory-deepseek/README.md) — Active Loader-backed plugin package inventory for official DeepSeek LLM API requests
- [`@deepseek-ai/dsh-token-meter`](token-meter/README.md) — Replay-aware token measurement service (ctx.tokenMeter) for the Aeoth Agent

## Development

Build the full composition with `pnpm run build:official`; packaging is owned by [apps/desktop](../../apps/desktop/README.md).
