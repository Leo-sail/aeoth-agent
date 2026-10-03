/** Host Remote owner for MEMORY/USER and installed-skill management. */

import { join, resolve } from 'node:path'
import { resolveAeothHome } from '@deepseek-ai/dsh-home-paths'
import { ManagedSkills } from './skills.ts'
import type {} from '@deepseek-ai/dsh-skill-curator'
import type {} from '@deepseek-ai/dsh-memory-migration'
import { Context } from '@deepseek-ai/cordis'
import type { MemoryRuntime, MemorySearchHit, MemorySnapshot, MemorySource } from '@deepseek-ai/dsh-memory'
import { SessionId, SessionSeq } from '@deepseek-ai/dsh-session'
import { extractSessionEventText, SessionQueryError } from '@deepseek-ai/dsh-session-query'
import { isModelInvocable, isUserInvocable } from '@deepseek-ai/dsh-skill'
import type { SkillDefinition, SkillSummary } from '@deepseek-ai/dsh-skill'
import { Remote, RemoteError, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol'
import type { MemoryCuratorCandidate, MemoryMigrationPlan, MemoryDescribeValue, MemorySearchHitView, MemorySkillSummary, MemorySkillValue, MemorySnapshotView, MemorySourceRequest, MemorySourceResolution, MemorySourceView, MemoryTarget as RemoteMemoryTarget } from './types.ts'

export type * from './types.ts'

export const name = 'memory-controller'
export const inject = ['memories', 'sessionQuery', 'skills', 'skillCurator', 'memoryMigration']

declare module '@deepseek-ai/cordis' {
  interface Context {
    memoryController: MemoryController
  }
}

export class MemoryController extends TypertRemoteService {
  static inject = ['typert', ...inject]
  private readonly managed: ManagedSkills
  constructor(ctx: Context) {
    super(ctx, 'memoryController', { namespace: 'memory' })
    const profile = ctx.get('profileContext') as { dir?: string } | undefined
    this.managed = new ManagedSkills(join(profile?.dir ?? resolveAeothHome(), 'skills'))
  }

  @Remote
  async describe(): Promise<MemoryDescribeValue> {
    const memories = this.requireMemories()
    const memory = await memories.read('memory')
    const user = await memories.read('user')
    return { provider: memories.providerName, memory: snapshotView(memory), user: snapshotView(user) }
  }

  @Remote
  async mutate(
    target: RemoteMemoryTarget,
    action: 'add' | 'replace' | 'remove',
    content: string | undefined,
    oldText: string | undefined,
  ): Promise<MemorySnapshotView> {
    const memories = this.requireMemories()
    try {
      const result = await memories.mutate(target, action, content, oldText)
      return snapshotView(result.snapshot)
    } catch (error) {
      throw new RemoteError('gateway/bad-request', error instanceof Error ? error.message : String(error), {})
    }
  }

  @Remote
  async replaceDocument(target: RemoteMemoryTarget, entries: readonly (string | { readonly text: string; readonly source?: { readonly sessionId?: string; readonly eventSeq?: number; readonly workspace?: string; readonly createdAt: string } })[]): Promise<MemorySnapshotView> {
    try {
      return snapshotView(await this.requireMemories().replaceDocument(target, entries))
    } catch (error) {
      throw new RemoteError('gateway/bad-request', error instanceof Error ? error.message : String(error), {})
    }
  }

  @Remote
  async search(query: string, target: RemoteMemoryTarget | undefined): Promise<readonly MemorySearchHitView[]> {
    try {
      return (await this.requireMemories().search(query, target, undefined)).map(searchHitView)
    } catch (error) {
      throw new RemoteError('gateway/bad-request', error instanceof Error ? error.message : String(error), {})
    }
  }

  @Remote
  async resolveSource(source: MemorySourceRequest): Promise<MemorySourceResolution> {
    if (!source.sessionId || source.sessionId.length > 256 || /[\x00-\x1f]/u.test(source.sessionId)
      || (source.eventSeq !== undefined && (!Number.isSafeInteger(source.eventSeq) || source.eventSeq < 0))) {
      throw new RemoteError('gateway/bad-request', 'Invalid memory source session or event sequence.', {})
    }
    const query = this.ctx.get('sessionQuery')
    if (query === undefined) return { source, status: 'unavailable' }
    const sessionId = SessionId(source.sessionId)
    try {
      const record = (await query.listSessions()).find(item => item.header.id === sessionId)
      if (record === undefined) return { source, status: 'session-missing' }
      if (source.workspace !== undefined && (record.header.cwd === undefined || resolve(record.header.cwd) !== resolve(source.workspace))) {
        return { source, status: 'workspace-mismatch' }
      }
      const title = (await query.readTitleSnapshot(sessionId)).title?.title
      const session = {
        id: String(record.header.id), ...(title === undefined ? {} : { title }),
        ...(record.header.cwd === undefined ? {} : { cwd: record.header.cwd }),
        live: record.live, persisted: record.persisted,
      }
      if (source.eventSeq === undefined) return { source, session, status: 'available' }
      try {
        const { target } = await query.readEvent({ sessionId, seq: SessionSeq(source.eventSeq), before: 0, after: 0 })
        const snippet = extractSessionEventText(target).trim().slice(0, 600)
        return { source, session, status: 'available', event: {
          seq: Number(target.seq), type: target.type, time: target.time, available: true,
          ...(snippet === '' ? {} : { snippet }),
        } }
      } catch (error) {
        if (error instanceof SessionQueryError && error.code === 'SESSION_QUERY_EVENT_NOT_FOUND') {
          return { source, session, status: 'event-missing' }
        }
        throw error
      }
    } catch (error) {
      return { source, status: error instanceof SessionQueryError && error.code === 'SESSION_QUERY_SESSION_NOT_FOUND'
        ? 'session-missing' : 'unavailable' }
    }
  }

  @Remote
  async listCuratorCandidates(): Promise<readonly MemoryCuratorCandidate[]> {
    const curator = this.ctx.get('skillCurator')
    if (curator === undefined) throw new RemoteError('gateway/internal', 'skill curator is absent', {})
    return curator.list()
  }

  @Remote
  async reviewSkill(id: string, decision: 'approve' | 'reject' | 'archive' | 'restore', note?: string): Promise<MemoryCuratorCandidate> {
    const curator = this.ctx.get('skillCurator')
    if (curator === undefined) throw new RemoteError('gateway/internal', 'skill curator is absent', {})
    try { await curator.review(id, decision, note); const item = (await curator.list()).find(candidate => candidate.id === id); if (item === undefined) throw new Error('curator candidate disappeared'); return item } catch (error) { throw new RemoteError('gateway/bad-request', String(error), {}) }
  }

  @Remote
  async recordSkillFeedback(name: string, outcome: 'success' | 'failure' | 'neutral', note?: string, revision?: string): Promise<void> {
    const curator = this.ctx.get('skillCurator')
    if (curator === undefined) throw new RemoteError('gateway/internal', 'skill curator is absent', {})
    try { await curator.feedback({ name, outcome, ...(note === undefined ? {} : { note }), ...(revision === undefined ? {} : { revision }) }) } catch (error) { throw new RemoteError('gateway/bad-request', String(error), {}) }
  }

  @Remote
  async listMigrationPlans(): Promise<readonly MemoryMigrationPlan[]> {
    const migration = this.ctx.get('memoryMigration')
    if (migration === undefined) throw new RemoteError('gateway/internal', 'memory migration service is absent', {})
    return migration.list()
  }

  @Remote
  async previewMigration(path: string): Promise<MemoryMigrationPlan> {
    const migration = this.ctx.get('memoryMigration')
    if (migration === undefined) throw new RemoteError('gateway/internal', 'memory migration service is absent', {})
    try { return await migration.preview(path) } catch (error) { throw new RemoteError('gateway/bad-request', String(error), {}) }
  }

  @Remote
  async applyMigration(id: string): Promise<MemoryMigrationPlan> {
    const migration = this.ctx.get('memoryMigration')
    if (migration === undefined) throw new RemoteError('gateway/internal', 'memory migration service is absent', {})
    try { return await migration.apply(id) } catch (error) { throw new RemoteError('gateway/bad-request', String(error), {}) }
  }

  @Remote
  async rollbackMigration(id: string): Promise<MemoryMigrationPlan> {
    const migration = this.ctx.get('memoryMigration')
    if (migration === undefined) throw new RemoteError('gateway/internal', 'memory migration service is absent', {})
    try { return await migration.rollback(id) } catch (error) { throw new RemoteError('gateway/bad-request', String(error), {}) }
  }

  @Remote
  async listSkills(): Promise<readonly MemorySkillSummary[]> {
    const skills = await this.requireSkills().list({ cwd: process.cwd() })
    const managed = await this.managed.list()
    const byName = new Map(managed.map(skill => [skill.name, skillSummary(skill)]))
    for (const skill of skills) {
      byName.set(skill.name, { ...skillSummary(skill), writable: skill.path === this.managed.path(skill.name) })
    }
    return [...byName.values()].sort((a, b) => a.name.localeCompare(b.name))
  }

  @Remote
  async getSkill(name: string): Promise<MemorySkillValue> {
    const summary = (await this.listSkills()).find(skill => skill.name === name)
    if (summary === undefined) throw new RemoteError('gateway/bad-request', `skill '${name}' was not found`, {})
    if (summary.writable) {
      const value = await this.managed.read(name)
      if (value !== undefined) return value
    }
    const skill = await this.requireSkills().get(name, { cwd: process.cwd() })
    if (skill === undefined) throw new RemoteError('gateway/bad-request', `skill '${name}' could not be loaded`, {})
    return { ...summary, content: skill.content }
  }

  @Remote
  async saveSkill(name: string, description: string, content: string, expectedRevision: string | null): Promise<MemorySkillValue> {
    try {
      const existing = (await this.listSkills()).find(skill => skill.name === name)
      if (existing !== undefined && !existing.writable) throw new Error('This skill is owned by another provider and is read-only.')
      return await this.managed.save(name, description, content, expectedRevision)
    } catch (error) { throw new RemoteError('gateway/bad-request', String(error), {}) }
  }

  @Remote
  async removeSkill(name: string, expectedRevision: string): Promise<void> {
    try {
      const skill = await this.getSkill(name)
      if (!skill.writable) throw new Error('This skill is read-only.')
      await this.managed.remove(name, expectedRevision)
    } catch (error) { throw new RemoteError('gateway/bad-request', String(error), {}) }
  }

  private requireMemories(): MemoryRuntime {
    const memories = this.ctx.get('memories')
    if (memories === undefined) throw new RemoteError('gateway/internal', 'memory service is absent', {})
    return memories
  }

  private requireSkills() {
    const skills = this.ctx.get('skills')
    if (skills === undefined) throw new RemoteError('gateway/internal', 'skill registry is absent', {})
    return skills
  }
}

function sourceView(source: MemorySource | undefined): MemorySourceView | undefined { return source === undefined ? undefined : { ...source } }
function snapshotView(snapshot: MemorySnapshot): MemorySnapshotView {
  return { target: snapshot.target, entries: snapshot.entries.map(entry => { const source = sourceView(entry.source); return { text: entry.text, ...source === undefined ? {} : { source } } }), provider: snapshot.provider, charLimit: snapshot.charLimit, charCount: snapshot.charCount }
}
function searchHitView(hit: MemorySearchHit): MemorySearchHitView {
  const source = sourceView(hit.source); return { target: hit.target, index: hit.index, entry: hit.entry, score: hit.score, ...source === undefined ? {} : { source } }
}

function skillSummary(skill: SkillSummary | SkillDefinition | MemorySkillValue): MemorySkillSummary {
  return {
    name: skill.name,
    description: skill.description,
    source: skill.source,
    ...skill.path === undefined ? {} : { path: skill.path },
    ...skill.whenToUse === undefined ? {} : { whenToUse: skill.whenToUse },
    writable: 'writable' in skill ? skill.writable : false,
    modelInvocable: 'modelInvocable' in skill ? skill.modelInvocable : isModelInvocable(skill),
    userInvocable: 'userInvocable' in skill ? skill.userInvocable : isUserInvocable(skill),
  }
}

export default MemoryController

