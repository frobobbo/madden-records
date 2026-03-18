/**
 * Format a date string from the API (may be "YYYY-MM-DD" or a full ISO
 * timestamp like "2026-01-27T00:00:00.000Z") into a locale date string.
 * Uses the local-time Date constructor to avoid UTC timezone shift.
 */
export function formatDate(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.slice(0, 10).split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    month: 'numeric', day: 'numeric', year: 'numeric',
  });
}
