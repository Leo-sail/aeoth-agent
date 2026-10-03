---
description: "Remote filesystem, process and sandbox providers over SSH."
kind: "package-group"
---

# packages/ssh

English | [中文](README.zh.md)

## Overview

Remote filesystem, process and sandbox providers over SSH. This page indexes the packages retained by the Aeoth Desktop runtime.

## Packages

- [`@deepseek-ai/dsh-fs-ssh`](fs-ssh/README.md) — Filesystem provider over the shared POSIX SSH helper
- [`@deepseek-ai/dsh-sandbox-ssh`](sandbox-ssh/README.md) — Remote POSIX sandbox argv provider over the shared SSH helper
- [`@deepseek-ai/dsh-ssh`](ssh/README.md) — Shared OpenSSH connection and versioned POSIX remote helper
- [`@deepseek-ai/dsh-subprocess-ssh`](subprocess-ssh/README.md) — Subprocess and terminal provider over the shared POSIX SSH helper

## Development

Build the full composition with `pnpm run build:official`; packaging is owned by [apps/desktop](../../apps/desktop/README.md).
