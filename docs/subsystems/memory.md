# Memory subsystem

English | [中文](memory.zh.md)

The memory subsystem keeps long-term documents for the current Session and for the Aeoth home, behind a provider registry that adapters (filesystem, MCP, command tools) plug into. Four services share the work, and one event reports settled mutations.

## Targets and snapshots

| Target | Scope | Default limit |
| --- | --- | --- |
| `memory` | the current Session | `MEMORY_DEFAULT_CHAR_LIMIT` (2200 characters) |
| `user` | the Aeoth home | `USER_DEFAULT_CHAR_LIMIT` (1375 characters) |

`MemoryTarget` is the `MEMORY_TARGETS` union. A `MemorySnapshot` carries the target, its documents, and the revision a mutation settled, so a reader that needs consistency takes one snapshot per operation instead of caching documents across mutations.

## Services

| Service | Package | Responsibility |
| --- | --- | --- |
| `ctx.memories` | `packages/memory/memory` | Provider registration, bounded snapshots, reads, mutations, document replacement, search, and prompt rendering |
| `ctx.memoryController` | `packages/api/memory-controller` | Remote API face for the same operations, plus curator candidates, migration planning, and skill records |
| `ctx.memoryMcp` | `packages/memory/mcp` | A provider backed by an MCP server's memory resources |
| `ctx.memoryMigration` | `packages/memory/migration` | Migration plans for stored documents: preview, list, apply, and rollback |

Providers are registered by name for the targets they serve; the registry keeps the selected provider per target, so a Session sees one snapshot per target rather than a provider-specific view.

## Change notification

A settled mutation dispatches `memories/change` with the changed target, its current snapshot, and the namespace when the request carried one. The event carries state instead of a diff: listeners re-read the snapshot they need, and a listener that runs during a mutation observes the settled revision rather than a partial write.

## Related pages

- [skills.md](skills.md) documents the skill catalog that the curator operations read and write.
- [mcp.md](mcp.md) documents the MCP seam the MCP provider builds on.

<!-- BEGIN GENERATED cordis-surface (gen-cordis-catalog.ts) — do not edit between markers -->

<a id="cordis-surface"></a>

## Cordis API

Generated from source by `scripts/gen-cordis-catalog.ts` (verified fresh by `pnpm run verify-cordis-catalog` in doc-sync; regenerate with `pnpm run gen-cordis-catalog`) — the language sides differ only in locale-specific paired document paths. Signature blocks use a `ts cordis-catalog` fence and keep the original source JSDoc; dispatch modes are defined in the [primer](../cordis-primer.md#dispatch-modes), and the framework-inherited `ctx` API lives in [cordis-api/inherited.md](../cordis-api/inherited.md).

<a id="ctxmemories--memoryruntime"></a>

### `ctx.memories` — `MemoryRuntime`

Profile-scoped long-term memory service: registers the active provider and owns bounded MEMORY/USER documents, cached snapshots, mutations, and search.

```ts cordis-catalog
/**
 * Register a provider under its own name for later selection by config.
 * @param provider - the memory provider implementation to register.
 * @returns an unregister callback that drains mutations, drops snapshots, and closes the provider.
 */
registerProvider(provider: MemoryProvider): () => Promise<void>

/**
 * List the names of every registered memory provider.
 * @returns registered provider names in sorted order.
 */
listProviders(): string[]

/**
 * Report the configured character budget for one target.
 * @param target - the MEMORY or USER target to look up.
 * @returns the configured character limit for that target.
 */
limits(target: MemoryTarget): number

/**
 * Read the last cached snapshot for one target without touching the provider.
 * @param target - the MEMORY or USER target to read.
 * @param context - optional namespace selecting an isolated snapshot cache slot.
 * @returns the cached snapshot, or an empty one when nothing is cached yet.
 */
snapshot(target: MemoryTarget, context?: MemoryRequestContext): MemorySnapshot

/**
 * Load one target from the configured provider and cache the resulting snapshot.
 * @param target - the MEMORY or USER target to load.
 * @param context - optional per-call namespace and source provenance.
 * @returns the validated snapshot of the loaded document.
 */
async read(target: MemoryTarget, context?: MemoryRequestContext): Promise<MemorySnapshot>

/**
 * Re-read both targets from the configured provider.
 * @param context - optional per-call namespace and source provenance.
 * @returns MEMORY then USER snapshots in target order.
 */
async refresh(context?: MemoryRequestContext): Promise<readonly MemorySnapshot[]>

/**
 * Apply one serialized add/replace/remove mutation and report what changed.
 * @param target - the MEMORY or USER target to mutate.
 * @param action - the mutation to perform: add, replace, or remove.
 * @param content - the new entry text for add and replace; unused for remove.
 * @param oldText - a unique substring identifying the entry to replace or remove.
 * @param context - optional per-call namespace and source provenance.
 * @returns whether anything changed, the current snapshot, and an outcome message.
 */
async mutate( target: MemoryTarget, action: 'add' | 'replace' | 'remove', content: string | undefined, oldText: string | undefined, context?: MemoryRequestContext, ): Promise<{ changed: boolean; snapshot: MemorySnapshot; message: string }>

/**
 * Overwrite one target document with the supplied entries in one serialized save.
 * @param target - the MEMORY or USER target to replace.
 * @param texts - the complete replacement entries, each bare text or a full entry.
 * @param context - optional per-call namespace and source provenance.
 * @returns the snapshot persisted for the target.
 */
async replaceDocument(target: MemoryTarget, texts: readonly (string | MemoryEntry)[], context?: MemoryRequestContext): Promise<MemorySnapshot>

/**
 * Journal before a validated, serialized multi-document change.
 * @param build - derives the proposed MEMORY and USER documents from the current ones.
 * @param checkpoint - awaits after validation and before the first save, for journaling the transaction.
 */
changeDocuments( build: (before: Readonly<Record<MemoryTarget, MemoryDocument>>) => Readonly<Record<MemoryTarget, MemoryDocument>>, checkpoint: (before: Readonly<Record<MemoryTarget, MemoryDocument>>, after: Readonly<Record<MemoryTarget, MemoryDocument>>) => Promise<void>, ): Promise<void>

/**
 * Search entries through the provider hook, falling back to a local term scan.
 * @param query - the non-empty search text.
 * @param target - restrict hits to one target, or undefined to search both.
 * @param limit - optional maximum hit count, bounded by the configured maximum.
 * @param context - optional per-call namespace and source provenance.
 * @returns matching hits ordered by descending score.
 */
async search(query: string, target: MemoryTarget | undefined, limit: number | undefined, context?: MemoryRequestContext): Promise<readonly MemorySearchHit[]>

/**
 * Render the cached MEMORY/USER snapshots as prompt text.
 * @returns an advisory header followed by one labeled block per target.
 */
renderPrompt(): string
```

Source: [`packages/memory/memory/src/index.ts`](../../packages/memory/memory/src/index.ts)

<a id="ctxmemorycontroller--memorycontroller"></a>

### `ctx.memoryController` — `MemoryController`

Host Remote owner for MEMORY/USER documents, skill curation, and legacy migration plans.

```ts cordis-catalog
/**
 * Describe the configured provider and the current MEMORY/USER snapshots.
 * @returns the provider name plus one snapshot view per memory target.
 */
@Remote async describe(): Promise<MemoryDescribeValue>

/**
 * Apply one add/replace/remove mutation to a target and return its new snapshot.
 * @param target - the MEMORY or USER target to mutate.
 * @param action - the mutation to perform: add, replace, or remove.
 * @param content - the new entry text for add and replace; unused for remove.
 * @param oldText - a unique substring identifying the entry to replace or remove.
 * @returns the target snapshot after the mutation settled.
 */
@Remote async mutate( target: RemoteMemoryTarget, action: 'add' | 'replace' | 'remove', content: string | undefined, oldText: string | undefined, ): Promise<MemorySnapshotView>

/**
 * Replace a target document with the supplied entries in one serialized write.
 * @param target - the MEMORY or USER target to replace.
 * @param entries - the complete replacement entries, each bare text or text with provenance.
 * @returns the target snapshot reflecting the replaced document.
 */
@Remote async replaceDocument(target: RemoteMemoryTarget, entries: readonly (string | { readonly text: string; readonly source?: { readonly sessionId?: string; readonly eventSeq?: number; readonly workspace?: string; readonly createdAt: string } })[]): Promise<MemorySnapshotView>

/**
 * Search memory entries through the configured provider.
 * @param query - the non-empty search text.
 * @param target - restrict hits to one target, or undefined to search both.
 * @returns matching hits with target, index, text, score, and provenance.
 */
@Remote async search(query: string, target: RemoteMemoryTarget | undefined): Promise<readonly MemorySearchHitView[]>

/**
 * Resolve one memory source against Session storage and report its availability.
 * @param source - the session id, optional event sequence, and optional workspace to look up.
 * @returns the source with its resolution status and any located session or event details.
 */
@Remote async resolveSource(source: MemorySourceRequest): Promise<MemorySourceResolution>

/**
 * List the skill-curator candidates awaiting or reflecting review.
 * @returns every curator candidate with its review status.
 */
@Remote async listCuratorCandidates(): Promise<readonly MemoryCuratorCandidate[]>

/**
 * Record one review decision on a curator candidate and return its updated record.
 * @param id - identity of the curator candidate to review.
 * @param decision - the review outcome: approve, reject, archive, or restore.
 * @param note - optional reviewer note stored with the decision.
 * @returns the candidate as it stands after the decision was recorded.
 */
@Remote async reviewSkill(id: string, decision: 'approve' | 'reject' | 'archive' | 'restore', note?: string): Promise<MemoryCuratorCandidate>

/**
 * Record an observed outcome for a skill with the curator.
 * @param name - the skill name the outcome belongs to.
 * @param outcome - the observed result: success, failure, or neutral.
 * @param note - optional detail explaining the outcome.
 * @param revision - optional exact skill revision the outcome was observed on.
 */
@Remote async recordSkillFeedback(name: string, outcome: 'success' | 'failure' | 'neutral', note?: string, revision?: string): Promise<void>

/**
 * List the journaled legacy-memory migration plans.
 * @returns every plan summary, newest update first.
 */
@Remote async listMigrationPlans(): Promise<readonly MemoryMigrationPlan[]>

/**
 * Parse a legacy memory export and journal a preview plan without touching memory.
 * @param path - filesystem path of the legacy export to read.
 * @returns the previewed plan with its parsed entries, skipped records, and fingerprint.
 */
@Remote async previewMigration(path: string): Promise<MemoryMigrationPlan>

/**
 * Commit a previewed migration plan to the live memory documents.
 * @param id - identity of the journaled plan returned by previewMigration.
 * @returns the plan advanced to its applied state.
 */
@Remote async applyMigration(id: string): Promise<MemoryMigrationPlan>

/**
 * Restore the memory documents captured before an applied migration plan.
 * @param id - identity of the journaled plan to roll back.
 * @returns the plan advanced to its rolled-back state.
 */
@Remote async rollbackMigration(id: string): Promise<MemoryMigrationPlan>

/**
 * List registered skills merged with the managed profile skills.
 * @returns one summary per skill sorted by name, flagged writable when this service may write it.
 */
@Remote async listSkills(): Promise<readonly MemorySkillSummary[]>

/**
 * Load one skill by name, preferring the writable managed copy.
 * @param name - the exact skill name to load.
 * @returns the skill summary plus its full content.
 */
@Remote async getSkill(name: string): Promise<MemorySkillValue>

/**
 * Create or update a managed skill under the profile skills directory.
 * @param name - the skill name to write.
 * @param description - the one-line skill description.
 * @param content - the full Markdown skill body.
 * @param expectedRevision - the revision the caller based this write on, or null for a new skill.
 * @returns the saved skill with its new revision.
 */
@Remote async saveSkill(name: string, description: string, content: string, expectedRevision: string | null): Promise<MemorySkillValue>

/**
 * Delete a writable managed skill.
 * @param name - the skill name to delete.
 * @param expectedRevision - the revision the caller based the removal on.
 */
@Remote async removeSkill(name: string, expectedRevision: string): Promise<void>
```

Source: [`packages/api/memory-controller/src/index.ts`](../../packages/api/memory-controller/src/index.ts)

<a id="ctxmemorymcp--mcpmemoryprovider"></a>

### `ctx.memoryMcp` — `McpMemoryProvider`

Memory provider that keeps MEMORY/USER documents in an MCP memory server, either through its read and write tools or as hash-named reference entities.

```ts cordis-catalog
/**
 * Abort in-flight MCP calls by ending this provider's lifetime signal.
 */
close(): void

/**
 * Read one target's entries from the MCP server.
 * @param target - the MEMORY or USER target to load.
 * @param context - optional per-call provenance and cancellation context.
 * @returns the document assembled from the MCP read or the reference graph.
 */
async load(target: MemoryTarget, context?: MemoryRequestContext): Promise<MemoryDocument>

/**
 * Persist one document through the MCP server and verify the server kept it.
 * @param document - the complete document to write.
 * @param context - optional per-call provenance and cancellation context.
 */
async save(document: MemoryDocument, context?: MemoryRequestContext): Promise<void>

/**
 * Search the MCP memory server, or scan the reference graph in reference-memory mode.
 * @param query - the search text; whitespace splits it into terms.
 * @param target - restrict hits to one target, or undefined to search both.
 * @param limit - the maximum number of hits to return.
 * @param context - optional per-call provenance and cancellation context.
 * @returns matching hits ordered by descending score.
 */
async search(query: string, target: MemoryTarget | undefined, limit: number, context?: MemoryRequestContext): Promise<readonly MemorySearchHit[]>
```

Source: [`packages/memory/mcp/src/index.ts`](../../packages/memory/mcp/src/index.ts)

<a id="ctxmemorymigration--memorymigrationruntime"></a>

### `ctx.memoryMigration` — `MemoryMigrationRuntime`

Journaled preview/apply/rollback service for legacy MCP memory exports; every committed plan records its before/after documents so rollback stays safe.

```ts cordis-catalog
/**
 * Parse a legacy export, journal a preview plan, and leave memory untouched.
 * @param path - path of the legacy export file to parse.
 * @returns the persisted preview plan with its entries and skipped records.
 */
async preview(path: string): Promise<MigrationPlan>

/**
 * List journaled migration plans without their before and after documents.
 * @returns plan summaries ordered by most recently updated first.
 */
async list(): Promise<readonly MigrationSummary[]>

/**
 * Commit a previewed plan, appending its entries and journaling the transaction.
 * @param id - identity of the journaled plan to apply.
 * @returns the plan advanced to its applied state.
 */
async apply(id: string): Promise<MigrationPlan>

/**
 * Restore the documents captured before an applied plan, refusing when memory changed since.
 * @param id - identity of the journaled plan to roll back.
 * @returns the plan advanced to its rolled-back state.
 */
async rollback(id: string): Promise<MigrationPlan>
```

Source: [`packages/memory/migration/src/index.ts`](../../packages/memory/migration/src/index.ts)

<a id="memories-events"></a>

### `memories/*` events

<a id="memorieschange--emit"></a>

#### `memories/change` — emit

A memory mutation settled: the target's snapshot is current, so listeners may re-read it or drop caches.

```ts cordis-catalog
/**
 * A memory mutation settled: the target's snapshot is current, so listeners may re-read it or drop caches.
 * @mode emit
 * @param change - the changed target, its current snapshot, and the namespace when one applies.
 */
'memories/change'(change: { target: MemoryTarget; snapshot: MemorySnapshot; namespace?: string }): void
```

Source: [`packages/memory/memory/src/index.ts`](../../packages/memory/memory/src/index.ts)
<!-- END GENERATED cordis-surface -->
