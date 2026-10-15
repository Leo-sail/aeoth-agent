---
description: "Credential storage and provider authorization."
kind: "package-group"
---

# packages/credentials

English | [中文](README.zh.md)

## Overview

Credential storage and provider authorization. This page indexes the packages retained by the Aeoth Desktop runtime.

## Packages

- [`@deepseek-ai/dsh-authorization`](authorization/README.md) — Authorization seam (ctx.authorization): plugin-owned flows that obtain a credential through a conversation with the human
- [`@deepseek-ai/dsh-credentials`](credentials/README.md) — Abstract credential seam (ctx.credentials): settings carry references to secrets, providers own the values
- [`@deepseek-ai/dsh-credentials-local`](credentials-local/README.md) — File-backed credentials provider ($AEOTH_HOME/.env under the live process environment) for the Aeoth Agent
- [`@deepseek-ai/dsh-deepseek-account`](deepseek-account/README.md) — Read account state and resolve official API credentials
- [`@deepseek-ai/dsh-deepseek-account-platform`](deepseek-account-platform/README.md) — Authorize DeepSeek accounts through browser PKCE

## Development

Build the full composition with `pnpm run build`; packaging is owned by [apps/desktop](../../apps/desktop/README.md).
