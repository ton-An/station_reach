/** An `rgb(r, g, b)` / `rgba(r, g, b, a)` colour, split into components. */
interface Rgba {
  readonly r: number;
  readonly g: number;
  readonly b: number;
  readonly a: number;
}

const RGB_PATTERN =
  /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+))?\s*\)$/i;

/**
 * Parses an `rgb()` / `rgba()` string.
 *
 * Throws on anything else — every colour in the app comes from the theme, so an
 * unparseable value is a programming error, not user input.
 */
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

/**
 * Reads a gradient stop.
 *
 * Throws rather than returning undefined: every caller has already established
 * the index is in range, and an out-of-range one is a bug in the arithmetic
 * above rather than something to degrade around.
 */
function stopAt(colors: readonly string[], index: number): string {
  const color = colors[index];
  if (color === undefined) {
    throw new Error(`Gradient has no stop at index ${index}`);
  }

  return color;
}

/**
 * Samples a multi-stop gradient at a position.
 *
 * Stops are treated as evenly spaced, matching the Flutter `ColorHelper`.
 *
 * @param colors - The gradient stops, at least one.
 * @param position - Where to sample, clamped to 0..1.
 * @returns The interpolated colour as an `rgba()` string.
 * @throws If `colors` is empty.
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

/** Returns `color` with its alpha replaced. */
export function withAlpha(color: string, alpha: number): string {
  return formatRgba({ ...parseRgba(color), a: alpha });
}

interface FlattenOntoParams {
  /** The colour to flatten; its own alpha is ignored. */
  readonly color: string;
  /** The opaque colour behind it. */
  readonly backdrop: string;
  /** How much of `color` survives, 0..1. */
  readonly alpha: number;
}

/**
 * Flattens a translucent colour onto an opaque backdrop.
 *
 * The result is what `color` at `alpha` looks like over `backdrop`, carrying no
 * alpha of its own. Gradient stops need this: Firefox draws a ramp as one span
 * per pair of stops, and the two spans meeting at a stop both cover that pixel
 * column in full — so a translucent stop is composited twice there and the ramp
 * grows a hairline of the pure stop colour at every stop. An opaque stop
 * painted twice is the same colour, which is the only way to be rid of it;
 * moving the alpha onto the element does not work, because Gecko folds the
 * opacity of an element whose only content is a background straight back into
 * that background.
 *
 * @returns The flattened, fully opaque colour.
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

/**
 * The number of 30-minute buckets the travel-time ramp spans.
 *
 * 36 buckets × 30 minutes = 18 hours, which is what the legend's `18h+` label
 * means: anything longer saturates at the far end of the gradient.
 *
 * Changing this changes what the legend is claiming, so retune
 * `TimeGradientLegend`'s three labels — end, midpoint, end — with it.
 */
const GRADIENT_BUCKETS = 36;

/**
 * Maps a travel time onto its position along the travel-time ramp.
 *
 * This is the one definition of that mapping. Markers, polylines, list rows and
 * the legend all go through it so a duration always yields the same colour.
 *
 * @returns A position in 0..1, saturating at 18 hours.
 */
function durationToGradientPosition(durationMinutes: number): number {
  const bucket = Math.min(
    Math.max(Math.floor(durationMinutes / 30), 0),
    GRADIENT_BUCKETS
  );

  return bucket / GRADIENT_BUCKETS;
}

export interface ColorForDurationParams {
  /** The ramp to sample, normally `theme.colors.timelineGradient`. */
  readonly gradient: readonly string[];
  /** Travel time in minutes. */
  readonly durationMinutes: number;
  /** Optional opacity to apply. */
  readonly alpha?: number;
}

/** Returns the travel-time colour for a duration. */
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
