/** An `rgb(r, g, b)` / `rgba(r, g, b, a)` colour, split into components. */
interface Rgba {
  r: number;
  g: number;
  b: number;
  a: number;
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
  const round = (value: number) => Math.round(value);
  return `rgba(${round(r)}, ${round(g)}, ${round(b)}, ${a})`;
}

/**
 * Samples a multi-stop gradient at a position.
 *
 * Stops are treated as evenly spaced, matching the Flutter `ColorHelper`.
 *
 * Parameters:
 * - colors: the gradient stops, at least one
 * - position: where to sample, clamped to 0..1
 *
 * Returns:
 * - the interpolated colour as an `rgba()` string
 */
export function interpolateColors(
  colors: readonly string[],
  position: number
): string {
  const first = colors[0];
  if (first === undefined)
    throw new Error('Cannot interpolate an empty gradient');

  const last = colors[colors.length - 1] as string;
  if (colors.length === 1 || position <= 0) return first;
  if (position >= 1) return last;

  const segmentLength = 1 / (colors.length - 1);
  const segmentIndex = Math.floor(position / segmentLength);
  const localPosition =
    (position - segmentIndex * segmentLength) / segmentLength;

  const start = parseRgba(colors[segmentIndex] as string);
  const end = parseRgba(colors[segmentIndex + 1] as string);

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
 * Parameters:
 * - color: the colour to flatten; its own alpha is ignored
 * - backdrop: the opaque colour behind it
 * - alpha: how much of `color` survives, 0..1
 *
 * Returns:
 * - the flattened, fully opaque colour
 */
export function flattenOnto({
  color,
  backdrop,
  alpha,
}: {
  color: string;
  backdrop: string;
  alpha: number;
}): string {
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
 * 28 buckets × 30 minutes = 14 hours, which is what the legend's `14h+` label
 * means: anything longer saturates at the far end of the gradient.
 */
const GRADIENT_BUCKETS = 36;

/**
 * Maps a travel time onto its position along the travel-time ramp.
 *
 * This is the one definition of that mapping. Markers, polylines, list rows and
 * the legend all go through it so a duration always yields the same colour.
 *
 * Parameters:
 * - durationMinutes: travel time in minutes
 *
 * Returns:
 * - a position in 0..1, saturating at 14 hours
 */
function durationToGradientPosition(durationMinutes: number): number {
  const bucket = Math.min(
    Math.max(Math.floor(durationMinutes / 30), 0),
    GRADIENT_BUCKETS
  );

  return bucket / GRADIENT_BUCKETS;
}

/**
 * Returns the travel-time colour for a duration.
 *
 * Parameters:
 * - gradient: the ramp to sample, normally `theme.colors.timelineGradient`
 * - durationMinutes: travel time in minutes
 * - alpha: optional opacity to apply
 */
export function colorForDuration(
  gradient: readonly string[],
  durationMinutes: number,
  alpha?: number
): string {
  const color = interpolateColors(
    gradient,
    durationToGradientPosition(durationMinutes)
  );

  return alpha === undefined ? color : withAlpha(color, alpha);
}
