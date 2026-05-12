/**
 * Client-side translation utility using the unofficial Google Translate endpoint.
 * No API key required. Results are cached in-memory per session.
 */

const cache = new Map();

/**
 * Translate text to a target language.
 * @param {string} text - Source text to translate.
 * @param {string} targetLang - BCP-47 language code e.g. "en", "ja", "fr".
 * @param {string} [sourceLang="auto"] - Source language code or "auto".
 * @returns {Promise<string>} - Translated text.
 */
export async function translateText(text, targetLang, sourceLang = "auto") {
  if (!text || !targetLang) return text;

  const cacheKey = `${sourceLang}:${targetLang}:${text}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(sourceLang)}&tl=${encodeURIComponent(targetLang)}&dt=t&q=${encodeURIComponent(text)}`;

  const response = await fetch(url);
  if (!response.ok) throw new Error(`Translation request failed: ${response.status}`);

  const data = await response.json();

  // The response is a nested array; translated segments are in data[0]
  const translated = (data[0] || [])
    .map((segment) => (Array.isArray(segment) ? segment[0] : ""))
    .filter(Boolean)
    .join("");

  if (!translated) throw new Error("Empty translation result");

  cache.set(cacheKey, translated);
  return translated;
}
