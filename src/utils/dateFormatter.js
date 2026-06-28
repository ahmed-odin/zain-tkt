/**
 * Format date string to HH:MM:SS DD/MM/YYYY format
 */
export function formatDateTime(date) {
  if (!date) return 'N/A';

  const d = new Date(date);
  if (Number.isNaN(d.getTime())) {
    return 'N/A';
  }

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return `${hours}:${minutes}:${seconds} ${day}/${month}/${year}`;
}

/**
 * Get current date in ISO string format for storage
 */
export function getCurrentDateTime() {
  return new Date().toISOString();
}

/**
 * Convert a local calendar date (YYYY-MM-DD) to the UTC ISO timestamp of the
 * START of that local day, so server-side date filters match what the user
 * sees regardless of timezone.
 */
export function localDayStartUtc(dateStr) {
  if (!dateStr) return null;
  const d = new Date(`${dateStr}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/**
 * Convert a local calendar date (YYYY-MM-DD) to the UTC ISO timestamp of the
 * END of that local day.
 */
export function localDayEndUtc(dateStr) {
  if (!dateStr) return null;
  const d = new Date(`${dateStr}T23:59:59.999`);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/**
 * Truncate string to max length
 */
export function truncateString(str, maxLength) {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + '...';
}
