/** Safe preview/apply/rollback migration service for legacy MCP memory exports. */
import { createHash, randomUUID } from 'node:crypto'
import { lstat, mkdir, readdir, readFile } from 'node:fs/promises'
import { basename, join, resolve } from 'node:path'
import type { Context } from '@deepseek-ai/cordis'
import { writeFileAtomic } from '@deepseek-ai/dsh-atomic-write'
import { resolveAeothHome } from '@deepseek-ai/dsh-home-paths'
import type { MemoryDocument, MemoryRuntime, MemoryTarget } from '@deepseek-ai/dsh-memory'

const MAX_SOURCE_BYTES = 8 * 1024 * 1024

export interface MigrationEntry {
  readonly target: MemoryTarget
  readonly text: string
  readonly source?: { readonly legacyKey?: string }
}
export type MigrationStatus = 'preview' | 'applying' | 'applied' | 'rollback-in-progress' | 'rolled-back'
export interface MigrationPlan {
  readonly id: string
  readonly path: string
  readonly format: string
  readonly fingerprint: string
  readonly entries: readonly MigrationEntry[]
  readonly skipped: readonly string[]
  readonly status: MigrationStatus
  readonly provider?: string
  readonly createdAt: string
  readonly updatedAt: string
  readonly before?: { readonly memory: MemoryDocument; readonly user: MemoryDocument }
  readonly after?: { readonly memory: MemoryDocument; readonly user: MemoryDocument }
}
export type MigrationSummary = Omit<MigrationPlan, 'before' | 'after'>

export const name = 'memory-migration'
export const inject = ['memories']
declare module '@deepseek-ai/cordis' { interface Context { memoryMigration: MemoryMigrationRuntime } }

export class MemoryMigrationRuntime {
  private readonly root: string
  private readonly journal: string
  private tail: Promise<unknown> = Promise.resolve()

  constructor(private readonly ctx: Context) {
    const profile = ctx.get('profileContext') as { dir?: string } | undefined
    this.root = resolve(profile?.dir ?? resolveAeothHome(), 'memories', 'migrations')
    this.journal = join(this.root, 'plans')
  }

  async preview(path: string): Promise<MigrationPlan> {
    const absolute = resolve(path)
    const raw = await readSource(absolute)
    const parsed = parseLegacy(raw, basename(absolute))
    const now = new Date().toISOString()
    const plan: MigrationPlan = {
      id: randomUUID(), path: absolute, format: parsed.format, fingerprint: fingerprint(raw),
      entries: parsed.entries, skipped: parsed.skipped, status: 'preview', createdAt: now, updatedAt: now,
    }
    await this.write(plan)
    return plan
  }

  async list(): Promise<readonly MigrationSummary[]> {
    await ensureJournal(this.journal, false)
    let files: string[]
    try { files = (await readdir(this.journal)).filter(file => /^[0-9a-f-]{36}\.json$/u.test(file)) }
    catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') return []; throw error }
    const plans: MigrationSummary[] = []
    for (const file of files) {
      const plan = await this.read(file.slice(0, -5))
      const { before: _before, after: _after, ...summary } = plan
      plans.push(summary)
    }
    return plans.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  }

  async apply(id: string): Promise<MigrationPlan> {
    return this.serial(async () => {
      const plan = await this.read(id)
      if (plan.status !== 'preview') throw new Error(`migration '${id}' is not awaiting confirmation`)
      const raw = await readSource(plan.path)
      if (fingerprint(raw) !== plan.fingerprint) throw new Error('legacy source changed after preview; preview it again')
      const memories = this.requireMemories()
      let applying: MigrationPlan | undefined
      await memories.changeDocuments((before) => {
        const add = (target: MemoryTarget): MemoryDocument => {
          const entries = [...before[target].entries]
          const seen = new Set(entries.map(entry => entry.text))
          for (const item of plan.entries) if (item.target === target && !seen.has(item.text)) {
            entries.push({ text: item.text })
            seen.add(item.text)
          }
          return { target, entries }
        }
        return { memory: add('memory'), user: add('user') }
      }, async (before, after) => {
        applying = { ...plan, status: 'applying', provider: memories.providerName, before, after, updatedAt: new Date().toISOString() }
        await this.write(applying)
      })
      if (applying === undefined) throw new Error('migration journal was not committed before apply')
      const next: MigrationPlan = { ...applying, status: 'applied', updatedAt: new Date().toISOString() }
      await this.write(next)
      return next
    })
  }

  async rollback(id: string): Promise<MigrationPlan> {
    return this.serial(async () => {
      const plan = await this.read(id)
      if ((plan.status !== 'applied' && plan.status !== 'applying' && plan.status !== 'rollback-in-progress')
        || plan.before === undefined || plan.after === undefined || plan.provider === undefined) {
        throw new Error(`migration '${id}' has no recoverable transaction to roll back`)
      }
      const memories = this.requireMemories()
      if (memories.providerName !== plan.provider) throw new Error(`migration provider changed from '${plan.provider}' to '${memories.providerName}'`)
      let rolling: MigrationPlan | undefined
      await memories.changeDocuments((current) => {
        for (const target of ['memory', 'user'] as const) {
          if (!sameDocument(current[target], plan.before![target]) && !sameDocument(current[target], plan.after![target])) {
            throw new Error(`${target} memory changed outside this migration; refusing rollback`)
          }
        }
        return { memory: plan.before!.memory, user: plan.before!.user }
      }, async () => {
        rolling = { ...plan, status: 'rollback-in-progress', updatedAt: new Date().toISOString() }
        await this.write(rolling)
      })
      if (rolling === undefined) throw new Error('rollback journal was not committed before rollback')
      const next: MigrationPlan = { ...rolling, status: 'rolled-back', updatedAt: new Date().toISOString() }
      await this.write(next)
      return next
    })
  }

  private requireMemories(): MemoryRuntime {
    const memories = this.ctx.get('memories')
    if (memories === undefined) throw new Error('memory service is absent')
    return memories
  }

  private async read(id: string): Promise<MigrationPlan> {
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu.test(id)) throw new Error('invalid migration id')
    await ensureJournal(this.journal, false)
    const path = join(this.journal, `${id}.json`)
    const stat = await lstat(path)
    if (!stat.isFile() || stat.isSymbolicLink() || stat.size > MAX_SOURCE_BYTES * 2) throw new Error('invalid migration journal file')
    const plan = JSON.parse(await readFile(path, 'utf8')) as MigrationPlan
    if (plan.id !== id || !Array.isArray(plan.entries) || !Array.isArray(plan.skipped)) throw new Error('invalid migration journal content')
    return plan
  }

  private async write(plan: MigrationPlan): Promise<void> {
    await ensureJournal(this.journal, true)
    await writeFileAtomic(join(this.journal, `${plan.id}.json`), JSON.stringify(plan, null, 2) + '\n', { mode: 0o600, dirMode: 0o700 })
  }

  private serial<T>(operation: () => Promise<T>): Promise<T> {
    const next = this.tail.then(operation)
    this.tail = next.catch(() => {})
    return next
  }
}

function sameDocument(left: MemoryDocument, right: MemoryDocument): boolean {
  return left.target === right.target && JSON.stringify(left.entries) === JSON.stringify(right.entries)
}
async function ensureJournal(path: string, create: boolean): Promise<void> {
  const root = resolve(path)
  for (const item of [resolve(root, '../..'), resolve(root, '..'), root]) {
    try {
      const stat = await lstat(item)
      if (!stat.isDirectory() || stat.isSymbolicLink()) throw new Error('migration journal path must not contain symbolic links')
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
      if (create) await mkdir(item, { mode: 0o700 })
    }
  }
}

const AEOTH_OBSERVATION_PREFIX = 'aeoth-memory-v1:'

interface Parsed { format: string; entries: MigrationEntry[]; skipped: string[] }
interface LegacyEntity { readonly name?: unknown; readonly entityType?: unknown; readonly observations?: unknown }

function parseLegacy(raw: string, filename: string): Parsed {
  const entries: MigrationEntry[] = []
  const skipped: string[] = []
  const add = (target: MemoryTarget, text: unknown, key?: string): void => {
    if (typeof text !== 'string' || text.trim() === '') {
      if (text !== undefined) skipped.push(String(key ?? text))
      return
    }
    entries.push({ target, text: text.trim(), ...(key === undefined ? {} : { source: { legacyKey: key } }) })
  }

  const json = parseJson(raw)
  if (json !== undefined) {
    visitJson(json, add)
    return { format: 'json', entries: dedupe(entries), skipped }
  }

  const lines = raw.split(/\r?\n/u).map(line => line.trim()).filter(Boolean)
  const records = lines.map(line => parseJson(line))
  if (records.every(record => record !== undefined)) {
    for (const record of records) visitJson(record, add)
    return { format: 'jsonl', entries: dedupe(entries), skipped }
  }

  if (/\.(json|jsonl)$/iu.test(filename)) throw new Error('Malformed JSON or JSONL export; no text fallback is allowed')
  const markdownEntries = raw.split(/\n§\n/u).map(value => value.trim()).filter(Boolean)
  if (markdownEntries.length > 1) {
    for (const entry of markdownEntries) add('memory', entry)
    return { format: 'markdown-entries', entries: dedupe(entries), skipped }
  }
  for (const line of lines) add('memory', line)
  return { format: filename.toLowerCase().endsWith('.md') ? 'markdown-lines' : 'text-lines', entries: dedupe(entries), skipped }
}

function visitJson(value: unknown, add: (target: MemoryTarget, text: unknown, key?: string) => void, defaultTarget: MemoryTarget = 'memory', key?: string): void {
  if (Array.isArray(value)) { for (const item of value) visitJson(item, add, defaultTarget, key); return }
  if (typeof value === 'string') { add(defaultTarget, value, key); return }
  if (value === null || typeof value !== 'object') throw new Error('Unsupported legacy memory record; source was not modified')
  const obj = value as Record<string, unknown>
  if (obj.type === 'relation' || ('from' in obj && 'to' in obj && 'relationType' in obj)) {
    if (typeof obj.from !== 'string' || typeof obj.to !== 'string' || typeof obj.relationType !== 'string') throw new Error('Invalid legacy relation')
    add(defaultTarget, `${obj.from} --${obj.relationType}--> ${obj.to}`, 'relation')
    return
  }
  if (!['type', 'entityType', 'entries', 'memory', 'user', 'entities', 'relations', 'text', 'content', 'value'].some(key => key in obj)) throw new Error('Unsupported legacy memory object; source was not modified')

  if (obj.type === 'entity' || 'entityType' in obj || 'observations' in obj) {
    const entity = obj as LegacyEntity
    if (!Array.isArray(entity.observations)) throw new Error('Invalid legacy entity: observations must be an array')
    const entityName = typeof entity.name === 'string' ? entity.name : 'entity'
    const target = targetFromValue(obj.target, defaultTarget)
    for (const observation of entity.observations) {
      const decoded = decodeAeothObservation(observation)
      if (typeof observation === 'string' && observation.startsWith(AEOTH_OBSERVATION_PREFIX) && decoded === undefined) throw new Error('Invalid Aeoth memory observation')
      if (decoded !== undefined) add(decoded.target, decoded.text, entityName)
      else add(target, typeof observation === 'string' ? `${entityName}: ${observation}` : observation, entityName)
    }
    return
  }

  let handled = false
  for (const [field, childTarget, childKey] of [
    ['entries', targetFromValue(obj.target, defaultTarget), key],
    ['memory', 'memory', 'memory'],
    ['user', 'user', 'user'],
    ['entities', defaultTarget, key],
    ['relations', defaultTarget, key],
  ] as const) {
    if (!(field in obj)) continue
    handled = true
    if (!Array.isArray(obj[field])) throw new Error(`Invalid legacy ${field}: expected an array`)
    visitJson(obj[field], add, childTarget, childKey)
  }

  const target = targetFromValue(obj.target, defaultTarget)
  const text = obj.text ?? obj.content ?? obj.value
  if (text !== undefined) {
    handled = true
    add(target, text, key ?? (typeof obj.name === 'string' ? obj.name : undefined))
  }
  if (!handled) throw new Error('Unsupported legacy memory object; source was not modified')
}

function targetFromValue(value: unknown, fallback: MemoryTarget): MemoryTarget { return value === 'user' || value === 'memory' ? value : fallback }
function decodeAeothObservation(value: unknown): { target: MemoryTarget; text: string } | undefined {
  if (typeof value !== 'string' || !value.startsWith('aeoth-memory-v1:')) return undefined
  try {
    const parsed = JSON.parse(value.slice('aeoth-memory-v1:'.length)) as { target?: unknown; entry?: { text?: unknown } }
    return (parsed.target === 'user' || parsed.target === 'memory') && typeof parsed.entry?.text === 'string' ? { target: parsed.target, text: parsed.entry.text } : undefined
  } catch { return undefined }
}
function parseJson(value: string): unknown | undefined {
  try { return JSON.parse(value) } catch { return undefined }
}
function dedupe(entries: MigrationEntry[]): MigrationEntry[] {
  const seen = new Set<string>()
  return entries.filter(entry => {
    const key = `${entry.target}\0${entry.text}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}
async function readSource(path: string): Promise<string> {
  const stat = await lstat(path)
  if (!stat.isFile() || stat.isSymbolicLink()) throw new Error('legacy memory source must be a regular file, not a symlink')
  if (stat.size > MAX_SOURCE_BYTES) throw new Error(`legacy memory source exceeds ${MAX_SOURCE_BYTES} bytes`)
  return readFile(path, 'utf8')
}
function fingerprint(raw: string): string { return createHash('sha256').update(raw).digest('hex') }

export function apply(ctx: Context): void { ctx.provide('memoryMigration', new MemoryMigrationRuntime(ctx)) }
