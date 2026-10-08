import { useEffect, useState } from 'react'
import { Button, Input } from '@deepseek-ai/dsh-client-ui-primitives'
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { SessionTarget } from '@deepseek-ai/dsh-api-session-controller/client'
import type { MemoryCuratorCandidate, MemoryMigrationPlan } from '@deepseek-ai/dsh-api-remotes/client'
import type { MemorySettingsFace, MemorySettingsSnapshot } from './controller.ts'
import { sourceKey } from './controller.ts'
import type { MemorySettingsLocaleKey } from './locales.ts'
import css from './MemoryCard.module.css'

type MemoryTarget = 'memory' | 'user'
type Translator = (key: MemorySettingsLocaleKey, vars?: Record<string, string>) => string

export interface MemoryCardFace extends MemorySettingsFace { openSession: (target: SessionTarget) => void }
export type MemoryCardProps = PropsRuntime<'plugins.item'> & PropsLocale<'settings.memory'> & InjectFace<MemoryCardFace>

export function MemoryCard(props: MemoryCardProps) {
  const state = props.useMemorySettings(snapshot => snapshot)
  useEffect(() => { void props.load() }, [props.load])
  if (props.view === 'summary') return props.t('description')
  if (state.loading && state.value === undefined) return <p>{props.t('loading')}</p>
  return <MemoryPanel {...props} state={state} />
}

function MemoryPanel({ t, state, ...props }: MemoryCardProps & { state: MemorySettingsSnapshot }) {
  const [tab, setTab] = useState<MemoryTarget | 'skills' | 'review' | 'migration'>('memory')
  const [query, setQuery] = useState('')
  const [draft, setDraft] = useState('')
  const target = tab === 'skills' || tab === 'review' || tab === 'migration' ? 'memory' : tab
  const entries = state.value?.[target].entries ?? []
  const submit = async () => { const text = draft.trim(); if (!text) return; if (await props.mutate(target, 'add', text)) setDraft('') }
  const runSearch = () => { void props.search(query, target) }
  const tabs = ['memory', 'user', 'skills', 'review', 'migration'] as const
  return <section className={css.card} aria-busy={state.pending || state.loading}>
    {state.error && <p role="alert" className={css.error}>{state.error}</p>}
    <div className={css.tabs} role="tablist">{tabs.map(value => <button key={value} className={css.tab} data-active={tab === value ? 'true' : undefined} type="button" role="tab" aria-selected={tab === value} onClick={() => { setTab(value); setQuery('') }}>{t(value)}</button>)}</div>
    {tab === 'skills' ? <Skills t={t} state={state} {...props} />
      : tab === 'review' ? <Curator t={t} state={state} {...props} />
        : tab === 'migration' ? <Migration t={t} state={state} {...props} />
          : <MemoryStore t={t} state={state} target={target} entries={entries} query={query} setQuery={setQuery} draft={draft} setDraft={setDraft} submit={submit} runSearch={runSearch} {...props} />}
  </section>
}

function MemoryStore({ t, state, target, entries, query, setQuery, draft, setDraft, submit, runSearch, ...props }: MemoryCardProps & { state: MemorySettingsSnapshot; target: MemoryTarget; entries: readonly { text: string; source?: { sessionId?: string; eventSeq?: number; workspace?: string; createdAt: string } }[]; query: string; setQuery: (value: string) => void; draft: string; setDraft: (value: string) => void; submit: () => Promise<void>; runSearch: () => void }) {
  const snapshot = state.value?.[target]
  const hasResults = state.results !== undefined && query.trim() !== ''
  return <div className={css.store}>
    <p className={css.hint}>{t(target === 'memory' ? 'memoryHint' : 'userHint')}</p>
    <div className={css.search}><Input aria-label={t('search')} value={query} placeholder={t('searchPlaceholder')} onChange={event => setQuery(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') runSearch() }} /><Button size="sm" variant="outline" disabled={state.pending} onClick={runSearch}>{t('search')}</Button></div>
    {hasResults ? <div className={css.entries}>{state.results!.length === 0 ? <p>{t('empty')}</p> : state.results!.map(hit => <div className={css.entry} key={`${hit.target}-${hit.index}`}><div className={css.entryText}>{hit.entry}</div><div className={css.meta}>{hit.score.toFixed(2)}</div></div>)}</div>
      : <div className={css.entries}>{entries.length === 0 ? <p>{t('empty')}</p> : entries.map((entry, index) => <MemoryEntry key={`${entry.text}-${index}`} t={t} busy={state.pending} entry={entry} onOpen={props.openSession} onRemove={() => { void props.mutate(target, 'remove', undefined, entry.text) }} onReplace={(oldText, newText) => props.mutate(target, 'replace', newText, oldText)} {...(entry.source?.sessionId && state.sources[sourceKey(entry.source)] ? { resolution: state.sources[sourceKey(entry.source)] } : {})} />)}</div>}
    <div className={css.add}><textarea className={css.input} value={draft} placeholder={t('addPlaceholder')} aria-label={t('entry')} onChange={event => setDraft(event.target.value)} /><Button disabled={state.pending || !draft.trim()} onClick={() => { void submit() }}>{t('add')}</Button></div>
    {snapshot && <div className={css.meta}>{t('capacity', { used: String(snapshot.charCount), limit: String(snapshot.charLimit) })}</div>}
  </div>
}

function MemoryEntry({ t, busy, entry, resolution, onOpen, onRemove, onReplace }: { t: Translator; busy: boolean; entry: { text: string; source?: { sessionId?: string; eventSeq?: number } }; resolution?: { status: string; session?: { id: string; title?: string }; event?: { snippet?: string } }; onOpen: (id: SessionTarget) => void; onRemove: () => void; onReplace: (oldText: string, newText: string) => Promise<boolean> }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(entry.text)
  const label = resolution?.session?.title ?? resolution?.session?.id
  const source = entry.source?.sessionId === undefined ? t('noSource') : resolution?.status === 'event-missing' ? t('eventMissing') : resolution?.status === 'session-missing' ? t('missing') : resolution?.status === 'unavailable' ? t('unavailable') : `${t('source')}: ${label ?? entry.source.sessionId}${entry.source.eventSeq === undefined ? '' : ` · ${t('event', { seq: String(entry.source.eventSeq) })}`}`
  if (editing) return <div className={css.entry}><textarea className={css.input} value={draft} aria-label={t('entry')} onChange={event => setDraft(event.target.value)} /><div className={css.actions}><Button size="sm" disabled={busy || !draft.trim()} onClick={async () => { if (await onReplace(entry.text, draft.trim())) setEditing(false) }}>{t('save')}</Button><Button size="sm" variant="ghost" disabled={busy} onClick={() => { setDraft(entry.text); setEditing(false) }}>{t('cancel')}</Button></div></div>
  return <div className={css.entry}><div><div className={css.entryText}>{entry.text}</div><div className={css.meta}>{entry.source?.sessionId && resolution?.session?.id ? <button className={css.sourceButton} type="button" disabled={busy} onClick={() => onOpen(entry.source!.sessionId as SessionTarget)}>{source}</button> : source}</div>{resolution?.event?.snippet && <div className={css.snippet}>{resolution.event.snippet}</div>}</div><div className={css.actions}><Button size="sm" variant="ghost" disabled={busy} onClick={() => setEditing(true)}>{t('edit')}</Button><Button size="sm" variant="ghost" disabled={busy} onClick={onRemove}>{t('remove')}</Button></div></div>
}

function Skills({ t, state, ...props }: MemoryCardProps & { state: MemorySettingsSnapshot }) {
  const [filter, setFilter] = useState(''); const [editing, setEditing] = useState(false); const [name, setName] = useState(''); const [description, setDescription] = useState(''); const [content, setContent] = useState('')
  const visible = state.skills.filter(skill => skill.name.includes(filter) || skill.description.toLowerCase().includes(filter.toLowerCase()))
  const selected = state.selectedSkill
  const beginNew = () => { setName(''); setDescription(''); setContent(''); setEditing(true) }
  const beginEdit = () => { if (!selected?.writable) return; setName(selected.name); setDescription(selected.description); setContent(selected.content); setEditing(true) }
  const save = async () => { if (await props.saveSkill(name, description, content, selected?.name === name ? selected.revision ?? null : null)) setEditing(false) }
  return <div className={css.skillLayout}><aside className={css.skillList}><div className={css.skillActions}><Input aria-label={t('skillSearch')} value={filter} placeholder={t('skillSearch')} onChange={event => setFilter(event.target.value)} /><Button size="sm" onClick={beginNew}>{t('newSkill')}</Button></div>{visible.map(skill => <button key={skill.name} type="button" className={css.skillItem} data-active={selected?.name === skill.name ? 'true' : undefined} onClick={() => { void props.selectSkill(skill.name) }}>{skill.name}<small>{skill.writable ? t('owned') : t('readonly')}</small></button>)}</aside><div className={css.skillBody}>{editing ? <div className={css.editor}><Input aria-label={t('skillName')} value={name} placeholder={t('skillName')} onChange={event => setName(event.target.value)} /><Input aria-label={t('skillDescription')} value={description} placeholder={t('skillDescription')} onChange={event => setDescription(event.target.value)} /><textarea className={css.input} aria-label={t('skillContent')} value={content} placeholder={t('skillContent')} onChange={event => setContent(event.target.value)} /><div className={css.actions}><Button onClick={() => { void save() }}>{t('save')}</Button><Button variant="ghost" onClick={() => setEditing(false)}>{t('cancel')}</Button></div></div> : selected ? <><div className={css.skillHeading}><div><h3>{selected.name}</h3><p>{selected.description}</p></div><div className={css.actions}>{selected.writable && <Button size="sm" onClick={beginEdit}>{t('edit')}</Button>}{selected.writable && <Button size="sm" variant="ghost" onClick={() => { if (selected.revision) void props.removeSkill(selected.name, selected.revision) }}>{t('remove')}</Button>}</div></div><pre className={css.skillContent}>{selected.content}</pre></> : <p>{t('skillPlaceholder')}</p>}</div></div>
}

function Curator({ t, state, ...props }: MemoryCardProps & { state: MemorySettingsSnapshot }) {
  return <div className={css.review}><p className={css.hint}>{t('reviewHint')}</p>{state.candidates.length === 0 ? <p>{t('empty')}</p> : state.candidates.map(candidate => <CuratorCandidate key={candidate.id} t={t} busy={state.pending} candidate={candidate} {...props} />)}</div>
}
function CuratorCandidate({ t, busy, candidate, ...props }: MemoryCardProps & { t: Translator; busy: boolean; candidate: MemoryCuratorCandidate }) {
  const [note, setNote] = useState('')
  const approve = candidate.status === 'pending' || candidate.status === 'rejected'
  const archive = candidate.status === 'approved'
  const restore = candidate.status === 'archived'
  const source = candidate.source?.sessionId === undefined ? undefined : `${t('openSource')}${candidate.source.eventSeq === undefined ? '' : ` · ${t('event', { seq: String(candidate.source.eventSeq) })}`}`
  const revision = (value: string | undefined) => value === undefined ? undefined : value.slice(0, 12)
  return <article className={css.candidate}>
    <div className={css.skillHeading}><div><h3>{candidate.name}</h3><p>{candidate.description}</p></div><span className={css.badge}>{candidate.status}</span></div>
    <pre className={css.skillContent}>{candidate.content}</pre>
    {candidate.source && <div className={css.meta}>{source && <button className={css.sourceButton} type="button" disabled={busy} onClick={() => props.openSession(candidate.source!.sessionId as SessionTarget)}>{source}</button>}{candidate.source.workspace && <span>{t('workspace')}: {candidate.source.workspace}</span>}{candidate.source.reason && <span>{t('evidence')}: {candidate.source.reason}</span>}</div>}
    {(candidate.baseRevision || candidate.activeRevision) && <div className={css.meta}>{candidate.baseRevision && <span>{t('baseRevision')}: {revision(candidate.baseRevision)}</span>}{candidate.activeRevision && <span>{t('activeRevision')}: {revision(candidate.activeRevision)}</span>}</div>}
    {candidate.activeContent && <details className={css.comparison}><summary>{t('activeVersion')}</summary><div className={css.comparisonGrid}><div><div className={css.meta}>{t('proposedVersion')}</div><pre className={css.skillContent}>{candidate.content}</pre></div><div><div className={css.meta}>{t('activeVersion')}</div><pre className={css.skillContent}>{candidate.activeContent}</pre></div></div></details>}
    <Input disabled={busy} aria-label={t('reviewNote')} placeholder={t('reviewNote')} value={note} onChange={event => setNote(event.target.value)} />
    <div className={css.actions}>{approve && <Button size="sm" disabled={busy} onClick={() => { void props.reviewSkill(candidate.id, 'approve', note || undefined) }}>{t('approve')}</Button>}{candidate.status === 'pending' && <Button size="sm" variant="outline" disabled={busy} onClick={() => { void props.reviewSkill(candidate.id, 'reject', note || undefined) }}>{t('reject')}</Button>}{archive && <Button size="sm" variant="outline" disabled={busy} onClick={() => { void props.reviewSkill(candidate.id, 'archive', note || undefined) }}>{t('archive')}</Button>}{restore && <Button size="sm" disabled={busy} onClick={() => { void props.reviewSkill(candidate.id, 'restore', note || undefined) }}>{t('restore')}</Button>}{candidate.status === 'approved' && <><Button size="sm" variant="ghost" disabled={busy} onClick={() => { void props.recordSkillFeedback(candidate.name, 'success', note || undefined, candidate.activeRevision) }}>{t('success')}</Button><Button size="sm" variant="ghost" disabled={busy} onClick={() => { void props.recordSkillFeedback(candidate.name, 'failure', note || undefined, candidate.activeRevision) }}>{t('failure')}</Button></>}</div>
    <div className={css.meta}>{t('feedbackSummary', { uses: String(candidate.feedback.uses), successes: String(candidate.feedback.successes), failures: String(candidate.feedback.failures) })}</div>
  </article>
}

function Migration({ t, state, ...props }: MemoryCardProps & { state: MemorySettingsSnapshot }) {
  const [path, setPath] = useState('')
  return <div className={css.migration}><p className={css.hint}>{t('migrationHint')}</p><div className={css.search}><Input aria-label={t('migrationPath')} value={path} placeholder={t('migrationPath')} onChange={event => setPath(event.target.value)} /><Button size="sm" disabled={state.pending || !path.trim()} onClick={() => { void props.previewMigration(path.trim()) }}>{t('preview')}</Button></div>{state.migrations.length === 0 ? <p>{t('empty')}</p> : state.migrations.map(plan => <MigrationPlan key={plan.id} t={t} busy={state.pending} plan={plan} {...props} />)}</div>
}
function MigrationPlan({ t, busy, plan, ...props }: MemoryCardProps & { t: Translator; busy: boolean; plan: MemoryMigrationPlan }) {
  const recoverable = plan.status === 'applied' || plan.status === 'applying' || plan.status === 'rollback-in-progress'
  const apply = () => { if (window.confirm(t('confirmApply'))) void props.applyMigration(plan.id) }
  const rollback = () => { if (window.confirm(t('confirmRollback'))) void props.rollbackMigration(plan.id) }
  return <article className={css.candidate}><div className={css.skillHeading}><div><h3>{plan.format}</h3><p className={css.meta}>{plan.path}</p></div><span className={css.badge}>{plan.status}</span></div><p>{t('migrationEntries', { count: String(plan.entries.length), skipped: String(plan.skipped.length) })}</p>{plan.entries.length > 0 && <ul className={css.migrationEntries}>{plan.entries.map((entry, index) => <li key={`${entry.target}-${index}`}><span className={css.badge}>{entry.target}</span> {entry.text}</li>)}</ul>}{plan.skipped.length > 0 && <p className={css.meta}>{t('migrationSkipped')}: {plan.skipped.join(', ')}</p>}<div className={css.actions}>{plan.status === 'preview' && <Button size="sm" disabled={busy} onClick={apply}>{t('apply')}</Button>}{recoverable && <Button size="sm" variant="outline" disabled={busy} onClick={rollback}>{t('rollback')}</Button>}</div></article>
}
