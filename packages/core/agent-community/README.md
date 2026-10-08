---
description: "Native Bot Mode community, durable rooms, bot runs, and live control"
kind: "package-reference"
---

# @deepseek-ai/dsh-agent-community

English | [中文](README.zh.md)

This package is part of the Aeoth Desktop runtime. Electron and the application-owned Host are the product entry points; this README documents the package contract.


Own persistent Bot identities, room membership, message ordering, mailboxes and run state. Room state is distinct from the temporary Agent handles that execute a run.

Deleting an Agent (`deleteBot`) removes its direct chat, its runs, mailbox items and hidden Sessions in every room (Session logs and projection cache included), and removes it from group chats; a group chat left with fewer than 2 members is deleted with it. New Agents carry no credential namespace, so model calls use the deployment credentials configured in Settings → Models. A namespace that earlier versions wrote implicitly (equal to the Agent name or id) is dropped on read; an explicitly chosen namespace stays isolated and never falls back to global credentials. An Agent reply that mentions @user pauses group relays, and the user's next message resumes that room; a manual pause stays in force. A run that exhausted its attempts settles as failed instead of blocking later runs of the same room or Agent.

## Development

This package is developed with Aeoth Desktop. Follow the [source setup](../../../README.md#run-from-source) and [Desktop build instructions](../../../apps/desktop/README.md).

## Source

- [`src/index.ts`](src/index.ts): Service or plugin entry
- [`src/types.ts`](src/types.ts): Public types
- [`package.json`](package.json): exports and dependency declarations.

## Documentation

- [Package family](../README.md)
- [Subsystem architecture](../../../docs/subsystems/core.md)
- [License and provenance](../../../THIRD_PARTY_NOTICES.md)
## Desktop delivery

- The package is retained only as part of the Aeoth Desktop source and runtime closure.
- It does not own an independent product entry point or installer.

## License

The package follows the repository license. Third-party notices and provenance are recorded in [THIRD_PARTY_NOTICES.md](../../../THIRD_PARTY_NOTICES.md).
