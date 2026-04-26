export const breakpoints = {
  tabletPortrait:  600,
  tabletLandscape: 900,
  desktop:         1200,
} as const

export const mq = {
  tabletPortraitUp:  `(min-width: ${breakpoints.tabletPortrait}px)`,
  tabletLandscapeUp: `(min-width: ${breakpoints.tabletLandscape}px)`,
  desktopUp:         `(min-width: ${breakpoints.desktop}px)`,
} as const

export type BreakpointToken = keyof typeof breakpoints
