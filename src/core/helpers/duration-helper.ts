/**
 * Formats a duration in minutes as a human-readable string. Shows hours and
 * minutes if at least one hour, otherwise shows minutes only.
 *
 * @param durationMinutes - The duration in minutes.
 * @returns A formatted string like "2h 30m" or "45m".
 */
export function formatDuration(durationMinutes: number): string {
  const total = Math.max(Math.trunc(durationMinutes), 0);
  const hours = Math.floor(total / 60);

  if (hours > 0) return `${hours}h ${total % 60}m`;

  return `${total}m`;
}
