import { IconAgentPresetOutlineRegular } from '@deepseek-ai/dsh-client-ui-primitives'
import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'

/** Decorative icon for the Agents entry in Aeoth's left sidebar. */
export function AgentsIcon({ size }: PropsRuntime<'sidebar.panellist'>) {
  return <IconAgentPresetOutlineRegular size={size} />
}
