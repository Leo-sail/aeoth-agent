import { useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent, ReactNode } from 'react'
import {
  Button,
  IconListPenOutlineRegular,
  IconPaperPlaneOutlineRegular,
  IconPlusOutlineMedium,
  IconSendOutlineRegular,
  IconSkillOutlineRegular,
  IconStopFillMedium,
  MenuSurface,
} from '@deepseek-ai/dsh-client-ui-primitives'
import type { BotIdentity, BotRoom } from '@deepseek-ai/dsh-agent-community/types'
import { ComposerSurface } from '@deepseek-ai/dsh-client-ui-conversation/client'
import css from './page.module.css'

type MenuMode = 'plus' | 'slash' | 'mention' | undefined

type ComposerMenuItem = {
  readonly key: string
  readonly label: string
  readonly alias?: string
  readonly detail: string
  readonly insert?: string
  readonly icon?: ReactNode
  readonly action?: 'file' | 'model' | 'insert'
}

const STATIC_SKILLS: readonly ComposerMenuItem[] = [
  { key: 'banner-design', label: 'banner-design', detail: 'Design banners for social media, ads, website heroes, creative assets, and print. Multiple art direction …', insert: '/banner-design ', icon: <IconSkillOutlineRegular size={16} /> },
  { key: 'brand', label: 'brand', detail: 'Brand voice, visual identity, messaging frameworks, asset management, brand consistency.', insert: '/brand ', icon: <IconSkillOutlineRegular size={16} /> },
  { key: 'design', label: 'design', detail: 'Comprehensive design skill: brand identity, design tokens, UI styling, logo generation, and more.', insert: '/design ', icon: <IconSkillOutlineRegular size={16} /> },
  { key: 'design-system', label: 'design-system', detail: 'Token architecture, component specifications, and slide generation.', insert: '/design-system ', icon: <IconSkillOutlineRegular size={16} /> },
  { key: 'impeccable', label: 'impeccable', detail: 'Design, redesign, shape, critique, audit, polish, and improve a frontend interface.', insert: '/impeccable ', icon: <IconSkillOutlineRegular size={16} /> },
  { key: 'office-docx', label: 'office-docx', detail: 'Create, read, edit, and check Word documents (.docx), including reports and letters.', insert: '/office-docx ', icon: <IconSkillOutlineRegular size={16} /> },
  { key: 'office-pptx', label: 'office-pptx', detail: 'Create, read, edit, and check PowerPoint presentations (.pptx), including slide text and tables.', insert: '/office-pptx ', icon: <IconSkillOutlineRegular size={16} /> },
  { key: 'office-xlsx', label: 'office-xlsx', detail: 'Read, create, and modify Excel workbooks (.xlsx), including data and formulas.', insert: '/office-xlsx ', icon: <IconSkillOutlineRegular size={16} /> },
  { key: 'slides', label: 'slides', detail: 'Create strategic HTML presentations with Chart.js, design tokens, responsive layouts, and copywriting.', insert: '/slides ', icon: <IconSkillOutlineRegular size={16} /> },
  { key: 'ui-styling', label: 'ui-styling', detail: 'Create beautiful, accessible user interfaces with shadcn/ui, Tailwind CSS, and canvas-based designs.', insert: '/ui-styling ', icon: <IconSkillOutlineRegular size={16} /> },
  { key: 'ui-ux-pro-max', label: 'ui-ux-pro-max', detail: 'UI/UX design intelligence with searchable databases.', insert: '/ui-ux-pro-max ', icon: <IconSkillOutlineRegular size={16} /> },
]

export interface CommunityComposerReference {
  readonly key: string
  readonly label: string
  readonly detail: string
  readonly insert: string
}

export interface CommunityComposerCopy {
  readonly placeholder: string
  readonly plus: string
  readonly addTitle: string
  readonly directiveTitle: string
  readonly skillTitle: string
  readonly file: string
  readonly conversation: string
  readonly commands: string
  readonly mentions: string
  readonly noSuggestions: string
  readonly send: string
  readonly addItems: readonly ComposerMenuItem[]
  readonly directiveItems: readonly ComposerMenuItem[]
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
  readonly onOpenModelSettings?: (() => void) | undefined
  readonly onChange: (value: string) => void
  readonly onSubmit: () => void
}

function activeToken(value: string, caret: number): { readonly start: number; readonly token: string } {
  const prefix = value.slice(0, caret)
  const start = Math.max(prefix.lastIndexOf(' '), prefix.lastIndexOf('\n'), prefix.lastIndexOf('\t')) + 1
  return { start, token: prefix.slice(start) }
}

function normalizeMention(value: string): string {
  const trimmed = value.trim().replace(/^@+/u, '')
  return trimmed === '' ? '@' : `@${trimmed}`
}

/** Community-owned adapter of Aeoth's native composer surface. */
export function CommunityComposer({ value, disabled, running = false, onStop, copy, agents, rooms, sessionId, lookupReferences, lookupCommands, onOpenModelSettings, onChange, onSubmit }: CommunityComposerProps) {
  const editorRef = useRef<HTMLTextAreaElement | null>(null)
  const fileRef = useRef<HTMLInputElement | null>(null)
  const [menu, setMenu] = useState<MenuMode>()
  const [cursor, setCursor] = useState(value.length)
  const [remoteReferences, setRemoteReferences] = useState<readonly CommunityComposerReference[]>([])
  const [remoteCommands, setRemoteCommands] = useState<readonly { readonly name: string; readonly description: string }[]>([])

  const trigger = useMemo(() => {
    const { token } = activeToken(value, cursor)
    if (token.startsWith('/')) return { kind: '/' as const, query: token.slice(1) }
    if (token.startsWith('@')) return { kind: '@' as const, query: token.slice(1).replace(/^@+/u, '') }
    return undefined
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
        node.style.height = `${Math.min(node.scrollHeight, 336)}px`
      }
    })
  }

  const insert = (text: string, replaceTrigger = true): void => {
    const node = editorRef.current
    const end = node?.selectionStart ?? cursor
    const before = value.slice(0, end)
    const after = value.slice(end)
    const start = replaceTrigger ? activeToken(value, end).start : end
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
      .map(agent => {
        const label = normalizeMention(agent.name)
        return { key: `agent:${agent.id}`, label, detail: agent.description, insert: label }
      })
    const roomItems = rooms
      .filter(room => room.name.toLocaleLowerCase().includes(query))
      .map(room => {
        const label = normalizeMention(room.name.includes(' ') ? `"${room.name}"` : room.name)
        return { key: `room:${room.id}`, label, detail: copy.conversation, insert: label }
      })
    const references = remoteReferences.map(item => ({ ...item, label: normalizeMention(item.label), insert: normalizeMention(item.insert) }))
    const seen = new Set<string>()
    return [{ key: 'all', label: '@all', detail: copy.mentions, insert: '@all' }, ...agentItems, ...roomItems, ...references].filter(item => {
      const key = item.insert.toLocaleLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }, [agents, copy.conversation, copy.mentions, remoteReferences, rooms, trigger?.query])

  const slashSections = useMemo(() => {
    const query = trigger?.query.toLocaleLowerCase() ?? ''
    const dynamic = remoteCommands.map(command => {
      const name = command.name.replace(/^\/+/u, '')
      return {
        key: `command:${name}`,
        label: `/${name}`,
        detail: command.description,
        insert: `/${name} `,
        icon: <IconListPenOutlineRegular size={16} />,
      }
    })
    const directives = [...copy.directiveItems, ...dynamic]
      .filter(item => item.label.toLocaleLowerCase().includes(`/${query}`) || item.label.toLocaleLowerCase().includes(query))
      .reduce<ComposerMenuItem[]>((items, item) => {
        if (!items.some(existing => existing.label.toLocaleLowerCase() === item.label.toLocaleLowerCase())) items.push(item)
        return items
      }, [])
    const skills = STATIC_SKILLS.filter(item => item.label.toLocaleLowerCase().includes(query))
    return [
      { title: copy.directiveTitle, items: directives },
      { title: copy.skillTitle, items: skills },
    ].filter(section => section.items.length > 0)
  }, [copy.directiveItems, copy.directiveTitle, copy.skillTitle, remoteCommands, trigger?.query])

  const submit = (): void => {
    if (!value.trim()) return
    setMenu(undefined)
    onSubmit()
  }

  const pickAddItem = (item: ComposerMenuItem): void => {
    if (item.action === 'file') {
      fileRef.current?.click()
      setMenu(undefined)
      return
    }
    if (item.action === 'model') {
      if (onOpenModelSettings !== undefined) {
        setMenu(undefined)
        onOpenModelSettings()
      } else {
        insert(item.insert ?? '/model ')
      }
      return
    }
    insert(item.insert ?? '')
  }

  const overlay = <>
    {menu === 'plus' && <MenuSurface className={css.composerMenu} role="menu" aria-label={copy.addTitle}>
      <div className={css.composerMenuLabel}>{copy.addTitle}</div>
      {copy.addItems.map(item => <ComposerMenuButton key={item.key} item={item} onPick={pickAddItem} />)}
      <div className={css.composerMenuLabel}>{copy.directiveTitle}</div>
      {copy.directiveItems.map(item => <ComposerMenuButton key={item.key} item={item} onPick={pickAddItem} />)}
    </MenuSurface>}
    {menu === 'slash' && <ComposerSuggestions sections={slashSections} empty={copy.noSuggestions} onPick={item => { insert(item.insert ?? `${item.label} `) }} />}
    {menu === 'mention' && <ComposerSuggestions sections={[{ title: copy.mentions, items: mentionItems }]} empty={copy.noSuggestions} onPick={item => { insert(`${item.insert ?? item.label} `) }} />}
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

function ComposerMenuButton({ item, onPick }: { readonly item: ComposerMenuItem; readonly onPick: (item: ComposerMenuItem) => void }) {
  return <button className={css.composerMenuItem} type="button" onClick={() => { onPick(item) }}>
    <span className={css.composerItemIcon} aria-hidden>{item.icon ?? <IconPaperPlaneOutlineRegular size={16} />}</span>
    <strong>{item.label}</strong>
    {item.alias && <span className={css.composerItemAlias}>{item.alias}</span>}
    <span className={css.composerItemDetail}>{item.detail}</span>
  </button>
}

function ComposerSuggestions({ sections, empty, onPick }: { readonly sections: readonly { readonly title: string; readonly items: readonly ComposerMenuItem[] }[]; readonly empty: string; readonly onPick: (item: ComposerMenuItem) => void }) {
  return <MenuSurface className={css.composerMenu} role="listbox">
    {sections.length === 0 ? <div className={css.composerEmpty}>{empty}</div> : sections.map(section => <section key={section.title} className={css.composerSection}>
      <div className={css.composerMenuLabel}>{section.title}</div>
      {section.items.map(item => <button className={css.composerMenuItem} type="button" role="option" key={item.key} onClick={() => { onPick(item) }}>
        <span className={css.composerItemIcon} aria-hidden>{item.icon ?? <IconSkillOutlineRegular size={16} />}</span>
        <strong>{item.label}</strong>
        {item.alias && <span className={css.composerItemAlias}>{item.alias}</span>}
        <span className={css.composerItemDetail}>{item.detail}</span>
      </button>)}
    </section>)}
  </MenuSurface>
}

