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
 * Linearly interpolates `colors` at `position`.
 *
 * @param colors - The gradient stops, as `rgb()`/`rgba()` strings.
 * @param position - Where to sample the gradient, 0 to 1. A value outside
 * that range clamps to the nearest end stop; a single-stop gradient always
 * returns that stop.
 * @returns The interpolated colour, as an `rgba()` string.
 * @throws Error if `colors` is empty.
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
 * Returns `color` with its alpha channel replaced by `alpha`.
 *
 * @param color - An `rgb()`/`rgba()` string.
 * @param alpha - The new alpha, 0 to 1.
 * @returns The colour, as an `rgba()` string.
 */
export function withAlpha(color: string, alpha: number): string {
  return formatRgba({ ...parseRgba(color), a: alpha });
}

interface FlattenOntoParams {
  readonly color: string;
  readonly backdrop: string;
  /** Opacity `color` is mixed at; replaces any alpha already in `color`. */
  readonly alpha: number;
}

/**
 * Alpha-composites `color` over the opaque `backdrop` and returns an opaque
 * result.
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

function durationToGradientPosition(durationMinutes: number): number {
  const bucket = Math.min(
    Math.max(Math.floor(durationMinutes / 30), 0),
    GRADIENT_BUCKETS
  );

  return bucket / GRADIENT_BUCKETS;
}

export interface ColorForDurationParams {
  /** Colour stops, ordered from the shortest travel time to the longest. */
  readonly gradient: readonly string[];
  /** Travel time in minutes; a negative value clamps to zero. */
  readonly durationMinutes: number;
  /** Overrides the interpolated colour's alpha; left as-is when omitted. */
  readonly alpha?: number;
}

/**
 * The single source of travel-time colour: markers, polylines and list rows
 * all call this to turn a duration into a colour, and the legend renders the
 * same gradient this interpolates over.
 *
 * Buckets `durationMinutes` into 30-minute steps, clamped at 18 hours, and
 * interpolates `gradient` at that position.
 *
 * @param params - {@link ColorForDurationParams}
 * @returns The colour, as an `rgba()` string.
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
