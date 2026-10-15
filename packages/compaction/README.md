---
description: "Conversation compaction and tool-output retention."
kind: "package-group"
---

# packages/compaction

English | [中文](README.zh.md)

## Overview

Conversation compaction and tool-output retention. This page indexes the packages retained by the Aeoth Desktop runtime.

## Packages

- [`@deepseek-ai/dsh-command-compact`](command-compact/README.md) — Human-facing slash command for explicit session compaction
- [`@deepseek-ai/dsh-compaction`](compaction/README.md) — Abstract compaction service seam (ctx.compaction) for the Aeoth Agent
- [`@deepseek-ai/dsh-compaction-basic`](compaction-basic/README.md) — Token-meter-driven compaction policy and LLM summarization backend for the Aeoth Agent
- [`@deepseek-ai/dsh-compaction-image-offload`](compaction-image-offload/README.md) — Durable image offload for image-capable routes: replace over-budget request images with placeholders and retry
- [`@deepseek-ai/dsh-compaction-tool-result-pruner`](compaction-tool-result-pruner/README.md) — Replay-safe model-free head/middle/tail pruning for tool-result surface nodes

## Development

Build the full composition with `pnpm run build`; packaging is owned by [apps/desktop](../../apps/desktop/README.md).
