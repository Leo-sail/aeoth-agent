---
description: "Delivered files and recorded workspace changes."
kind: "package-group"
---

# packages/deliverables

English | [中文](README.zh.md)

## Overview

Delivered files and recorded workspace changes. This page indexes the packages retained by the Aeoth Desktop runtime.

## Packages

- [`@deepseek-ai/dsh-tool-present`](tool-present/README.md) — Explicit workspace file delivery declarations for the Aeoth Agent
- [`@deepseek-ai/dsh-workspace-changes`](workspace-changes/README.md) — Per-turn workspace file changes recorded from git working-tree snapshots and whole-file captures, with per-file comparisons, for the Aeoth Agent

## Development

Build the full composition with `pnpm run build:official`; packaging is owned by [apps/desktop](../../apps/desktop/README.md).
