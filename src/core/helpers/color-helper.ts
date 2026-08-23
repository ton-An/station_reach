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

interface Oklab {
  readonly l: number;
  readonly a: number;
  readonly b: number;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

function toLinear(channel: number): number {
  const c = channel / 255;

  return c > 0.04045 ? ((c + 0.055) / 1.055) ** 2.4 : c / 12.92;
}

function toGamma(channel: number): number {
  const c = clamp(channel, 0, 1);

  return 255 * (c > 0.0031308 ? 1.055 * c ** (1 / 2.4) - 0.055 : 12.92 * c);
}

// Björn Ottosson's Oklab matrices, https://bottosson.github.io/posts/oklab/.
function rgbToOklab({ r, g, b }: Rgba): Oklab {
  const lr = toLinear(r);
  const lg = toLinear(g);
  const lb = toLinear(b);

  const l = Math.cbrt(
    0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb
  );
  const m = Math.cbrt(
    0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb
  );
  const s = Math.cbrt(
    0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb
  );

  return {
    l: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    a: 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    b: 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  };
}

/**
 * Inverse of {@link rgbToOklab}. A straight line between two in-gamut
 * colours can leave sRGB, so each channel is clamped back into it.
 */
function oklabToRgb({ l, a, b }: Oklab): Omit<Rgba, 'a'> {
  const lCube = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const mCube = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const sCube = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;

  return {
    r: toGamma(
      4.0767416621 * lCube - 3.3077115913 * mCube + 0.2309699292 * sCube
    ),
    g: toGamma(
      -1.2684380046 * lCube + 2.6097574011 * mCube - 0.3413193965 * sCube
    ),
    b: toGamma(
      -0.0041960863 * lCube - 0.7034186147 * mCube + 1.707614701 * sCube
    ),
  };
}

function stopAt(colors: readonly string[], index: number): string {
  const color = colors[index];
  if (color === undefined) {
    throw new Error(`Gradient has no stop at index ${index}`);
  }

  return color;
}

/**
 * Interpolates `colors` at `position`, in Oklab.
 *
 * Mixing in Oklab rather than sRGB keeps the midpoint between two saturated
 * stops as saturated as the stops themselves; an sRGB mix dips through a
 * greyer, darker colour there and reads as a band.
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
  const startLab = rgbToOklab(start);
  const endLab = rgbToOklab(end);

  return formatRgba({
    ...oklabToRgb({
      l: lerp(startLab.l, endLab.l),
      a: lerp(startLab.a, endLab.a),
      b: lerp(startLab.b, endLab.b),
    }),
    a: lerp(start.a, end.a),
  });
}

/**
 * Samples `colors` at `count` evenly spaced positions.
 *
 * For a consumer that mixes its own stops in sRGB — `LinearGradient` does —
 * and so needs the Oklab curve of {@link interpolateColors} handed to it
 * already resolved.
 *
 * @param colors - The gradient stops, as `rgb()`/`rgba()` strings.
 * @param count - How many samples to take; the first and last land on the
 * gradient's end stops.
 * @returns The samples, as `rgba()` strings.
 * @throws Error if `count` is below 2, or if `colors` is empty.
 */
export function resampleGradient(
  colors: readonly string[],
  count: number
): readonly [string, string, ...string[]] {
  if (count < 2) {
    throw new Error(`Cannot resample a gradient to ${count} stops`);
  }

  const sample = (index: number) =>
    interpolateColors(colors, index / (count - 1));
  const rest = Array.from({ length: count - 2 }, (_, i) => sample(i + 2));

  return [sample(0), sample(1), ...rest];
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

const MAX_DURATION_MINUTES = 18 * 60;

/**
 * How many colours the scale is quantised to, so a map of markers reads as
 * a few bands rather than a smear. Quantising the position rather than the
 * duration keeps every band the same size to the eye.
 */
const GRADIENT_BANDS = 36;

/**
 * Bends the scale towards short travel times, so an hour near the start of
 * it moves the colour further than an hour near the end. The stops a
 * station reaches pile up in the first few hours and thin out long before
 * eighteen, and a scale linear in time spends most of its colour on
 * durations almost nothing has.
 *
 * The constant is the time the log curve is scaled by. It is a third of
 * {@link MAX_DURATION_MINUTES}, which is what puts the halfway mark of the
 * scale on the constant itself — six hours, as the legend labels it.
 */
const DURATION_SCALE_MINUTES = 6 * 60;

const CURVE_CEILING = Math.log1p(MAX_DURATION_MINUTES / DURATION_SCALE_MINUTES);

function durationToGradientPosition(durationMinutes: number): number {
  const clamped = clamp(durationMinutes, 0, MAX_DURATION_MINUTES);
  const position = Math.log1p(clamped / DURATION_SCALE_MINUTES) / CURVE_CEILING;

  return Math.round(position * GRADIENT_BANDS) / GRADIENT_BANDS;
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
 * Clamps `durationMinutes` at 18 hours, maps it onto the scale — short
 * times get more of it, see {@link DURATION_SCALE_MINUTES} — and quantises
 * the result to {@link GRADIENT_BANDS} colours.
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
