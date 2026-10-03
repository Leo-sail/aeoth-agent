import { AeothMark } from '@deepseek-ai/dsh-client-ui-primitives'
import type { TranslateNS } from '@deepseek-ai/dsh-client-ui-slots'
import type { SidebarBrandMarkOwnerProps } from '@deepseek-ai/dsh-client-ui-sidebar/client'

/** Render the public Aeoth Agent mark at the host-requested size. */
export function AeothBrandMark({ size }: SidebarBrandMarkOwnerProps) {
  return <AeothMark size={size} />
}

/** Render the public Aeoth Agent wordmark without a second mark. */
export function AeothBrandName({ t }: { t: TranslateNS<'common'> }) {
  return <span aria-hidden="true" style={{ fontWeight: 650, letterSpacing: '-0.02em' }}>{t('brand.agentName')}</span>
}

/** @deprecated Use {@link AeothBrandMark}. */
export const OfficialBrandMark = AeothBrandMark

/** @deprecated Use {@link AeothBrandName}. */
export const OfficialBrandName = AeothBrandName
