import { formatDuration } from './duration-helper';

describe('formatDuration', () => {
  it('shows minutes under an hour', () => {
    expect(formatDuration(0)).toBe('0m');
    expect(formatDuration(45)).toBe('45m');
  });

  it('shows hours and minutes at or above an hour', () => {
    expect(formatDuration(60)).toBe('1h 0m');
    expect(formatDuration(125)).toBe('2h 5m');
  });

  it('truncates rather than rounding up across the hour boundary', () => {
    expect(formatDuration(59.9)).toBe('59m');
  });

  it('clamps negatives to zero', () => {
    expect(formatDuration(-5)).toBe('0m');
  });
});
