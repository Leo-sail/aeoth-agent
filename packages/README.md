---
description: "Aeoth Desktop package workspace"
kind: "package-group"
---

# Aeoth Agent packages

English | [中文](README.zh.md)

## Overview

These packages form the Aeoth Desktop runtime. The application README is the product entry point; this page is the source map.

## Package groups

- [`api`](api/README.md) — Typed Host operations used by the Desktop renderer.
- [`attachment`](attachment/README.md) — Attachment identities and local content storage.
- [`boot`](boot/README.md) — Profile loading, configuration changes and plugin lifecycle.
- [`browser-use`](browser-use/README.md) — Browser-provider selection and shared contracts.
- [`bundle`](bundle/README.md) — Base runtime and Desktop application composition.
- [`client`](client/README.md) — Desktop renderer services, controls and feature panels.
- [`compaction`](compaction/README.md) — Conversation compaction and tool-output retention.
- [`computer-use`](computer-use/README.md) — Computer-control provider registration.
- [`context`](context/README.md) — Workspace instructions and model request context.
- [`core`](core/README.md) — Agent execution, Session events, tools and prompt assembly.
- [`credentials`](credentials/README.md) — Credential storage and provider authorization.
- [`deliverables`](deliverables/README.md) — Delivered files and recorded workspace changes.
- [`desktop`](desktop/README.md) — Private application runtime and renderer entry points.
- [`document`](document/README.md) — Office document conversion for Desktop previews.
- [`experimental`](experimental/README.md) — Opt-in capabilities whose contracts may still change.
- [`extensions`](extensions/README.md) — Runtime plugin creation and bounded extension execution.
- [`feedback`](feedback/README.md) — User feedback and message ratings.
- [`fs`](fs/README.md) — Filesystem providers, workspace confinement and file tools.
- [`goal`](goal/README.md) — Persistent goals and continuation within a Session.
- [`guard`](guard/README.md) — Execution deadlines and repeated-call reminders.
- [`hooks`](hooks/README.md) — Hook protocols and adapters for existing integrations.
- [`host`](host/README.md) — Local Desktop transport and operating-system services.
- [`identity`](identity/README.md) — Local anonymous identity used by reporting services.
- [`interaction`](interaction/README.md) — User approval, questions and conversation commands.
- [`jobs`](jobs/README.md) — Background work and bounded output observation.
- [`llm`](llm/README.md) — Model requests, provider routing, retries and token accounting.
- [`lsp`](lsp/README.md) — Language-server navigation and its model-facing tools.
- [`mcp`](mcp/README.md) — Connections to Model Context Protocol tools and resources.
- [`memory`](memory/README.md) — Long-term memory providers, tools and management operations.
- [`plan`](plan/README.md) — Plan-mode state and user-reviewed execution boundaries.
- [`preset`](preset/README.md) — Session-specific Agent composition and bundled instructions.
- [`ptc-runtime`](ptc-runtime/README.md) — Sandboxed programmatic tool execution.
- [`runtime-diagnostics`](runtime-diagnostics/README.md) — Live runtime invariants and diagnostic reporting.
- [`sandbox`](sandbox/README.md) — Execution confinement and platform policies.
- [`schedule`](schedule/README.md) — Host-owned scheduling and persisted delivery history.
- [`session`](session/README.md) — Session persistence, migrations, projections and telemetry.
- [`session-query`](session-query/README.md) — Session search, retrieval and export.
- [`settings`](settings/README.md) — Schema-backed configuration owned by the Host.
- [`shell`](shell/README.md) — Shell execution, environment handling and model-facing commands.
- [`skill`](skill/README.md) — Skill discovery, loading, learning and review.
- [`spill`](spill/README.md) — Bounded tool output and overflow storage.
- [`ssh`](ssh/README.md) — Remote filesystem, process and sandbox providers over SSH.
- [`storage`](storage/README.md) — Typed durable application data and storage backends.
- [`subagent`](subagent/README.md) — In-process Agent delegation and continuation controls.
- [`subprocess`](subprocess/README.md) — Managed subprocesses, output and process-tree cleanup.
- [`telemetry`](telemetry/README.md) — Separate transports for product events and Session logs.
- [`terminal`](terminal/README.md) — Persistent PTY sessions and interactive terminal tools.
- [`todo`](todo/README.md) — Task-list updates in the Session log.
- [`typert`](typert/README.md) — Generated type metadata and typed Remote contracts.
- [`util`](util/README.md) — Shared path, value, file and lifecycle primitives.
- [`web`](web/README.md) — Web search and fetch tools used by Desktop agents; not a website.
- [`webhook`](webhook/README.md) — Validated external events routed into Workspace Sessions.
- [`workflow`](workflow/README.md) — Model-authored workflows and fresh-Agent iteration.
- [`workspace`](workspace/README.md) — Durable workspace records and Session membership.

## Development

Run `pnpm install --frozen-lockfile` and `pnpm run build:official`. The repository retains inherited `@deepseek-ai/dsh-*` identifiers for compatibility.
