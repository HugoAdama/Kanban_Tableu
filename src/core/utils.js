// Core Utilities and Sanitization Helpers

/**
 * Escapes HTML characters to prevent XSS injection in dynamic templates.
 * @param {string|null|undefined} str - Raw string
 * @returns {string} Sanitized string safe for HTML interpolation
 */
export function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Capitalizes the first character of a string.
 * @param {string} str - Input text
 * @returns {string} Capitalized text
 */
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Safely truncates a string with an ellipsis if it exceeds the limit.
 * @param {string} str - Input text
 * @param {number} maxLength - Character threshold
 * @returns {string} Truncated string
 */
export function truncate(str, maxLength = 100) {
  if (!str || str.length <= maxLength) return str || '';
  return str.slice(0, maxLength).trim() + '...';
}

/**
 * Generates a clean readable date string (e.g., "15 oct").
 * @param {string|Date} dateVal - Date ISO string or object
 * @returns {string} Short formatted date
 */
export function formatShortDate(dateVal) {
  if (!dateVal) return '';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return String(dateVal);
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}
