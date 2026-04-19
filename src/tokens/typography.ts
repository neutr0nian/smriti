export const fontFamily = {
  serif: 'Georgia, "Iowan Old Style", serif',
  sans:  '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
  hand:  '"Caveat", "Bradley Hand", cursive',
} as const;

// Named scale — use these everywhere, never raw px in components
export const fontSize = {
  xs:   '10px',
  sm:   '12px',
  base: '14px',
  lg:   '16px',
  xl:   '20px',
  '2xl': '24px',
  '3xl': '32px',
  '4xl': '40px',
} as const;

export const fontWeight = {
  regular:  '400',
  medium:   '500',
  semibold: '600',
  bold:     '700',
} as const;

export const lineHeight = {
  tight:   '1.2',
  snug:    '1.4',
  normal:  '1.65',
  relaxed: '1.75',
} as const;

export const letterSpacing = {
  tight:  '-0.5px',
  normal: '0px',
  wide:   '1.5px',
  wider:  '2px',
} as const;

export type FontSizeToken    = keyof typeof fontSize;
export type FontWeightToken  = keyof typeof fontWeight;
export type LineHeightToken  = keyof typeof lineHeight;
