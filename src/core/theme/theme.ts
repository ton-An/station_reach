/*
  To-Do:
    - [ ] Inter is shipped as a single variable TTF. React Native cannot address
          the `wght` axis reliably on Android, so weights may snap to the nearest
          static face. Ship static Inter cuts if that becomes visible.
*/

import type { TextStyle } from 'react-native';

/**
 * Spacing scale, in density-independent pixels.
 *
 * Never hardcode a margin or padding — always read a step from here.
 */
export const spacing = {
  tiny: 1,
  xTiny: 2,
  small: 4,
  xSmall: 8,
  xxSmall: 12,
  medium: 14,
  xMedium: 24,
  xxMedium: 32,
  large: 44,
  xLarge: 55,
  xxLarge: 128,
} as const satisfies Record<string, number>;

/** Corner radii, in density-independent pixels. */
export const radii = {
  small: 8,
  field: 10,
  medium: 12,
  button: 14,
  xMedium: 18,
  large: 20,
  xLarge: 30,
  /** Rounder than anything can be tall: turns a box into a pill or a circle. */
  full: 999,
} as const satisfies Record<string, number>;

/** Animation durations, in milliseconds. */
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
 * The travel-time ramp: green (near) through yellow, orange and red, then on
 * into magenta and purple for the journeys that take most of a day.
 *
 * This is the app's single most important visual. Markers, polylines, list rows
 * and the legend all sample it through {@link interpolateColors} so that one
 * duration always maps to one colour.
 *
 * Longer than the Flutter original's seven stops: that ramp ended at red, which
 * left everything past a few hours the same colour on a map whose whole point is
 * how far you can get.
 */
export const timelineGradient = [
  'rgb(0, 150, 107)',
  'rgb(99, 225, 36)',
  'rgb(255, 245, 59)',
  'rgb(254, 209, 29)',
  'rgb(255, 152, 0)',
  'rgb(244, 67, 54)',
  'rgb(255, 17, 0)',
  'rgb(178, 12, 0)',
  'rgb(174, 38, 135)',
  'rgb(156, 39, 176)',
  'rgb(139, 58, 183)',
  'rgb(103, 58, 183)',
] as const;

/**
 * The secondary ramp: purple through blue to cyan.
 *
 * Sampled by *position in a list* rather than by duration — the departures at a
 * stop are tinted along it by index. Deliberately not the travel-time ramp: in
 * that list every row already carries a travel time in its own colour, and
 * tinting the icon from the same gradient made an ordinal cue look like a
 * second, contradictory reading of the duration.
 */
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
  description: 'rgba(60, 60, 67, 0.6)',
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

/**
 * Loaded once in the root layout; nothing renders before it is available.
 *
 * This has to be the family name *inside* the TTF, and the file has to be
 * named after it too. On iOS the `expo-font` plugin embeds the file through
 * `UIAppFonts` and CoreText registers it under its own family name — an alias
 * passed to `useFonts` is ignored there, so a made-up name silently falls back
 * to the system serif. Android resolves the family from the asset's *file*
 * name, and the web from whatever `@font-face` `useFonts` injects. Naming the
 * file `Inter.ttf` is what makes all three agree.
 */
export const FONT_FAMILY = 'Inter';

/**
 * The iOS type scale, matched to the Flutter app's `WebfabrikTextThemeData`.
 *
 * `lineHeight` is absolute in React Native, so the Flutter `height` ratios are
 * pre-multiplied here.
 */
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
 * Fixed sizes the floating chrome is laid out against.
 *
 * Not spacing steps — these are the dimensions of the panels themselves, and
 * several of them have to agree across unrelated components, so they belong to
 * one place rather than to whichever file happened to need one first.
 */
export const layout = {
  /**
   * Widest the floating chrome grows on a large screen.
   *
   * Shared by the search card, the departures sheet and the notification: the
   * three read as one column of chrome, which they only do at one width.
   */
  overlayMaxWidth: 400,
  /** The bottom-left legend cluster, once the screen is wide enough for one. */
  legendClusterWidth: 320,
  /**
   * Below this width the layout collapses to a single bottom-anchored column:
   * the sheet centres, and the legends move inside it.
   *
   * Read it through {@link useIsWideLayout} rather than measuring by hand.
   */
  wideBreakpoint: 900,
} as const satisfies Record<string, number>;

/** Odds and ends that don't belong to a scale. */
export const misc = {
  /** Matches the Flutter `ImageFilter.blur(sigmaX: 15, sigmaY: 15)` surfaces. */
  blurIntensity: 30,
  /** The lighter blur the map legends use (`sigma: 6`). */
  legendBlurIntensity: 12,
} as const satisfies Record<string, number>;

export const theme = {
  spacing,
  radii,
  durations,
  colors,
  text,
  layout,
  misc,
} as const;

export type Theme = typeof theme;
