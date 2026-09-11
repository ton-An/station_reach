/**
 * Formats a duration as `Xh Ym`, or `Ym` under an hour.
 *
 * @param durationMinutes - The duration, in minutes. Negative and
 * fractional values clamp to zero and truncate to whole minutes.
 * @returns The formatted duration.
 */
export function formatDuration(durationMinutes: number): string {
  const total = Math.max(Math.trunc(durationMinutes), 0);
  const hours = Math.floor(total / 60);

  if (hours > 0) return `${hours}h ${total % 60}m`;

  return `${total}m`;
}
