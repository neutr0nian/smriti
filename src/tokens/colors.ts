// Neutral scale — warm paper tones (Claude-style cream)
export const neutral = {
  50:  '#FAF9F5',
  100: '#F3EFE5',
  200: '#E8E3D9',
  300: '#D9D5CB',
  400: '#C4BFB3',
  500: '#8A8578',
  600: '#5C584F',
  700: '#4A4540',
  800: '#2D2A25',
  900: '#1A1714',
} as const;

// Orange scale — Claude brand orange
export const orange = {
  50:  '#FFF5ED',
  100: '#FFE8D4',
  200: '#FFCBA8',
  300: '#FFA876',
  400: '#F08050',
  500: '#D97757',
  600: '#C4612E',
  700: '#A34A22',
  800: '#7D3418',
  900: '#5C2510',
} as const;

// Semantic aliases — use these in components, not raw scales
export const colors = {
  // Surfaces
  bg:         neutral[50],
  surface:    '#FDFCF8',
  border:     neutral[200],
  borderSubtle: neutral[300],

  // Text
  inkPrimary:   neutral[900],
  inkSecondary: neutral[700],
  inkMuted:     neutral[500],

  // Accent
  accent:         orange[500],
  accentHover:    orange[600],
  accentSoft:     'rgba(217,119,87,0.14)',
  accentDisabled: orange[200],

  // Note colors
  sticky:       '#FDE89A',
  stickyBorder: '#E8C764',
  stickyInk:    '#3D2F0A',
} as const;

export type ColorToken = keyof typeof colors;
