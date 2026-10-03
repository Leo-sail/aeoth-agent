/** Native Chat presentation shared with persistent Agent conversations. */
import { useCallback, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { MarkdownText } from '@deepseek-ai/dsh-client-ui-primitives'
import type { MarkdownLabels } from '@deepseek-ai/dsh-client-ui-primitives'
import type { TurnTokenUsage } from '../contract/chat-nodes.ts'
import type { ChatViewSlotProps, UseDisclosure, UsePresentation } from '../contract/slots.ts'
import { markdownLabels } from '../markdown-labels.ts'
import { MessageIconActions } from './MessageIconActions.tsx'
import { ReasoningRow } from './ReasoningRow.tsx'
import { TurnUsagePanel } from './TurnUsagePanel.tsx'
import assistantCss from './AssistantMarkdown.module.css'
import css from './CommunityMessage.module.css'
import messageCss from './MessageItem.module.css'

type Translate = ChatViewSlotProps['t']

const STANDARD_PRESENTATION = {
  mode: 'standard', foldCompletedTurns: true, stepGrouping: 'collapsed', liveProcessDetail: true, settledReasoningPreview: true,
} as const

export interface CommunityMessageProps {
  role: 'user' | 'assistant'
  author?: string | undefined
  /** Identity mark for an Agent response in a direct or group room. */
  avatar?: ReactNode
  text: string
  time?: number | undefined
  reasoning?: string | undefined
  toolActivity?: readonly { readonly name: string; readonly status: string; readonly detail?: string }[] | undefined
  usage?: TurnTokenUsage | undefined
  /** Rendered by the owning Agent/Community locale so Chat stays namespace-neutral. */
  durationLabel?: string | undefined
  /** Native message-row actions such as Retry/Stop. */
  extraActions?: ReactNode
  t: Translate
}

/** Render one Agent conversation message with the exact Chat bubble, markdown, reasoning, and action chrome. */
export function CommunityMessage({ role, author, avatar, text, time, reasoning, toolActivity, usage, durationLabel, extraActions, t }: CommunityMessageProps) {
  const labels = useMemo(() => markdownLabels(t), [t])
  if (role === 'user') {
    return <div className={messageCss.userRow} data-chat-flow-kind="user">
      <div className={messageCss.userStack}><div className={messageCss.bubble}>{text}</div></div>
      <MessageIconActions text={text} time={time} clock="start" className={css.userActions} extraActions={extraActions} t={t} />
    </div>
  }

  return <div className={css.assistantRow} data-chat-flow-kind="assistant">
    {avatar !== undefined && <div className={css.avatar} aria-hidden="true">{avatar}</div>}
    <div className={assistantCss.root}>
      {author && <div className={css.author}>{author}</div>}
      {reasoning && <CommunityReasoning text={reasoning} t={t} />}
      <div className={assistantCss.body}>
        <MarkdownText text={text} labels={labels} />
        {toolActivity?.map((tool, index) => <div key={`${tool.name}:${index}`} className={css.toolActivity}>
          <span>{tool.name}</span><span>{tool.status}</span>
        </div>)}
      </div>
      <MessageIconActions text={text} time={time} clock="end" className={css.assistantActions}
        extraActions={extraActions}
        footerMeta={durationLabel === undefined ? undefined : <span className={css.duration}>{durationLabel}</span>}
        usageAction={usage === undefined ? undefined : <TurnUsagePanel usage={usage} t={t} />} t={t} />
    </div>
  </div>
}

function CommunityReasoning({ text, t }: { text: string; t: Translate }) {
  const [expanded, setExpanded] = useState(false)
  const useDisclosure = useCallback<UseDisclosure>(() => ({
    expanded, setExpanded, toggle: () => { setExpanded(value => !value) },
  }), [expanded])
  const usePresentation = useCallback<UsePresentation>(selector => selector(STANDARD_PRESENTATION), [])
  return <ReasoningRow text={text} running={false} useDisclosure={useDisclosure} usePresentation={usePresentation} t={t} />
}

/** Expose the native label type without making callers depend on Chat internals. */
export type CommunityMarkdownLabels = MarkdownLabels
export type CommunityMessageExtraActions = ReactNode
