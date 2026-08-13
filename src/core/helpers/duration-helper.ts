export function formatDuration(durationMinutes: number): string {
  const total = Math.max(Math.trunc(durationMinutes), 0);
  const hours = Math.floor(total / 60);

  if (hours > 0) return `${hours}h ${total % 60}m`;

  return `${total}m`;
}
