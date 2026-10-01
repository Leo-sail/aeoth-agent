/** Target-neutral native composer surface for alternate submit adapters. */
import type { ReactNode } from 'react'
import css from './InputBar.module.css'

export interface ComposerSurfaceProps {
  readonly children: ReactNode
  readonly tools?: ReactNode
  readonly controls?: ReactNode
  readonly overlay?: ReactNode
}

/**
 * Reuse the native InputBar card, scrollport, toolbar, and overlay geometry
 * without taking ownership of Session input or submit semantics.
 */
export function ComposerSurface({ children, tools, controls, overlay }: ComposerSurfaceProps): ReactNode {
  return (
    <div className={css.root}>
      <div className={css.card} data-composer-card>
        {overlay === undefined ? null : <div className={css.overlayAnchor}>{overlay}</div>}
        <div className={css.scroll} data-input-scroll>
          <div className={css.grow}>{children}</div>
        </div>
        <div className={css.row}>
          <div className={css.tools}>{tools}</div>
          <div className={css.trailing}>{controls}</div>
        </div>
      </div>
    </div>
  )
}
