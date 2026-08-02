import {
  colorForDuration,
  durationToGradientPosition,
  GRADIENT_BUCKETS,
  interpolateColors,
  withAlpha,
} from './color-helper';

const RAMP = ['rgb(0, 0, 0)', 'rgb(100, 100, 100)', 'rgb(200, 200, 200)'];

describe('interpolateColors', () => {
  it('returns the first stop at or below 0', () => {
    expect(interpolateColors(RAMP, 0)).toBe('rgb(0, 0, 0)');
    expect(interpolateColors(RAMP, -1)).toBe('rgb(0, 0, 0)');
  });

  it('returns the last stop at or above 1', () => {
    expect(interpolateColors(RAMP, 1)).toBe('rgb(200, 200, 200)');
    expect(interpolateColors(RAMP, 5)).toBe('rgb(200, 200, 200)');
  });

  it('lands exactly on an interior stop', () => {
    expect(interpolateColors(RAMP, 0.5)).toBe('rgba(100, 100, 100, 1)');
  });

  it('interpolates within a segment', () => {
    expect(interpolateColors(RAMP, 0.25)).toBe('rgba(50, 50, 50, 1)');
  });

  it('handles a single-stop gradient', () => {
    expect(interpolateColors(['rgb(1, 2, 3)'], 0.7)).toBe('rgb(1, 2, 3)');
  });

  it('rejects an empty gradient rather than guessing', () => {
    expect(() => interpolateColors([], 0.5)).toThrow();
  });
});

describe('durationToGradientPosition', () => {
  it('starts at zero', () => {
    expect(durationToGradientPosition(0)).toBe(0);
    expect(durationToGradientPosition(29)).toBe(0);
  });

  it('advances one bucket per half hour', () => {
    expect(durationToGradientPosition(30)).toBe(1 / GRADIENT_BUCKETS);
    expect(durationToGradientPosition(90)).toBe(3 / GRADIENT_BUCKETS);
  });

  it('saturates at 14 hours, which is what the legend promises', () => {
    expect(durationToGradientPosition(14 * 60)).toBe(1);
    expect(durationToGradientPosition(40 * 60)).toBe(1);
  });

  it('never goes negative', () => {
    expect(durationToGradientPosition(-120)).toBe(0);
  });
});

describe('colorForDuration', () => {
  it('applies alpha when asked', () => {
    expect(colorForDuration(RAMP, 0, 0.5)).toBe('rgba(0, 0, 0, 0.5)');
  });
});

describe('withAlpha', () => {
  it('replaces the alpha channel', () => {
    expect(withAlpha('rgba(10, 20, 30, 0.2)', 0.9)).toBe(
      'rgba(10, 20, 30, 0.9)'
    );
  });
});
