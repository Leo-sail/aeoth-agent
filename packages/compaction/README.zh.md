---
description: "对话压缩与工具输出保留。"
kind: "package-group"
---

# packages/compaction

[English](README.md) | 中文

## 概述

对话压缩与工具输出保留。 本页索引太易桌面运行时保留的包。

## 包

- [`@deepseek-ai/dsh-command-compact`](command-compact/README.zh.md) — Human-facing slash command for explicit session compaction
- [`@deepseek-ai/dsh-compaction`](compaction/README.zh.md) — Abstract compaction service seam (ctx.compaction) for the Aeoth Agent
- [`@deepseek-ai/dsh-compaction-basic`](compaction-basic/README.zh.md) — Token-meter-driven compaction policy and LLM summarization backend for the Aeoth Agent
- [`@deepseek-ai/dsh-compaction-image-offload`](compaction-image-offload/README.zh.md) — Durable image offload for image-capable routes: replace over-budget request images with placeholders and retry
- [`@deepseek-ai/dsh-compaction-tool-result-pruner`](compaction-tool-result-pruner/README.zh.md) — Replay-safe model-free head/middle/tail pruning for tool-result surface nodes

## 开发

使用 `pnpm run build` 构建完整组合；打包由 [apps/desktop](../../apps/desktop/README.zh.md) 负责。
