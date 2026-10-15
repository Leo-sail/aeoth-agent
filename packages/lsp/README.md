---
description: "Language-server navigation and its model-facing tools."
kind: "package-group"
---

# packages/lsp

English | [中文](README.zh.md)

## Overview

Language-server navigation and its model-facing tools. This page indexes the packages retained by the Aeoth Desktop runtime.

## Packages

- [`@deepseek-ai/dsh-lsp`](lsp/README.md) — Abstract LSP capability seam (ctx.lsp) for the Aeoth Agent — language-server provider registry keyed by branded id and extension mapping, order-independent per-query selection, normalized definition/references/implementation/hover requests and results, and the LspError taxonomy
- [`@deepseek-ai/dsh-lsp-stdio`](lsp-stdio/README.md) — Generic stdio language-server provider for the Aeoth Agent LSP capability seam (ctx.lsp) — spawns configured servers, translates JSON-RPC, and serves transient-open goToDefinition/findReferences/goToImplementation/hover queries in the host filesystem namespace
- [`@deepseek-ai/dsh-tool-lsp`](tool-lsp/README.md) — Model-facing lsp tool over the Aeoth Agent LSP capability seam (ctx.lsp) — one read-only tool with goToDefinition/findReferences/goToImplementation/hover operations, one-based UTF-16 cursor coordinates, bounded location rendering, and hover normalization

## Development

Build the full composition with `pnpm run build`; packaging is owned by [apps/desktop](../../apps/desktop/README.md).
