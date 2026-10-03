---
description: "语言服务器导航及面向模型的工具。"
kind: "package-group"
---

# packages/lsp

[English](README.md) | 中文

## 概述

语言服务器导航及面向模型的工具。 本页索引太易桌面运行时保留的包。

## 包

- [`@deepseek-ai/dsh-lsp`](lsp/README.zh.md) — Abstract LSP capability seam (ctx.lsp) for the Aeoth Agent — language-server provider registry keyed by branded id and extension mapping, order-independent per-query selection, normalized definition/references/implementation/hover requests and results, and the LspError taxonomy
- [`@deepseek-ai/dsh-lsp-stdio`](lsp-stdio/README.zh.md) — Generic stdio language-server provider for the Aeoth Agent LSP capability seam (ctx.lsp) — spawns configured servers, translates JSON-RPC, and serves transient-open goToDefinition/findReferences/goToImplementation/hover queries in the host filesystem namespace
- [`@deepseek-ai/dsh-tool-lsp`](tool-lsp/README.zh.md) — Model-facing lsp tool over the Aeoth Agent LSP capability seam (ctx.lsp) — one read-only tool with goToDefinition/findReferences/goToImplementation/hover operations, one-based UTF-16 cursor coordinates, bounded location rendering, and hover normalization

## 开发

使用 `pnpm run build:official` 构建完整组合；打包由 [apps/desktop](../../apps/desktop/README.zh.md) 负责。
