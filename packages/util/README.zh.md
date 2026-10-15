---
description: "共享路径、值、文件与生命周期基础工具。"
kind: "package-group"
---

# packages/util

[English](README.md) | 中文

## 概述

共享路径、值、文件与生命周期基础工具。 本页索引太易桌面运行时保留的包。

## 包

- [`@deepseek-ai/dsh-atomic-write`](atomic-write/README.zh.md) — Zero-dependency atomic file replacement: exclusive-create random-suffix temp + rename carrying the caller-stated permissions (writeFileAtomic)
- [`@deepseek-ai/dsh-brand`](brand/README.zh.md) — Stateless branded primitive types for the Aeoth Agent
- [`@deepseek-ai/dsh-chunked-list`](chunked-list/README.zh.md) — Persistent append-only chunked lists with bounded copying and JSON checkpoint validation
- [`@deepseek-ai/dsh-util-code-language`](code-language/README.zh.md) — Single file-extension to syntax-highlighting language table shared by Client code surfaces and the Host read card
- [`@deepseek-ai/dsh-util-crypto`](crypto/README.zh.md) — Zero-dependency browser-safe UUID and byte-encoding helpers
- [`@deepseek-ai/dsh-deque`](deque/README.zh.md) — Zero-dependency circular deque with amortized constant-time end operations and bounded vacant storage
- [`@deepseek-ai/dsh-home-paths`](home-paths/README.zh.md) — Shared filesystem path helpers for Aeoth Agent
- [`@deepseek-ai/dsh-http-proxy`](http-proxy/README.zh.md) — Process-wide outbound HTTP proxy policy for Aeoth Agent: resolve it from the launch environment and install it as undici's global dispatcher
- [`@deepseek-ai/dsh-launch-environment`](launch-environment/README.zh.md) — Immutable Aeoth Agent launch environment that records which layer supplied each value
- [`@deepseek-ai/dsh-lazy-require`](lazy-require/README.zh.md) — Caller-relative, success-cached lazy loading for CommonJS-compatible Host dependencies
- [`@deepseek-ai/dsh-native-command`](native-command/README.zh.md) — Host-native command and path-opening utilities with shell-free execution, cancellation, desktop detection, and WSL handoff
- [`@deepseek-ai/dsh-output-retention`](output-retention/README.zh.md) — Zero-dependency bounded-retention primitive: ItemRetainer/TextRetainer + neutral notice helpers (what did we keep, what did we omit)
- [`@deepseek-ai/dsh-package-manifest`](package-manifest/README.zh.md) — Shared package manifest types and the Aeoth-to-DSH compatibility adapter
- [`@deepseek-ai/dsh-util-time`](time/README.zh.md) — Zero-dependency time vocabulary shared by wire boundaries: canonicalClientTimeZone (IANA zone validation and canonicalization only, no formatting)
- [`@deepseek-ai/dsh-timeout`](timeout/README.zh.md) — Zero-dependency timeout/deadline primitive: clampTimeout, deadline, timeoutOf, TimeoutReason (timing + classification only, no termination)
- [`@deepseek-ai/dsh-util-values`](values/README.zh.md) — Duplicate-install-safe value primitives for the Aeoth Agent
- [`@deepseek-ai/dsh-util-workspace-path`](workspace-path/README.zh.md) — Browser-safe Workspace path and display helpers

## 开发

使用 `pnpm run build` 构建完整组合；打包由 [apps/desktop](../../apps/desktop/README.zh.md) 负责。
