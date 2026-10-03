---
description: "Skill discovery, loading, learning and review."
kind: "package-group"
---

# packages/skill

English | [中文](README.zh.md)

## Overview

Skill discovery, loading, learning and review. This page indexes the packages retained by the Aeoth Desktop runtime.

## Packages

- [`@deepseek-ai/dsh-command-learn`](command-learn/README.md) — Human-facing slash command that turns a source or workflow into a reusable skill
- [`@deepseek-ai/dsh-skill-curator`](curator/README.md) — Durable skill proposals, review, archive, restore, and feedback loop
- [`@deepseek-ai/dsh-skill`](skill/README.md) — Agent skill provider registry for the Aeoth Agent
- [`@deepseek-ai/dsh-skill-badge`](skill-badge/README.md) — Bundled dsh badge skill provider for Aeoth Agent
- [`@deepseek-ai/dsh-skill-filesystem`](skill-filesystem/README.md) — Local filesystem skill provider for the Aeoth Agent
- [`@deepseek-ai/dsh-skill-office`](skill-office/README.md) — Bundled Word, PowerPoint, and Excel workflows and structural checks
- [`@deepseek-ai/dsh-tool-skill`](tool-skill/README.md) — Model-facing skill loading tool for the Aeoth Agent
- [`@deepseek-ai/dsh-tool-workspace-dependencies`](tool-workspace-dependencies/README.md) — The load_workspace_dependencies tool: absolute paths into a bundled Python, Node.js, and pnpm payload

## Development

Build the full composition with `pnpm run build:official`; packaging is owned by [apps/desktop](../../apps/desktop/README.md).
