/**
 * Utility functions for formatting data
 */

/**
 * Format a JSON object as a string with proper indentation
 * @param {Object} obj - The object to format
 * @returns {string} - Formatted JSON string
 */
export const formatJSON = (obj) => {
  if (!obj) return "{}";
  try {
    return JSON.stringify(obj, null, 2);
  } catch (e) {
    return "{}";
  }
};