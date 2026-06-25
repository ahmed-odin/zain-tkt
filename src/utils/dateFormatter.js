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
 * Truncate string to max length
 */
export function truncateString(str, maxLength) {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + '...';
}
