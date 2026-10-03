---
description: "Background work and bounded output observation."
kind: "package-group"
---

# packages/jobs

English | [中文](README.zh.md)

## Overview

Background work and bounded output observation. This page indexes the packages retained by the Aeoth Desktop runtime.

## Packages

- [`@deepseek-ai/dsh-jobs`](jobs/README.md) — Background job registry (ctx.jobs) for the Aeoth Agent — shared ids, owner isolation, polling, cancellation, and completion listeners for long-running tool work
- [`@deepseek-ai/dsh-jobs-local`](jobs-local/README.md) — Process-local implementation of the Aeoth Agent background job registry seam
- [`@deepseek-ai/dsh-tool-jobs`](tool-jobs/README.md) — Model-facing background job control tools (job_output, job_list, job_kill) over the ctx.jobs registry

## Development

Build the full composition with `pnpm run build:official`; packaging is owned by [apps/desktop](../../apps/desktop/README.md).
