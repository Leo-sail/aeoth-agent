---
description: "Model-authored workflows and fresh-Agent iteration."
kind: "package-group"
---

# packages/workflow

English | [中文](README.zh.md)

## Overview

Model-authored workflows and fresh-Agent iteration. This page indexes the packages retained by the Aeoth Desktop runtime.

## Packages

- [`@deepseek-ai/dsh-tool-ralph`](tool-ralph/README.md) — Model-facing fresh-agent Ralph loop over the workflow and subagent seams
- [`@deepseek-ai/dsh-tool-workflow`](tool-workflow/README.md) — Model-facing workflow tool: run a JavaScript orchestration script over ctx.workflowEngine
- [`@deepseek-ai/dsh-workflow`](workflow/README.md) — Workflow capability seam: ctx.workflowEngine service, run vocabulary, and workflow/* events
- [`@deepseek-ai/dsh-workflow-ptc`](workflow-ptc/README.md) — Workflow orchestration in the shared sandboxed Node PTC runtime

## Development

Build the full composition with `pnpm run build:official`; packaging is owned by [apps/desktop](../../apps/desktop/README.md).
