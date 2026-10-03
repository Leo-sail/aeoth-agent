---
description: "Session-specific Agent composition and bundled instructions."
kind: "package-group"
---

# packages/preset

English | [中文](README.zh.md)

## Overview

Session-specific Agent composition and bundled instructions. This page indexes the packages retained by the Aeoth Desktop runtime.

## Packages

- [`@deepseek-ai/dsh-agent-preset`](agent-preset/README.md) — Declare an Agent capability composition in Cordis YAML
- [`@deepseek-ai/dsh-agent-preset-registry`](agent-preset-registry/README.md) — Declarative Agent preset registry and profile-backed editing
- [`@deepseek-ai/dsh-persona`](persona/README.md) — Composition-authored deployment persona section for the Aeoth Agent

## Development

Build the full composition with `pnpm run build:official`; packaging is owned by [apps/desktop](../../apps/desktop/README.md).
