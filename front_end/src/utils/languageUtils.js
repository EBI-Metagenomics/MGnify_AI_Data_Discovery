/**
 * Utility functions for language and internationalization
 */

/**
 * Get text in the selected language
 * @param {string} en - English text
 * @param {string} fr - French text
 * @param {string} zh - Chinese text
 * @param {string} language - Selected language code ('en', 'fr', or 'zh')
 * @returns {string} - Text in the selected language
 */
export const getText = (en, fr, zh, language) => {
  if (language === "fr") return fr;
  if (language === "zh") return zh;
  return en; // Default to English
};