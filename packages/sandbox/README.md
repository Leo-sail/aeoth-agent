---
description: "Execution confinement and platform policies."
kind: "package-group"
---

# packages/sandbox

English | [中文](README.zh.md)

## Overview

Execution confinement and platform policies. This page indexes the packages retained by the Aeoth Desktop runtime.

## Packages

- [`@deepseek-ai/dsh-sandbox`](sandbox/README.md) — Abstract process-sandbox seam (ctx.sandbox) for the Aeoth Agent: same-world confinement vocabulary and the SandboxProvider contract
- [`@deepseek-ai/dsh-sandbox-local`](sandbox-local/README.md) — Local process-sandbox backends for the Aeoth Agent sandbox seam: bwrap, the npm-distributed landlock-run launcher, macOS Seatbelt, or the Windows ACL restricted-token runner — functionally probed, fail-closed
- [`@deepseek-ai/dsh-sandbox-policy`](sandbox-policy/README.md) — Per-call sandbox policy resolver and current model context: deployment fallbacks plus each session's mode and workspace root, shared by every enforcing capability family
- [`@deepseek-ai/dsh-sandbox-windows-acl`](sandbox-windows-acl/README.md) — Windows ACL write-restriction sandbox backend (restricted-token spawn with capability-SID write allowlist) for the Aeoth Agent sandbox seam

## Development

Build the full composition with `pnpm run build`; packaging is owned by [apps/desktop](../../apps/desktop/README.md).
