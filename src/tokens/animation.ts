export const duration = {
  instant: '80ms',
  fast:    '150ms',
  base:    '220ms',
  slow:    '350ms',
} as const

export const easing = {
  linear:   'linear',
  enter:    'ease-out',
  exit:     'ease-in',
} as const

export type DurationToken = keyof typeof duration
export type EasingToken   = keyof typeof easing
