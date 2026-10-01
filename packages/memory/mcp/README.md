---
description: "Replaceable MemoryProvider adapter over a configured MCP server, including the reference knowledge-graph protocol."
kind: "package-reference"
---

# @deepseek-ai/dsh-memory-mcp

English | [中文](README.zh.md)

## Summary

This package adapts a configured MCP server to Aeoth's `MemoryProvider` contract. `generic` mode delegates to three explicit read/write/search tools. `reference-memory` mode stores bounded `MEMORY` and `USER` entries as namespaced entities in the MCP reference knowledge graph. The adapter never infers a provider from tool descriptions and never activates itself in the base bundle.

## Use this package

Mount it beside `@deepseek-ai/dsh-mcp-client` and `@deepseek-ai/dsh-mcp-resources`, set `memory.provider` to the adapter's `providerName`, and enable the adapter in a profile patch. The shipped reference overlay demonstrates the complete connection for `@modelcontextprotocol/server-memory`.

The external server owns its storage and availability. Aeoth still owns entry limits, duplicate checks, credential rejection, source provenance, and user-facing mutation semantics before a provider save is committed.

## Model Experience

The adapter does not add another model tool or prompt section. The existing `memory` tool and `/memory` command keep their names and semantics while reads and writes cross the configured MCP provider. Provider-native search results are bounded by `MemoryRuntime` before they reach the model.

### Token and KV-cache effects

The memory prompt remains bounded by `memoryCharLimit` and `userCharLimit`; the adapter adds no transcript copy and no unbounded tool schema. MCP tool calls add one remote round trip per provider operation. The model-visible catalog and tool schema are unchanged, so prompt/KV-cache shape is stable between filesystem and external providers.

## Known Limitations and Deferred Work

- Generic mode requires a server-specific canonical read/write/search contract; arbitrary MCP tools are not mapped by guessing.
- Reference-memory mode preserves Aeoth entries in a namespaced entity subset and does not import unrelated graph relations.
- Network or subprocess failure is reported as provider failure; it is not silently replaced by the filesystem provider.

## Source map

| File | Role |
|---|---|
| [`src/index.ts`](src/index.ts) | Provider contract adapter and reference-graph codec |
| [`../../mcp/mcp-client/src/connection.ts`](../../mcp/mcp-client/src/connection.ts) | Connection-owned MCP tool call bridge |
