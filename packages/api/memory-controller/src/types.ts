/** Browser-safe payloads for the memory/skills management Remote. */

export type MemoryTarget = 'memory' | 'user'

export interface MemorySourceView {
  readonly sessionId?: string
  readonly eventSeq?: number
  readonly workspace?: string
  readonly createdAt: string
}

export interface MemorySourceRequest extends MemorySourceView {
  readonly sessionId: string
}

export interface MemorySourceSessionView {
  readonly id: string
  readonly title?: string
  readonly cwd?: string
  readonly live: boolean
  readonly persisted: boolean
}

export interface MemorySourceEventView {
  readonly seq: number
  readonly type: string
  readonly time: number
  readonly snippet?: string
  readonly available: boolean
}

export interface MemorySourceResolution {
  readonly status: 'available' | 'session-missing' | 'event-missing' | 'unavailable' | 'workspace-mismatch'
  readonly source: MemorySourceView
  readonly session?: MemorySourceSessionView
  readonly event?: MemorySourceEventView
}

export interface MemoryEntryView {
  readonly text: string
  readonly source?: MemorySourceView
}

export interface MemorySnapshotView {
  readonly target: MemoryTarget
  readonly entries: readonly MemoryEntryView[]
  readonly provider: string
  readonly charLimit: number
  readonly charCount: number
}

export interface MemorySearchHitView {
  readonly target: MemoryTarget
  readonly index: number
  readonly entry: string
  readonly score: number
  readonly source?: MemorySourceView
}

export interface MemoryDescribeValue {
  readonly provider: string
  readonly memory: MemorySnapshotView
  readonly user: MemorySnapshotView
}

export interface MemoryCuratorCandidate {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly content: string
  readonly status: 'pending' | 'approved' | 'rejected' | 'archived'
  readonly source?: { readonly sessionId?: string; readonly eventSeq?: number; readonly workspace?: string; readonly reason?: string }
  readonly baseRevision?: string
  readonly activeRevision?: string
  readonly activeContent?: string
  readonly reviewerNote?: string
  readonly createdAt: string
  readonly updatedAt: string
  readonly feedback: { readonly uses: number; readonly successes: number; readonly failures: number; readonly lastOutcome?: 'success' | 'failure' | 'neutral' }
}

export interface MemoryMigrationPlan {
  readonly id: string
  readonly path: string
  readonly format: string
  readonly fingerprint: string
  readonly entries: readonly { readonly target: MemoryTarget; readonly text: string; readonly source?: { readonly legacyKey?: string } }[]
  readonly skipped: readonly string[]
  readonly status: 'preview' | 'applying' | 'applied' | 'rollback-in-progress' | 'rolled-back'
  readonly createdAt: string
  readonly updatedAt: string
}

export interface MemorySkillSummary {
  readonly name: string
  readonly description: string
  readonly source: string
  readonly path?: string
  readonly whenToUse?: string
  readonly writable: boolean
  readonly modelInvocable: boolean
  readonly userInvocable: boolean
}

export interface MemorySkillValue extends MemorySkillSummary {
  readonly content: string
  readonly revision?: string
  readonly resourceBase?: { readonly kind: 'directory' | 'url' | 'opaque'; readonly path?: string; readonly url?: string; readonly description?: string }
}
