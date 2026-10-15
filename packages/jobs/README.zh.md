---
description: "后台任务与有界输出观察。"
kind: "package-group"
---

# packages/jobs

[English](README.md) | 中文

## 概述

后台任务与有界输出观察。 本页索引太易桌面运行时保留的包。

## 包

- [`@deepseek-ai/dsh-jobs`](jobs/README.zh.md) — Background job registry (ctx.jobs) for the Aeoth Agent — shared ids, owner isolation, polling, cancellation, and completion listeners for long-running tool work
- [`@deepseek-ai/dsh-jobs-local`](jobs-local/README.zh.md) — Process-local implementation of the Aeoth Agent background job registry seam
- [`@deepseek-ai/dsh-tool-jobs`](tool-jobs/README.zh.md) — Model-facing background job control tools (job_output, job_list, job_kill) over the ctx.jobs registry

## 开发

使用 `pnpm run build` 构建完整组合；打包由 [apps/desktop](../../apps/desktop/README.zh.md) 负责。
