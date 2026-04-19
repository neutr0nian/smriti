// 2px base unit — name equals px value
export const spacing = {
  2:  '2px',
  4:  '4px',
  6:  '6px',
  8:  '8px',
  10: '10px',
  12: '12px',
  14: '14px',
  16: '16px',
  20: '20px',
  24: '24px',
  28: '28px',
  32: '32px',
  40: '40px',
  48: '48px',
  64: '64px',
  80: '80px',
  96: '96px',
} as const;

export const borderRadius = {
  sm:   '2px',
  md:   '4px',
  lg:   '8px',
  xl:   '16px',
  full: '9999px',
} as const;

export type SpacingToken      = keyof typeof spacing;
export type BorderRadiusToken = keyof typeof borderRadius;
