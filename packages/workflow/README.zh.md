---
description: "模型编写的工作流与新 Agent 迭代。"
kind: "package-group"
---

# packages/workflow

[English](README.md) | 中文

## 概述

模型编写的工作流与新 Agent 迭代。 本页索引太易桌面运行时保留的包。

## 包

- [`@deepseek-ai/dsh-tool-ralph`](tool-ralph/README.zh.md) — Model-facing fresh-agent Ralph loop over the workflow and subagent seams
- [`@deepseek-ai/dsh-tool-workflow`](tool-workflow/README.zh.md) — Model-facing workflow tool: run a JavaScript orchestration script over ctx.workflowEngine
- [`@deepseek-ai/dsh-workflow`](workflow/README.zh.md) — Workflow capability seam: ctx.workflowEngine service, run vocabulary, and workflow/* events
- [`@deepseek-ai/dsh-workflow-ptc`](workflow-ptc/README.zh.md) — Workflow orchestration in the shared sandboxed Node PTC runtime

## 开发

使用 `pnpm run build:official` 构建完整组合；打包由 [apps/desktop](../../apps/desktop/README.zh.md) 负责。
