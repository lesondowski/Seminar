const translationCache = new Map();

const cacheKey = (text, from, to) => `${from}::${to}::${text}`;

export async function translateNarration({ text, from, to }) {
  if (!text?.trim()) {
    return { translatedText: '', fromLanguage: from, toLanguage: to, provider: 'empty' };
  }

  if (from === to) {
    return { translatedText: text, fromLanguage: from, toLanguage: to, provider: 'identity' };
  }

  const key = cacheKey(text, from, to);
  if (translationCache.has(key)) {
    return { ...translationCache.get(key), cached: true };
  }

  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, from, to }),
    });

    if (!response.ok) {
      throw new Error('translate-api-failed');
    }

    const data = await response.json();
    translationCache.set(key, data);
    return { ...data, cached: false };
  } catch {
    // Dev fallback so UI can still verify language switching behavior.
    const fallback = {
      translatedText: `[${to.toUpperCase()}] ${text}`,
      fromLanguage: from,
      toLanguage: to,
      provider: 'fallback-local',
    };
    translationCache.set(key, fallback);
    return { ...fallback, cached: false };
  }
}
