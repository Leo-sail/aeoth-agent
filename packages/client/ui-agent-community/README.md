---
description: "Native Bot Mode and Agent Community Web/Desktop surface"
kind: "package-reference"
---

# @deepseek-ai/dsh-client-ui-agent-community

English | [中文](README.zh.md)

This package is part of the Aeoth Desktop runtime. Electron and the application-owned Host are the product entry points; this README documents the package contract.


Registers two sibling entries in the left navigation: "Agent" shows only the persistent Agent list and direct chats; "Teams" shows only Agent group chats. Both entries share one page component, with `mode` separating the data domain, the create/edit forms, and the composer's @ suggestions. The model list in the Agent form is grouped by provider and comes directly from the Host model catalog (the usable models configured under Settings → Models). The UI uses the Community Remote for messages and run actions, and reuses the shared composer.

The delete button on an Agent row permanently deletes the Agent after confirmation; "Clear conversation" in the chat header only clears the direct chat's messages and session context and keeps the Agent; the delete button on a group row deletes the group chat. A failed reply shows its reason under the message, and a missing API key points to Settings → Models before retrying. A group message assigned to no Agent explains how to use @, and a paused group shows a notice with a "Resume" button above the composer.

## Development

This package is developed with Aeoth Desktop. Follow the [source setup](../../../README.md#run-from-source) and [Desktop build instructions](../../../apps/desktop/README.md).

## Source

- [`src/index.ts`](src/index.ts): Service or plugin entry
- [`src/client/index.ts`](src/client/index.ts): Renderer entry
- [`package.json`](package.json): exports and dependency declarations.

## Documentation

- [Package family](../README.md)
- [License and provenance](../../../THIRD_PARTY_NOTICES.md)
## Desktop delivery

- The package is retained only as part of the Aeoth Desktop source and runtime closure.
- It does not own an independent product entry point or installer.

## License

The package follows the repository license. Third-party notices and provenance are recorded in [THIRD_PARTY_NOTICES.md](../../../THIRD_PARTY_NOTICES.md).
