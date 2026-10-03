import type { IconProps } from './icons/props.ts'

/** Aeoth wordmark shared by the sidebar and new-conversation hero. */
export function AeothMark({ size = 24, className }: IconProps) {
  return (
    <svg
      width={size * 2.8}
      height={size}
      className={className}
      viewBox="0 0 68 24"
      fill="none"
      aria-hidden="true"
    >
      <text x={0} y={19} fontSize={22} fontWeight={650} textLength={66} lengthAdjust="spacingAndGlyphs" fill="currentColor">Aeoth</text>
    </svg>
  )
}
