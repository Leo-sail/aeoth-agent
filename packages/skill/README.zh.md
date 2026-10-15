---
description: "技能发现、加载、学习与审核。"
kind: "package-group"
---

# packages/skill

[English](README.md) | 中文

## 概述

技能发现、加载、学习与审核。 本页索引太易桌面运行时保留的包。

## 包

- [`@deepseek-ai/dsh-command-learn`](command-learn/README.zh.md) — Human-facing slash command that turns a source or workflow into a reusable skill
- [`@deepseek-ai/dsh-skill-curator`](curator/README.zh.md) — Durable skill proposals, review, archive, restore, and feedback loop
- [`@deepseek-ai/dsh-skill`](skill/README.zh.md) — Agent skill provider registry for the Aeoth Agent
- [`@deepseek-ai/dsh-skill-badge`](skill-badge/README.zh.md) — Bundled dsh badge skill provider for Aeoth Agent
- [`@deepseek-ai/dsh-skill-filesystem`](skill-filesystem/README.zh.md) — Local filesystem skill provider for the Aeoth Agent
- [`@deepseek-ai/dsh-skill-office`](skill-office/README.zh.md) — Bundled Word, PowerPoint, and Excel workflows and structural checks
- [`@deepseek-ai/dsh-tool-skill`](tool-skill/README.zh.md) — Model-facing skill loading tool for the Aeoth Agent
- [`@deepseek-ai/dsh-tool-workspace-dependencies`](tool-workspace-dependencies/README.zh.md) — The load_workspace_dependencies tool: absolute paths into a bundled Python, Node.js, and pnpm payload

## 开发

使用 `pnpm run build` 构建完整组合；打包由 [apps/desktop](../../apps/desktop/README.zh.md) 负责。
