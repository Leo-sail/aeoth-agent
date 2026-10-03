import { createSnapshotStore, type SnapshotStore } from '@deepseek-ai/dsh-client-store'
import type {
  ClientRemote, MemoryCuratorCandidate, MemoryDescribeValue, MemoryMigrationPlan, MemorySearchHitView,
  MemorySkillSummary, MemorySkillValue, MemorySourceResolution, MemorySourceView,
} from '@deepseek-ai/dsh-api-remotes/client'

export type MemoryTarget = 'memory' | 'user'
export interface MemorySettingsSnapshot {
  loading: boolean
  pending: boolean
  value: MemoryDescribeValue | undefined
  skills: readonly MemorySkillSummary[]
  selectedSkill: MemorySkillValue | undefined
  candidates: readonly MemoryCuratorCandidate[]
  migrations: readonly MemoryMigrationPlan[]
  sources: Readonly<Record<string, MemorySourceResolution>>
  results: readonly MemorySearchHitView[] | undefined
  error: string | undefined
  skillError: string | undefined
}
export interface MemorySettingsFace {
  hooks: { memorySettings: SnapshotStore<MemorySettingsSnapshot> }
  load: () => Promise<void>
  mutate: (target: MemoryTarget, action: 'add' | 'replace' | 'remove', content?: string, oldText?: string) => Promise<boolean>
  search: (query: string, target: MemoryTarget) => Promise<void>
  selectSkill: (name: string) => Promise<void>
  saveSkill: (name: string, description: string, content: string, revision: string | null) => Promise<boolean>
  removeSkill: (name: string, revision: string) => Promise<boolean>
  reviewSkill: (id: string, decision: 'approve' | 'reject' | 'archive' | 'restore', note?: string) => Promise<boolean>
  recordSkillFeedback: (name: string, outcome: 'success' | 'failure' | 'neutral', note?: string, revision?: string) => Promise<boolean>
  previewMigration: (path: string) => Promise<boolean>
  applyMigration: (id: string) => Promise<boolean>
  rollbackMigration: (id: string) => Promise<boolean>
}

export function sourceKey(source: MemorySourceView): string { return JSON.stringify([source.sessionId, source.eventSeq, source.workspace]) }

/** React-free state; failed mutations retain both last-good data and the component's draft. */
export class MemorySettingsController {
  private readonly store = createSnapshotStore<MemorySettingsSnapshot>({ loading: false, pending: false, value: undefined, skills: [], selectedSkill: undefined, candidates: [], migrations: [], sources: {}, results: undefined, error: undefined, skillError: undefined })
  private generation = 0
  private selection = 0
  private searchGeneration = 0
  private disposed = false
  constructor(private readonly remote: ClientRemote['memory']) {}
  inject(): MemorySettingsFace {
    return {
      hooks: { memorySettings: this.store }, load: () => this.load(), mutate: (...args) => this.mutate(...args), search: (...args) => this.search(...args),
      selectSkill: name => this.selectSkill(name), saveSkill: (...args) => this.saveSkill(...args), removeSkill: (...args) => this.removeSkill(...args),
      reviewSkill: (...args) => this.reviewSkill(...args), recordSkillFeedback: (...args) => this.recordSkillFeedback(...args),
      previewMigration: path => this.previewMigration(path), applyMigration: id => this.applyMigration(id), rollbackMigration: id => this.rollbackMigration(id),
    }
  }
  dispose(): void { this.disposed = true; this.generation++; this.selection++; this.searchGeneration++ }
  private patch(value: Partial<MemorySettingsSnapshot>): void { if (!this.disposed) this.store.set({ ...this.store.getSnapshot(), ...value }) }
  private async resolveSources(value: MemoryDescribeValue, generation: number): Promise<void> {
    const sources = new Map([...value.memory.entries, ...value.user.entries].flatMap(entry => entry.source?.sessionId ? [[sourceKey(entry.source), entry.source] as const] : []))
    const resolved: Record<string, MemorySourceResolution> = {}
    for (const [key, source] of sources) {
      if (generation !== this.generation || this.disposed) return
      try { resolved[key] = unwrap(await this.remote.resolveSource({ ...source, sessionId: source.sessionId! })) }
      catch { resolved[key] = { source, status: 'unavailable' } }
    }
    if (generation === this.generation) this.patch({ sources: resolved })
  }
  async load(internal = false): Promise<void> {
    const state = this.store.getSnapshot()
    if (state.loading || (state.pending && !internal)) return
    const generation = ++this.generation
    this.patch({ loading: true, error: undefined, skillError: undefined })
    const [memory, skills, candidates, migrations] = await Promise.allSettled([
      this.remote.describe().then(unwrap), this.remote.listSkills().then(unwrap), this.remote.listCuratorCandidates().then(unwrap), this.remote.listMigrationPlans().then(unwrap),
    ])
    if (generation !== this.generation || this.disposed) return
    this.patch({ loading: false,
      ...(memory.status === 'fulfilled' ? { value: memory.value } : { error: message(memory.reason) }),
      ...(skills.status === 'fulfilled' ? { skills: skills.value } : { skillError: message(skills.reason) }),
      ...(candidates.status === 'fulfilled' ? { candidates: candidates.value } : { error: message(candidates.reason) }),
      ...(migrations.status === 'fulfilled' ? { migrations: migrations.value } : { error: message(migrations.reason) }),
    })
    const selected = this.store.getSnapshot().selectedSkill
    if (skills.status === 'fulfilled' && selected !== undefined) {
      if (skills.value.some(skill => skill.name === selected.name)) await this.selectSkill(selected.name)
      else { this.selection++; this.patch({ selectedSkill: undefined }) }
    }
    if (memory.status === 'fulfilled') await this.resolveSources(memory.value, generation)
  }
  private async operation(action: () => Promise<void>): Promise<boolean> {
    if (this.store.getSnapshot().pending || this.store.getSnapshot().loading) return false
    this.patch({ pending: true, error: undefined })
    try { await action(); return true }
    catch (error) { this.patch({ error: message(error) }); return false }
    finally { this.patch({ pending: false }) }
  }
  async mutate(target: MemoryTarget, action: 'add' | 'replace' | 'remove', content?: string, oldText?: string): Promise<boolean> {
    return this.operation(async () => {
      const updated = unwrap(await this.remote.mutate(target, action, content, oldText))
      const current = this.store.getSnapshot().value
      if (current === undefined) return
      const value = { ...current, [target]: updated }
      this.searchGeneration++
      this.patch({ value, results: undefined })
      await this.resolveSources(value, ++this.generation)
    })
  }
  async search(query: string, target: MemoryTarget): Promise<void> {
    const generation = ++this.searchGeneration
    if (!query.trim()) { this.patch({ results: undefined }); return }
    try { const results = unwrap(await this.remote.search(query, target)); if (generation === this.searchGeneration) this.patch({ results, error: undefined }) }
    catch (error) { if (generation === this.searchGeneration) this.patch({ error: message(error) }) }
  }
  async selectSkill(name: string): Promise<void> {
    const generation = ++this.selection
    this.patch({ selectedSkill: undefined, error: undefined })
    try { const selectedSkill = unwrap(await this.remote.getSkill(name)); if (generation === this.selection) this.patch({ selectedSkill }) }
    catch (error) { if (generation === this.selection) this.patch({ error: message(error) }) }
  }
  async saveSkill(name: string, description: string, content: string, revision: string | null): Promise<boolean> {
    return this.operation(async () => {
      const selectedSkill = unwrap(await this.remote.saveSkill(name, description, content, revision))
      this.patch({ selectedSkill, skills: [...this.store.getSnapshot().skills.filter(skill => skill.name !== name), selectedSkill].sort((a, b) => a.name.localeCompare(b.name)) })
    })
  }
  async removeSkill(name: string, revision: string): Promise<boolean> {
    return this.operation(async () => { unwrap(await this.remote.removeSkill(name, revision)); this.patch({ selectedSkill: undefined, skills: this.store.getSnapshot().skills.filter(skill => skill.name !== name) }) })
  }
  async reviewSkill(id: string, decision: 'approve' | 'reject' | 'archive' | 'restore', note?: string): Promise<boolean> {
    return this.operation(async () => {
      const updated = unwrap(await this.remote.reviewSkill(id, decision, note))
      this.patch({ candidates: this.store.getSnapshot().candidates.map(item => item.id === id ? updated : item) })
      if (decision !== 'reject') await this.load(true)
    })
  }
  async recordSkillFeedback(name: string, outcome: 'success' | 'failure' | 'neutral', note?: string, revision?: string): Promise<boolean> {
    return this.operation(async () => { unwrap(await this.remote.recordSkillFeedback(name, outcome, note, revision)); await this.load(true) })
  }
  async previewMigration(path: string): Promise<boolean> {
    return this.operation(async () => { const plan = unwrap(await this.remote.previewMigration(path)); this.patch({ migrations: [plan, ...this.store.getSnapshot().migrations.filter(item => item.id !== plan.id)] }) })
  }
  async applyMigration(id: string): Promise<boolean> {
    return this.operation(async () => { const plan = unwrap(await this.remote.applyMigration(id)); this.patch({ migrations: this.store.getSnapshot().migrations.map(item => item.id === id ? plan : item) }); await this.load(true) })
  }
  async rollbackMigration(id: string): Promise<boolean> {
    return this.operation(async () => { const plan = unwrap(await this.remote.rollbackMigration(id)); this.patch({ migrations: this.store.getSnapshot().migrations.map(item => item.id === id ? plan : item) }); await this.load(true) })
  }
}
function message(error: unknown): string { return error instanceof Error ? error.message : String(error) }
function unwrap<T>(result: { readonly ok: true; readonly value: T } | { readonly ok: false; readonly error: { readonly message: string } }): T { if (result.ok) return result.value; throw new Error(result.error.message) }
