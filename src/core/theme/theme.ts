import type { TextStyle } from 'react-native';

export const spacing = {
  tiny: 1,
  xTiny: 2,
  small: 4,
  xSmall: 8,
  xxSmall: 12,
  medium: 14,
  xMedium: 16,
  xxMedium: 18,
  large: 24,
  xLarge: 44,
  xxLarge: 128,
} as const satisfies Record<string, number>;

export const radii = {
  small: 8,
  field: 10,
  medium: 12,
  xMedium: 18,
  large: 20,
  xLarge: 30,
  full: 999,
} as const satisfies Record<string, number>;

/**
 * Glyph sizes for {@link Icon}. Three steps, because an icon that is not one
 * of these reads as a mistake next to the ones that are.
 */
export const icons = {
  small: 20,
  medium: 24,
  large: 28,
} as const satisfies Record<string, number>;

export const durations = {
  tiny: 50,
  xTiny: 100,
  xxTiny: 150,
  short: 200,
  xShort: 250,
  xxShort: 300,
  medium: 400,
  xMedium: 500,
  xxMedium: 600,
  long: 800,
  xLong: 1000,
  xxLong: 1200,
  huge: 1500,
  xHuge: 2000,
  xxHuge: 2500,
} as const satisfies Record<string, number>;

/**
 * Travel-time colour scale, shortest first. Sampled by `colorForDuration`,
 * so the spacing between stops is what a minute of travel time is worth.
 *
 * The stops are evenly spaced in Oklab, not picked by eye: an equal step
 * along the scale is an equal change in colour, with no stop that jumps
 * further than its neighbours. Lightness rises once to the yellow apex and
 * falls from there, never reversing again, so the ramp reads as one slope
 * rather than a set of bands. Both ends stay dark enough to hold their own
 * over the light basemap at the alpha markers and routes are drawn with.
 */
export const timelineGradient = [
  'rgb(0, 160, 91)',
  'rgb(78, 192, 79)',
  'rgb(144, 209, 51)',
  'rgb(213, 218, 0)',
  'rgb(243, 185, 0)',
  'rgb(239, 131, 0)',
  'rgb(230, 71, 0)',
  'rgb(204, 1, 32)',
  'rgb(169, 0, 70)',
  'rgb(149, 0, 117)',
  'rgb(122, 10, 158)',
  'rgb(64, 18, 152)',
] as const;

export const secondaryGradient = [
  'rgb(156, 39, 176)',
  'rgb(103, 58, 183)',
  'rgb(63, 81, 181)',
  'rgb(33, 150, 243)',
  'rgb(0, 188, 212)',
] as const;

export const colors = {
  primary: 'rgb(83, 196, 108)',
  primaryTranslucent: 'rgba(83, 196, 108, 0.235)',
  primaryContrast: 'rgb(255, 255, 255)',
  accent: 'rgb(7, 114, 255)',

  background: 'rgb(255, 255, 255)',
  backgroundContrast: 'rgb(0, 0, 0)',
  translucentBackground: 'rgba(255, 255, 255, 0.45)',
  translucentBackgroundContrast: 'rgba(0, 0, 0, 0.078)',

  text: 'rgb(0, 0, 0)',
  hint: 'rgb(142, 142, 147)',
  buttonLabel: 'rgb(255, 255, 255)',

  field: 'rgb(243, 242, 248)',
  border: 'rgb(134, 134, 139)',
  disabled: 'rgba(116, 116, 128, 0.078)',

  error: 'rgb(255, 59, 48)',
  success: 'rgb(52, 199, 89)',
  transparent: 'transparent',

  timelineGradient,
  secondaryGradient,
} as const;

export const FONT_FAMILY = 'Inter';

export const text = {
  largeTitle: {
    fontFamily: FONT_FAMILY,
    fontSize: 34,
    lineHeight: 41,
    fontWeight: '400',
  },
  title1: {
    fontFamily: FONT_FAMILY,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '400',
  },
  title2: {
    fontFamily: FONT_FAMILY,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '400',
  },
  title3: {
    fontFamily: FONT_FAMILY,
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '400',
  },
  headline: {
    fontFamily: FONT_FAMILY,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '600',
  },
  body: {
    fontFamily: FONT_FAMILY,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '400',
  },
  callout: {
    fontFamily: FONT_FAMILY,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '400',
  },
  subhead: {
    fontFamily: FONT_FAMILY,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '400',
  },
  footnote: {
    fontFamily: FONT_FAMILY,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
  },
  caption1: {
    fontFamily: FONT_FAMILY,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
  },
  caption2: {
    fontFamily: FONT_FAMILY,
    fontSize: 11,
    lineHeight: 13,
    fontWeight: '400',
  },
} as const satisfies Record<string, TextStyle>;

/**
 * Dimensions of the app's floating chrome — search panel, legend, modals.
 * Tokens because panels that never see each other still have to agree on
 * them.
 */
export const layout = {
  overlayMaxWidth: 400,
  legendClusterWidth: 320,
  wideBreakpoint: 900,
} as const satisfies Record<string, number>;

/**
 * Values components have to agree on without ever seeing each other: the two
 * blur levels {@link TranslucentSurface} renders at, and the alpha a circle
 * filled from a gradient is tinted to before a glyph is drawn on it.
 */
export const misc = {
  blurIntensity: 30,
  legendBlurIntensity: 12,
  glyphCircleAlpha: 0.55,
} as const satisfies Record<string, number>;

export const theme = {
  spacing,
  radii,
  icons,
  durations,
  colors,
  text,
  layout,
  misc,
} as const;

export type Theme = typeof theme;
