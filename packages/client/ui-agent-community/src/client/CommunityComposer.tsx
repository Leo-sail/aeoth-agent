import { useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { Button, IconPlusOutlineMedium, IconSendOutlineRegular, IconStopFillMedium } from '@deepseek-ai/dsh-client-ui-primitives'
import type { BotIdentity, BotRoom } from '@deepseek-ai/dsh-agent-community/types'
import { ComposerSurface } from '@deepseek-ai/dsh-client-ui-conversation/client'
import css from './page.module.css'

type MenuMode = 'plus' | 'slash' | 'mention' | undefined

// Fallback only for a cold/temporarily unavailable Session command catalog.
// Keep this list limited to commands mounted by the shipped standard preset;
// advertising a command that Host cannot execute turns a valid UI suggestion
// into a durable failed Run. Remote descriptors still win and deduplicate.
const SLASH_COMMANDS = [
  { name: 'memory', detail: 'Manage durable memory' },
  { name: 'learn', detail: 'Record a reusable learning' },
  { name: 'plan', detail: 'Work through a plan' },
] as const

export interface CommunityComposerReference {
  readonly key: string
  readonly label: string
  readonly detail: string
  readonly insert: string
}

export interface CommunityComposerCopy {
  readonly placeholder: string
  readonly plus: string
  readonly file: string
  readonly conversation: string
  readonly commands: string
  readonly mentions: string
  readonly noSuggestions: string
  readonly send: string
}

export interface CommunityComposerProps {
  readonly value: string
  readonly disabled: boolean
  readonly running?: boolean
  readonly onStop?: (() => void) | undefined
  readonly copy: CommunityComposerCopy
  readonly agents: readonly BotIdentity[]
  readonly rooms: readonly BotRoom[]
  readonly sessionId?: string | undefined
  readonly lookupReferences?: ((query: string, signal: AbortSignal) => Promise<readonly CommunityComposerReference[]>) | undefined
  readonly lookupCommands?: ((signal: AbortSignal) => Promise<readonly { readonly name: string; readonly description: string }[]>) | undefined
  readonly onChange: (value: string) => void
  readonly onSubmit: () => void
}

/**
 * Community-owned adapter of Aeoth's composer affordances. It keeps the same
 * trigger grammar (+, /, @) while the submit target remains the durable room
 * queue rather than a normal Session prompt.
 */
export function CommunityComposer({ value, disabled, running = false, onStop, copy, agents, rooms, sessionId, lookupReferences, lookupCommands, onChange, onSubmit }: CommunityComposerProps) {
  const editorRef = useRef<HTMLTextAreaElement | null>(null)
  const fileRef = useRef<HTMLInputElement | null>(null)
  const [menu, setMenu] = useState<MenuMode>()
  const [cursor, setCursor] = useState(value.length)
  const [remoteReferences, setRemoteReferences] = useState<readonly CommunityComposerReference[]>([])
  const [remoteCommands, setRemoteCommands] = useState<readonly { readonly name: string; readonly description: string }[]>([])

  const trigger = useMemo(() => {
    const prefix = value.slice(0, cursor)
    const match = prefix.match(/(?:^|\s)([\/@])([^\s]*)$/u)
    return match === null ? undefined : { kind: match[1] as '/' | '@', query: match[2] ?? '' }
  }, [cursor, value])

  useEffect(() => {
    if (menu !== 'plus') setMenu(trigger === undefined ? undefined : trigger.kind === '/' ? 'slash' : 'mention')
  }, [menu, trigger])

  useEffect(() => {
    if (menu !== 'mention' || sessionId === undefined || lookupReferences === undefined) {
      setRemoteReferences([])
      return
    }
    const controller = new AbortController()
    void lookupReferences(trigger?.query ?? '', controller.signal).then(setRemoteReferences, () => {
      if (!controller.signal.aborted) setRemoteReferences([])
    })
    return () => { controller.abort() }
  }, [lookupReferences, menu, sessionId, trigger?.query])

  useEffect(() => {
    if (menu !== 'slash' || sessionId === undefined || lookupCommands === undefined) {
      setRemoteCommands([])
      return
    }
    const controller = new AbortController()
    void lookupCommands(controller.signal).then(setRemoteCommands, () => {
      if (!controller.signal.aborted) setRemoteCommands([])
    })
    return () => { controller.abort() }
  }, [lookupCommands, menu, sessionId])

  const update = (next: string): void => {
    onChange(next)
    requestAnimationFrame(() => {
      const node = editorRef.current
      if (node !== null) {
        node.style.height = 'auto'
        node.style.height = `${Math.min(node.scrollHeight, 180)}px`
      }
    })
  }

  const insert = (text: string, replaceTrigger = true): void => {
    const node = editorRef.current
    const end = node?.selectionStart ?? cursor
    const before = value.slice(0, end)
    const after = value.slice(end)
    const match = replaceTrigger ? before.match(/(?:^|\s)([\/@])([^\s]*)$/u) : null
    const start = match === null ? end - (replaceTrigger ? 0 : 0) : before.length - match[0].length + (match[0].startsWith(' ') ? 1 : 0)
    const next = `${before.slice(0, start)}${text}${after}`
    const nextCursor = start + text.length
    update(next)
    setCursor(nextCursor)
    setMenu(undefined)
    requestAnimationFrame(() => {
      editorRef.current?.focus()
      editorRef.current?.setSelectionRange(nextCursor, nextCursor)
    })
  }

  const onFilePick = (event: ChangeEvent<HTMLInputElement>): void => {
    const files = [...(event.target.files ?? [])]
    event.target.value = ''
    const labels = files.map(file => file.name.includes(' ') ? `@"${file.name}"` : `@${file.name}`)
    if (labels.length > 0) insert(`${labels.join(' ')} `, false)
  }

  const mentionItems = useMemo(() => {
    const query = trigger?.query.toLocaleLowerCase() ?? ''
    const agentItems = agents
      .filter(agent => agent.name.toLocaleLowerCase().includes(query))
      .map(agent => ({ key: `agent:${agent.id}`, label: `@${agent.name}`, detail: agent.description }))
    const roomItems = rooms
      .filter(room => room.name.toLocaleLowerCase().includes(query))
      .map(room => ({ key: `room:${room.id}`, label: room.name.includes(' ') ? `@"${room.name}"` : `@${room.name}`, detail: copy.conversation }))
    return [
      { key: 'all', label: '@all', detail: copy.mentions, insert: '@all' },
      ...agentItems.map(item => ({ ...item, insert: item.label })),
      ...roomItems.map(item => ({ ...item, insert: item.label })),
      ...remoteReferences,
    ]
  }, [agents, copy.conversation, copy.mentions, remoteReferences, rooms, trigger?.query])

  const slashItems = useMemo(() => {
    const query = trigger?.query.toLocaleLowerCase() ?? ''
    const dynamic = remoteCommands.map(command => ({ name: command.name, detail: command.description }))
    const seen = new Set<string>()
    return [...dynamic, ...SLASH_COMMANDS].filter(command => {
      if (seen.has(command.name) || !command.name.includes(query)) return false
      seen.add(command.name)
      return true
    })
  }, [remoteCommands, trigger?.query])

  const submit = (): void => {
    if (!value.trim()) return
    setMenu(undefined)
    onSubmit()
  }

  const overlay = <>
    {menu === 'plus' && <div className={css.composerMenu} role="menu">
      <button className={css.composerMenuItem} type="button" onClick={() => { fileRef.current?.click(); setMenu(undefined) }}><strong>{copy.file}</strong><span>@file reference</span></button>
      <button className={css.composerMenuItem} type="button" onClick={() => { setMenu('slash'); editorRef.current?.focus() }}><strong>{copy.commands}</strong><span>/slash command</span></button>
      <button className={css.composerMenuItem} type="button" onClick={() => { insert('@', false); setMenu('mention'); editorRef.current?.focus() }}><strong>{copy.conversation}</strong><span>@Agent / @conversation</span></button>
    </div>}
    {menu === 'slash' && <ComposerSuggestions title={copy.commands} items={slashItems.map(item => ({ key: item.name, label: `/${item.name}`, detail: item.detail }))} empty={copy.noSuggestions} onPick={item => { insert(`${item.label} `) }} />}
    {menu === 'mention' && <ComposerSuggestions title={copy.mentions} items={mentionItems} empty={copy.noSuggestions} onPick={item => { insert(`${item.insert} `) }} />}
  </>
  return <ComposerSurface
    overlay={overlay}
    tools={<><button className={css.composerTool} type="button" aria-label={copy.plus} title={copy.plus} disabled={disabled} onClick={() => { setMenu(current => current === 'plus' ? undefined : 'plus') }}><IconPlusOutlineMedium size={18} /></button><input ref={fileRef} className={css.composerFileInput} type="file" multiple onChange={onFilePick} /></>}
    controls={<Button
      className={css.composerPrimary}
      variant="primary"
      size="sm"
      icon={running && !value.trim() ? <IconStopFillMedium size={16} /> : <IconSendOutlineRegular size={16} />}
      aria-label={running && !value.trim() ? 'Stop Agent' : copy.send}
      title={running && !value.trim() ? 'Stop Agent' : copy.send}
      disabled={running && !value.trim() ? disabled || onStop === undefined : disabled || !value.trim()}
      onClick={running && !value.trim() ? onStop : submit}
    />}
  >
    <textarea
      ref={editorRef}
      className={css.composerEditor}
      aria-label={copy.placeholder}
      placeholder={copy.placeholder}
      value={value}
      disabled={disabled}
      rows={1}
      onChange={event => { setCursor(event.target.selectionStart); update(event.target.value) }}
      onKeyUp={event => { setCursor(event.currentTarget.selectionStart) }}
      onClick={event => { setCursor(event.currentTarget.selectionStart) }}
      onKeyDown={event => {
        if (event.key === 'Escape') { setMenu(undefined); return }
        if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); submit() }
      }}
    />
  </ComposerSurface>
}

function ComposerSuggestions({ title, items, empty, onPick }: { readonly title: string; readonly items: readonly { key: string; label: string; detail: string; insert?: string }[]; readonly empty: string; readonly onPick: (item: { key: string; label: string; detail: string; insert?: string }) => void }) {
  return <div className={css.composerMenu} role="listbox" aria-label={title}>
    <div className={css.composerMenuLabel}>{title}</div>
    {items.length === 0 ? <div className={css.composerEmpty}>{empty}</div> : items.map(item => <button className={css.composerMenuItem} type="button" role="option" key={item.key} onClick={() => { onPick(item) }}><strong>{item.label}</strong><span>{item.detail}</span></button>)}
  </div>
}
