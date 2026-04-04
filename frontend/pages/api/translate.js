export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { text, from, to } = req.body || {};

  if (!text || !from || !to) {
    return res.status(400).json({ message: 'Missing text/from/to' });
  }

  if (from === to) {
    return res.status(200).json({
      translatedText: text,
      fromLanguage: from,
      toLanguage: to,
      provider: 'identity',
    });
  }

  try {
    const endpoint = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(
      from
    )}&tl=${encodeURIComponent(to)}&dt=t&q=${encodeURIComponent(text)}`;

    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`translate-http-${response.status}`);
    }

    const raw = await response.json();
    const translatedText = Array.isArray(raw?.[0])
      ? raw[0].map((seg) => seg?.[0] || '').join('')
      : '';

    if (!translatedText) {
      throw new Error('translate-empty');
    }

    return res.status(200).json({
      translatedText,
      fromLanguage: from,
      toLanguage: to,
      provider: 'google-gtx',
    });
  } catch {
    // Fallback: still return a deterministic string so UI can continue to function.
    return res.status(200).json({
      translatedText: `[${to.toUpperCase()}] ${text}`,
      fromLanguage: from,
      toLanguage: to,
      provider: 'fallback-local',
    });
  }
}
