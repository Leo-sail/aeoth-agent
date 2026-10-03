---
description: "Session 持久化、迁移、投影与遥测。"
kind: "package-group"
---

# packages/session

[English](README.md) | 中文

## 概述

Session 持久化、迁移、投影与遥测。 本页索引太易桌面运行时保留的包。

## 包

- [`@deepseek-ai/dsh-session-checkpoint-policy`](session-checkpoint-policy/README.zh.md) — Semantic session durability checkpoints before model requests and tool side effects
- [`@deepseek-ai/dsh-session-format`](session-format/README.zh.md) — Streaming adjacent Session format migration machinery
- [`@deepseek-ai/dsh-session-format-catalog`](session-format-catalog/README.zh.md) — Build-static first-party Session format codec and migration catalog
- [`@deepseek-ai/dsh-session-format-v0-to-v1`](session-format-v0-to-v1/README.zh.md) — Frozen released-v0 Session codec and identity migration to v1
- [`@deepseek-ai/dsh-session-format-v1-to-v2`](session-format-v1-to-v2/README.zh.md) — Frozen released-v1 Session codec and assistant-stream migration to v2
- [`@deepseek-ai/dsh-session-format-v2-to-v3`](session-format-v2-to-v3/README.zh.md) — Streaming system-prompt, canonical-envelope and PTC migration into V3
- [`@deepseek-ai/dsh-session-format-v3-to-v4`](session-format-v3-to-v4/README.zh.md) — Streaming tool-role migration and delivery validation from Session V3 to V4
- [`@deepseek-ai/dsh-session-log-deepseek`](session-log-deepseek/README.zh.md) — Incremental lossless session-log request extension for the official DeepSeek LLM API
- [`@deepseek-ai/dsh-session-persistence`](session-persistence/README.zh.md) — Abstract durable session persistence seam (ctx.sessionPersistence) for the Aeoth Agent
- [`@deepseek-ai/dsh-session-persistence-jsonl`](session-persistence-jsonl/README.zh.md) — JSONL durable session persistence backend for the Aeoth Agent
- [`@deepseek-ai/dsh-session-projection`](session-projection/README.zh.md) — Session-projection seam: the merge-extensible projection type table, the provider contract, and the ctx.sessionProjections registry serving whole current values of log-derived per-session state
- [`@deepseek-ai/dsh-session-projection-cache`](session-projection-cache/README.zh.md) — Persisted projection cache (ctx.sessionProjectionCache): durable per-session checkpoint records on the session_projcache storage domain (per-record layout), throttled write-behind, and the cached listing read
- [`@deepseek-ai/dsh-session-stats`](session-stats/README.zh.md) — Whole-log conversation counts and wall times projection (sessionStats) for the Aeoth Agent
- [`@deepseek-ai/dsh-session-telemetry`](session-telemetry/README.zh.md) — SessionTelemetryBackend seam for the Aeoth Agent: session-event capture, projection, redaction, and handoff to a reporting backend
- [`@deepseek-ai/dsh-session-telemetry-otel`](session-telemetry-otel/README.zh.md) — OpenTelemetry backend for the Aeoth Agent telemetry seam: hands captured session records to the OTel JS SDK's log pipeline
- [`@deepseek-ai/dsh-session-title`](session-title/README.zh.md) — Log-backed session title service and provider registry for the Aeoth Agent
- [`@deepseek-ai/dsh-session-title-all-prompts-llm`](session-title-all-prompts-llm/README.zh.md) — All-user-messages LLM provider plugin for Aeoth Agent session titles
- [`@deepseek-ai/dsh-session-title-first-prompt-llm`](session-title-first-prompt-llm/README.zh.md) — First-message LLM provider plugin for Aeoth Agent session titles
- [`@deepseek-ai/dsh-session-title-llm`](session-title-llm/README.zh.md) — Shared LLM generation policy for Aeoth Agent session-title providers
- [`@deepseek-ai/dsh-session-turn-outline`](session-turn-outline/README.zh.md) — Whole-log turn outline projection (turnOutline) for the Aeoth Agent

## 开发

使用 `pnpm run build:official` 构建完整组合；打包由 [apps/desktop](../../apps/desktop/README.zh.md) 负责。
