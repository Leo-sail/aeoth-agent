import { IconUsersOutlineRegular } from '@deepseek-ai/dsh-client-ui-primitives'
import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'

/** Decorative icon for the Group Chats (Teams) entry in Aeoth's left sidebar. */
export function GroupChatIcon({ size }: PropsRuntime<'sidebar.panellist'>) {
  return <IconUsersOutlineRegular size={size} />
}
