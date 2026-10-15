---
description: "有界工具输出与溢出存储。"
kind: "package-group"
---

# packages/spill

[English](README.md) | 中文

## 概述

有界工具输出与溢出存储。 本页索引太易桌面运行时保留的包。

## 包

- [`@deepseek-ai/dsh-spill`](spill/README.zh.md) — Abstract spill storage seam (ctx.spillStore) for the Aeoth Agent — save oversized tool text and return a retrieval locator
- [`@deepseek-ai/dsh-spill-local`](spill-local/README.zh.md) — Local-filesystem implementation of the Aeoth Agent spill storage seam (private session-scoped files)
- [`@deepseek-ai/dsh-spill-policy`](spill-policy/README.zh.md) — Token-budgeted tool-result retention with recoverable text and image paths

## 开发

使用 `pnpm run build` 构建完整组合；打包由 [apps/desktop](../../apps/desktop/README.zh.md) 负责。
