export const WORLD_LANGUAGES = [
  { code: 'vi', label: 'Vietnamese' },
  { code: 'en', label: 'English' },
  { code: 'zh', label: 'Chinese' },
  { code: 'ja', label: 'Japanese' },
  { code: 'ko', label: 'Korean' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
  { code: 'es', label: 'Spanish' },
  { code: 'pt', label: 'Portuguese' },
  { code: 'it', label: 'Italian' },
  { code: 'ru', label: 'Russian' },
  { code: 'ar', label: 'Arabic' },
  { code: 'hi', label: 'Hindi' },
  { code: 'th', label: 'Thai' },
  { code: 'id', label: 'Indonesian' },
  { code: 'tr', label: 'Turkish' },
  { code: 'nl', label: 'Dutch' },
  { code: 'pl', label: 'Polish' },
  { code: 'sv', label: 'Swedish' },
  { code: 'uk', label: 'Ukrainian' },
];

export const languageLabel = (code) => {
  const found = WORLD_LANGUAGES.find((lang) => lang.code === code);
  return found ? found.label : code.toUpperCase();
};

export const toSpeechLang = (code) => {
  const map = {
    vi: 'vi-VN',
    en: 'en-US',
    zh: 'zh-CN',
    ja: 'ja-JP',
    ko: 'ko-KR',
    fr: 'fr-FR',
    de: 'de-DE',
    es: 'es-ES',
    pt: 'pt-BR',
    it: 'it-IT',
    ru: 'ru-RU',
    ar: 'ar-SA',
    hi: 'hi-IN',
    th: 'th-TH',
    id: 'id-ID',
    tr: 'tr-TR',
    nl: 'nl-NL',
    pl: 'pl-PL',
    sv: 'sv-SE',
    uk: 'uk-UA',
  };
  return map[code] || 'en-US';
};