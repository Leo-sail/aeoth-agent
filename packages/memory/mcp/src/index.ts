/** Profile-root MCP memory adapter; session overrides cannot redirect durable storage. */
import { createHash } from 'node:crypto'
import type { Context } from '@deepseek-ai/cordis'
import type { McpResourceRuntime } from '@deepseek-ai/dsh-mcp-resources'
import type { JsonValue } from '@deepseek-ai/dsh-util-values'
import type { MemoryDocument, MemoryEntry, MemoryProvider, MemoryRequestContext, MemorySearchHit, MemoryRuntime, MemoryTarget } from '@deepseek-ai/dsh-memory'
import z from '@deepseek-ai/schemastery'

export const name = 'memory-mcp'
export const inject = ['memories', 'mcpResources']
export type McpMemoryMode = 'generic' | 'reference-memory'
export interface Config {
  readonly mode?: McpMemoryMode
  readonly namespace?: string
  readonly providerName?: string
  readonly serverName?: string
  readonly readTool?: string
  readonly writeTool?: string
  readonly searchTool?: string
  readonly readGraphTool?: string
  readonly createEntitiesTool?: string
  readonly deleteEntitiesTool?: string
  readonly searchNodesTool?: string
}
export const Config: z<Config> = z.object({
  mode: z.union(['generic', 'reference-memory'] as const).default('generic'),
  namespace: z.string(), providerName: z.string().default('mcp:memory'), serverName: z.string().min(1).default('memory'),
  readTool: z.string().default('memory_read'), writeTool: z.string().default('memory_write'), searchTool: z.string().default('memory_search'),
  readGraphTool: z.string().default('read_graph'), createEntitiesTool: z.string().default('create_entities'),
  deleteEntitiesTool: z.string().default('delete_entities'), searchNodesTool: z.string().default('search_nodes'),
})
declare module '@deepseek-ai/cordis' { interface Context { memoryMcp: McpMemoryProvider } }

const REFERENCE_ENTITY_PREFIX = 'aeoth-memory:'
const REFERENCE_ENTITY_TYPE = 'aeoth-memory'
const REFERENCE_OBSERVATION_PREFIX = 'aeoth-memory-v1:'
interface ReferenceEntity { readonly name: string; readonly entityType?: string; readonly observations?: readonly string[] }
interface ReferenceGraph { readonly entities: readonly ReferenceEntity[] }

/**
 * Memory provider that keeps MEMORY/USER documents in an MCP memory server,
 * either through its read and write tools or as hash-named reference entities.
 */
export class McpMemoryProvider implements MemoryProvider {
  readonly name: string
  private readonly lifetime = new AbortController()
  constructor(private readonly ctx: Context, private readonly config: Required<Config>) { this.name = config.providerName }
  /**
   * Abort in-flight MCP calls by ending this provider's lifetime signal.
   */
  close(): void { this.lifetime.abort() }

  /**
   * Read one target's entries from the MCP server.
   * @param target - the MEMORY or USER target to load.
   * @param context - optional per-call provenance and cancellation context.
   * @returns the document assembled from the MCP read or the reference graph.
   */
  async load(target: MemoryTarget, context?: MemoryRequestContext): Promise<MemoryDocument> {
    if (this.config.mode === 'reference-memory') return { target, entries: (await this.referenceGraph(context)).entities.flatMap(entity => decodeReferenceEntity(entity, this.config.namespace)?.target === target ? [decodeReferenceEntity(entity, this.config.namespace)!.entry] : []) }
    const payload = await this.call(this.config.readTool, { target, namespace: this.config.namespace, context: publicContext(context) }, context)
    return { target, entries: extractEntries(payload, target) }
  }

  /**
   * Persist one document through the MCP server and verify the server kept it.
   * @param document - the complete document to write.
   * @param context - optional per-call provenance and cancellation context.
   */
  async save(document: MemoryDocument, context?: MemoryRequestContext): Promise<void> {
    if (this.config.mode !== 'reference-memory') {
      await this.call(this.config.writeTool, { target: document.target, entries: document.entries, namespace: this.config.namespace, context: publicContext(context) }, context)
      const saved = await this.load(document.target, context)
      if (JSON.stringify(saved.entries) !== JSON.stringify(document.entries)) throw new Error('MCP memory_write did not persist the requested document')
      return
    }
    const graph = await this.referenceGraph(context)
    const current = graph.entities.filter(entity => decodeReferenceEntity(entity, this.config.namespace)?.target === document.target)
    const wanted = document.entries.map((entry, index) => ({
      name: referenceEntityName(this.config.namespace, document.target, entry, index), entityType: REFERENCE_ENTITY_TYPE,
      observations: [encodeReferenceEntry(document.target, entry)],
    }))
    const currentNames = new Set(current.map(entity => entity.name))
    const wantedNames = new Set(wanted.map(entity => entity.name))
    const create = wanted.filter(entity => !currentNames.has(entity.name))
    if (create.length > 0) await this.call(this.config.createEntitiesTool, { entities: create }, context)
    const staged = (await this.referenceGraph(context)).entities
    for (const item of wanted) {
      const actual = staged.find(entity => entity.name === item.name)
      if (actual === undefined || JSON.stringify(actual.observations) !== JSON.stringify(item.observations)) throw new Error('MCP memory replacement was not persisted; previous entries retained')
    }
    const remove = current.filter(entity => !wantedNames.has(entity.name)).map(entity => entity.name)
    if (remove.length > 0) await this.call(this.config.deleteEntitiesTool, { entityNames: remove }, context)
    const final = (await this.referenceGraph(context)).entities
    const finalNames = final.filter(entity => entity.name.startsWith(namespacePrefix(this.config.namespace))).map(entity => entity.name).sort()
    if (JSON.stringify(finalNames.filter(name => name.startsWith(targetPrefix(this.config.namespace, document.target)))) !== JSON.stringify(wanted.map(entity => entity.name).sort())) throw new Error('MCP memory save is incomplete or changed concurrently; retry after reloading')
  }

  /**
   * Search the MCP memory server, or scan the reference graph in reference-memory mode.
   * @param query - the search text; whitespace splits it into terms.
   * @param target - restrict hits to one target, or undefined to search both.
   * @param limit - the maximum number of hits to return.
   * @param context - optional per-call provenance and cancellation context.
   * @returns matching hits ordered by descending score.
   */
  async search(query: string, target: MemoryTarget | undefined, limit: number, context?: MemoryRequestContext): Promise<readonly MemorySearchHit[]> {
    if (this.config.mode === 'reference-memory') {
      const terms = query.toLocaleLowerCase().split(/\s+/u).filter(Boolean)
      const entities = (await this.referenceGraph(context)).entities
      const targets: MemoryTarget[] = target === undefined ? ['memory', 'user'] : [target]
      return targets.flatMap(item => entities.filter(entity => decodeReferenceEntity(entity, this.config.namespace)?.target === item).flatMap((entity, index) => {
        const decoded = decodeReferenceEntity(entity, this.config.namespace)
        if (decoded?.target !== item) return []
        const score = terms.reduce((total, term) => total + (decoded.entry.text.toLocaleLowerCase().includes(term) ? 1 : 0), 0)
        return score > 0 ? [{ target: item, index, entry: decoded.entry.text, score, ...(decoded.entry.source === undefined ? {} : { source: decoded.entry.source }) }] : []
      })).sort((a, b) => b.score - a.score || a.index - b.index).slice(0, limit)
    }
    const payload = await this.call(this.config.searchTool, { query, ...(target === undefined ? {} : { target }), limit, namespace: this.config.namespace, context: publicContext(context) }, context)
    return extractHits(payload, target).slice(0, limit)
  }

  private async referenceGraph(context?: MemoryRequestContext): Promise<ReferenceGraph> {
    const payload = objectValue(await this.call(this.config.readGraphTool, {}, context))
    if (!payload || !Array.isArray(payload.entities)) throw new Error('MCP read_graph must return an entities array')
    return { entities: payload.entities.map(value => {
      const entity = record(value)
      const observations = entity.observations
      if (typeof entity.name !== 'string' || typeof entity.entityType !== 'string' || !Array.isArray(observations) || !observations.every(item => typeof item === 'string')) throw new Error('invalid MCP graph entity')
      return { name: entity.name, entityType: entity.entityType, observations: observations as string[] }
    }).sort((a, b) => a.name.localeCompare(b.name)) }
  }

  private async call(toolName: string, args: Record<string, unknown>, context?: MemoryRequestContext): Promise<unknown> {
    const resources = this.ctx.get('mcpResources') as McpResourceRuntime | undefined
    if (resources === undefined) throw new Error('MCP resource runtime is absent; mount @deepseek-ai/dsh-mcp-client and @deepseek-ai/dsh-mcp-resources')
    const signal = context?.signal === undefined ? this.lifetime.signal : AbortSignal.any([context.signal, this.lifetime.signal])
    signal.throwIfAborted()
    const payload = await resources.callTool(this.config.serverName, toolName, JSON.parse(JSON.stringify(args)) as JsonValue, { signal })
    if (payload && typeof payload === 'object' && !Array.isArray(payload) && (payload as Record<string, unknown>).isError === true) throw new Error(`MCP tool '${toolName}' returned an error`)
    const object = payload && typeof payload === 'object' && !Array.isArray(payload) ? payload as Record<string, unknown> : undefined
    if (object?.structuredContent !== undefined) return object.structuredContent
    if (Array.isArray(object?.content)) {
      const text = object.content.flatMap(block => {
        if (!block || typeof block !== 'object') return []
        const value = (block as Record<string, unknown>).text
        return typeof value === 'string' ? [value] : []
      }).join('\n').trim()
      if (text === '') return undefined
      try { return JSON.parse(text) }
      catch { if (toolName === this.config.writeTool || toolName === this.config.deleteEntitiesTool) return undefined; throw new Error(`MCP tool '${toolName}' returned invalid JSON`) }
    }
    return payload
  }
}

export function apply(ctx: Context, config: Config = {}): void {
  const memories = ctx.get('memories') as MemoryRuntime
  const profile = ctx.get('profileContext') as { dir?: string } | undefined
  const namespace = config.namespace ?? profile?.dir
  if (namespace === undefined || namespace.trim() === '') throw new Error('memory-mcp requires a profile or explicit namespace')
  const resolved: Required<Config> = {
    mode: config.mode ?? 'generic', namespace, providerName: config.providerName ?? 'mcp:memory', serverName: config.serverName ?? 'memory',
    readTool: config.readTool ?? 'memory_read', writeTool: config.writeTool ?? 'memory_write', searchTool: config.searchTool ?? 'memory_search',
    readGraphTool: config.readGraphTool ?? 'read_graph', createEntitiesTool: config.createEntitiesTool ?? 'create_entities',
    deleteEntitiesTool: config.deleteEntitiesTool ?? 'delete_entities', searchNodesTool: config.searchNodesTool ?? 'search_nodes',
  }
  const provider = new McpMemoryProvider(ctx, resolved)
  const unregister = memories.registerProvider(provider)
  ctx.provide('memoryMcp', provider)
  ctx.effect(() => unregister, 'memory-mcp provider')
}

function namespacePrefix(namespace: string): string { return `${REFERENCE_ENTITY_PREFIX}${hash(namespace)}:` }
function targetPrefix(namespace: string, target: MemoryTarget): string { return `${namespacePrefix(namespace)}${target}:` }
function referenceEntityName(namespace: string, target: MemoryTarget, entry: MemoryEntry, index: number): string { return `${targetPrefix(namespace, target)}${String(index).padStart(8, '0')}:${hash(JSON.stringify(entry))}` }
function encodeReferenceEntry(target: MemoryTarget, entry: MemoryEntry): string { return `${REFERENCE_OBSERVATION_PREFIX}${JSON.stringify({ target, entry })}` }
function decodeReferenceEntity(entity: ReferenceEntity, namespace: string): { target: MemoryTarget; entry: MemoryEntry } | undefined {
  if (entity.entityType !== REFERENCE_ENTITY_TYPE || !entity.name.startsWith(namespacePrefix(namespace))) return undefined
  if (entity.observations === undefined || entity.observations.length !== 1 || !entity.observations[0]?.startsWith(REFERENCE_OBSERVATION_PREFIX)) throw new Error('invalid Aeoth memory entity')
  const parsed = JSON.parse(entity.observations[0].slice(REFERENCE_OBSERVATION_PREFIX.length)) as { target?: unknown; entry?: unknown }
  if ((parsed.target !== 'memory' && parsed.target !== 'user') || !parsed.entry) throw new Error('invalid Aeoth memory entity payload')
  const value = parseEntry(parsed.entry)
  if (!entity.name.startsWith(targetPrefix(namespace, parsed.target)) || !entity.name.endsWith(`:${hash(JSON.stringify(value))}`)) throw new Error('Aeoth memory entity integrity check failed')
  return { target: parsed.target, entry: value }
}
function extractEntries(payload: unknown, target: MemoryTarget): readonly MemoryEntry[] {
  const value = objectValue(payload)
  const candidate = Array.isArray(payload) ? payload : value?.[target] ?? value?.entries
  if (!Array.isArray(candidate)) throw new Error('MCP memory_read must return an entries array')
  return candidate.map(parseEntry)
}
function extractHits(payload: unknown, target: MemoryTarget | undefined): readonly MemorySearchHit[] {
  const value = objectValue(payload)
  const candidate = Array.isArray(payload) ? payload : value?.results ?? value?.matches ?? value?.entries
  if (!Array.isArray(candidate)) throw new Error('MCP memory_search must return a results array')
  return candidate.map((item, index) => {
    const object = typeof item === 'string' ? { entry: item } : record(item)
    const kind = object.target ?? target ?? 'memory'; const text = object.entry ?? object.text
    if ((kind !== 'memory' && kind !== 'user') || (target !== undefined && kind !== target) || typeof text !== 'string') throw new Error('invalid MCP search result')
    const score = object.score === undefined ? 1 : object.score
    if (typeof score !== 'number' || !Number.isFinite(score)) throw new Error('invalid MCP search score')
    return { target: kind, index, entry: text, score, ...(object.source === undefined ? {} : { source: parseEntry({ text, source: object.source }).source! }) }
  })
}
function parseEntry(value: unknown): MemoryEntry {
  const object = typeof value === 'string' ? { text: value } : record(value)
  if (typeof object.text !== 'string' || object.text.trim() === '') throw new Error('invalid MCP memory entry')
  if (object.source === undefined) return { text: object.text }
  const source = record(object.source)
  if (typeof source.createdAt !== 'string' || Number.isNaN(Date.parse(source.createdAt)) || (source.sessionId !== undefined && typeof source.sessionId !== 'string') || (source.workspace !== undefined && typeof source.workspace !== 'string') || (source.eventSeq !== undefined && (typeof source.eventSeq !== 'number' || !Number.isSafeInteger(source.eventSeq) || source.eventSeq < 0))) throw new Error('invalid MCP memory provenance')
  return { text: object.text, source: source as unknown as NonNullable<MemoryEntry['source']> }
}
function objectValue(value: unknown): Record<string, unknown> | undefined {
  if (value && typeof value === 'object' && !Array.isArray(value)) return value as Record<string, unknown>
  if (typeof value !== 'string') return undefined
  try { return objectValue(JSON.parse(value)) } catch { return undefined }
}
function record(value: unknown): Record<string, unknown> { if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('expected MCP object'); return value as Record<string, unknown> }
function publicContext(context?: MemoryRequestContext): Omit<MemoryRequestContext, 'signal'> { if (context === undefined) return {}; const { signal: _signal, ...value } = context; return value }
function hash(value: string): string { return createHash('sha256').update(value).digest('hex') }
