/**
 * Formats a travel time for display.
 *
 * Under an hour it reads as `45m`; at or above one it reads as `2h 5m`.
 * Ported from the Flutter `TimeDateFormatter.formatDuration`.
 *
 * Parameters:
 * - durationMinutes: travel time in minutes
 *
 * Returns:
 * - the formatted duration
 */
export function formatDuration(durationMinutes: number): string {
  // Truncate, matching Dart's `Duration.inMinutes`, so a 59.9-minute leg still
  // reads as `59m` rather than rounding up to a misleading `1h 0m`.
  const total = Math.max(Math.trunc(durationMinutes), 0);
  const hours = Math.floor(total / 60);

  if (hours > 0) return `${hours}h ${total % 60}m`;

  return `${total}m`;
}
