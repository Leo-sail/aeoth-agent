import { IconAgentPresetOutlineRegular } from '@deepseek-ai/dsh-client-ui-primitives'
import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'

/** Decorative icon for the built-in Bots entry in Aeoth's left sidebar. */
export function BotCommunityIcon({ size }: PropsRuntime<'sidebar.panellist'>) {
  return <IconAgentPresetOutlineRegular size={size} />
}
