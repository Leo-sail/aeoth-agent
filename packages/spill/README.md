---
description: "Bounded tool output and overflow storage."
kind: "package-group"
---

# packages/spill

English | [中文](README.zh.md)

## Overview

Bounded tool output and overflow storage. This page indexes the packages retained by the Aeoth Desktop runtime.

## Packages

- [`@deepseek-ai/dsh-spill`](spill/README.md) — Abstract spill storage seam (ctx.spillStore) for the Aeoth Agent — save oversized tool text and return a retrieval locator
- [`@deepseek-ai/dsh-spill-local`](spill-local/README.md) — Local-filesystem implementation of the Aeoth Agent spill storage seam (private session-scoped files)
- [`@deepseek-ai/dsh-spill-policy`](spill-policy/README.md) — Token-budgeted tool-result retention with recoverable text and image paths

## Development

Build the full composition with `pnpm run build:official`; packaging is owned by [apps/desktop](../../apps/desktop/README.md).
