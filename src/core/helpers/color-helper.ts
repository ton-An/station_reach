interface Rgba {
  readonly r: number;
  readonly g: number;
  readonly b: number;
  readonly a: number;
}

const RGB_PATTERN =
  /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+))?\s*\)$/i;

function parseRgba(color: string): Rgba {
  const match = RGB_PATTERN.exec(color.trim());
  if (match === null) throw new Error(`Unsupported colour format: ${color}`);

  return {
    r: Number(match[1]),
    g: Number(match[2]),
    b: Number(match[3]),
    a: match[4] === undefined ? 1 : Number(match[4]),
  };
}

function formatRgba({ r, g, b, a }: Rgba): string {
  return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${a})`;
}

function stopAt(colors: readonly string[], index: number): string {
  const color = colors[index];
  if (color === undefined) {
    throw new Error(`Gradient has no stop at index ${index}`);
  }

  return color;
}

/**
 * Interpolates between colors in a gradient at a given position. Position is
 * clamped to [0, 1] where 0 is the first color and 1 is the last.
 *
 * @param colors - The gradient stops as rgba strings.
 * @param position - The position in the gradient, from 0 to 1.
 * @returns The interpolated rgba color string.
 */
export function interpolateColors(
  colors: readonly string[],
  position: number
): string {
  if (colors.length === 0) {
    throw new Error('Cannot interpolate an empty gradient');
  }

  if (colors.length === 1 || position <= 0) return stopAt(colors, 0);
  if (position >= 1) return stopAt(colors, colors.length - 1);

  const segmentLength = 1 / (colors.length - 1);
  const segmentIndex = Math.floor(position / segmentLength);
  const localPosition =
    (position - segmentIndex * segmentLength) / segmentLength;

  const start = parseRgba(stopAt(colors, segmentIndex));
  const end = parseRgba(stopAt(colors, segmentIndex + 1));

  const lerp = (from: number, to: number) => from + (to - from) * localPosition;

  return formatRgba({
    r: lerp(start.r, end.r),
    g: lerp(start.g, end.g),
    b: lerp(start.b, end.b),
    a: lerp(start.a, end.a),
  });
}

/**
 * Returns the color with a different alpha value.
 *
 * @param color - An rgba color string.
 * @param alpha - The new alpha value from 0 to 1.
 * @returns The color with the new alpha.
 */
export function withAlpha(color: string, alpha: number): string {
  return formatRgba({ ...parseRgba(color), a: alpha });
}

interface FlattenOntoParams {
  readonly color: string;
  readonly backdrop: string;
  readonly alpha: number;
}

/**
 * Composites a color with transparency onto a backdrop using alpha blending.
 *
 * @param color - The top color, an rgba string.
 * @param backdrop - The bottom color, an rgba string.
 * @param alpha - The alpha of the top color.
 * @returns The blended color.
 */
export function flattenOnto({
  color,
  backdrop,
  alpha,
}: FlattenOntoParams): string {
  const top = parseRgba(color);
  const bottom = parseRgba(backdrop);
  const mix = (over: number, under: number) =>
    over * alpha + under * (1 - alpha);

  return formatRgba({
    r: mix(top.r, bottom.r),
    g: mix(top.g, bottom.g),
    b: mix(top.b, bottom.b),
    a: 1,
  });
}

const GRADIENT_BUCKETS = 36;

// Maps duration to a position in [0, 1]. Each bucket represents 30 minutes,
// clamped at a maximum of 1080 minutes.
function durationToGradientPosition(durationMinutes: number): number {
  const bucket = Math.min(
    Math.max(Math.floor(durationMinutes / 30), 0),
    GRADIENT_BUCKETS
  );

  return bucket / GRADIENT_BUCKETS;
}

export interface ColorForDurationParams {
  readonly gradient: readonly string[];
  readonly durationMinutes: number;
  readonly alpha?: number;
}

/**
 * Returns the color for a travel duration on a gradient. Duration maps to
 * position with each bucket representing 30 minutes, clamped at 1080 minutes.
 *
 * @param gradient - The gradient stops as rgba strings.
 * @param durationMinutes - The travel time in minutes.
 * @param alpha - Optional alpha to apply to the result.
 * @returns The color for the given duration.
 */
export function colorForDuration({
  gradient,
  durationMinutes,
  alpha,
}: ColorForDurationParams): string {
  const color = interpolateColors(
    gradient,
    durationToGradientPosition(durationMinutes)
  );

  return alpha === undefined ? color : withAlpha(color, alpha);
}
