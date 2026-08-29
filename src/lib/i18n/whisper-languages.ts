export type WhisperLanguage = {
  code: string;
  name: string;
  nativeName: string;
  /** True when Whisper STT + live UI translation are available. */
  supported: boolean;
  /** True for en with hand-written translation files. */
  hasStaticUi: boolean;
};

/** ISO 639-1 codes supported by OpenAI Whisper (large-v3). */
const WHISPER_LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  zh: "Chinese",
  de: "German",
  es: "Spanish",
  ru: "Russian",
  ko: "Korean",
  fr: "French",
  ja: "Japanese",
  pt: "Portuguese",
  tr: "Turkish",
  pl: "Polish",
  ca: "Catalan",
  nl: "Dutch",
  ar: "Arabic",
  sv: "Swedish",
  it: "Italian",
  id: "Indonesian",
  hi: "Hindi",
  fi: "Finnish",
  vi: "Vietnamese",
  he: "Hebrew",
  uk: "Ukrainian",
  el: "Greek",
  ms: "Malay",
  cs: "Czech",
  ro: "Romanian",
  da: "Danish",
  hu: "Hungarian",
  ta: "Tamil",
  no: "Norwegian",
  th: "Thai",
  ur: "Urdu",
  hr: "Croatian",
  bg: "Bulgarian",
  lt: "Lithuanian",
  la: "Latin",
  mi: "Maori",
  ml: "Malayalam",
  cy: "Welsh",
  sk: "Slovak",
  te: "Telugu",
  fa: "Persian",
  lv: "Latvian",
  bn: "Bengali",
  sr: "Serbian",
  az: "Azerbaijani",
  sl: "Slovenian",
  kn: "Kannada",
  et: "Estonian",
  mk: "Macedonian",
  br: "Breton",
  eu: "Basque",
  is: "Icelandic",
  hy: "Armenian",
  ne: "Nepali",
  mn: "Mongolian",
  bs: "Bosnian",
  kk: "Kazakh",
  sq: "Albanian",
  sw: "Swahili",
  gl: "Galician",
  mr: "Marathi",
  pa: "Punjabi",
  si: "Sinhala",
  km: "Khmer",
  sn: "Shona",
  yo: "Yoruba",
  so: "Somali",
  af: "Afrikaans",
  oc: "Occitan",
  ka: "Georgian",
  be: "Belarusian",
  tg: "Tajik",
  sd: "Sindhi",
  gu: "Gujarati",
  am: "Amharic",
  yi: "Yiddish",
  lo: "Lao",
  uz: "Uzbek",
  fo: "Faroese",
  ht: "Haitian Creole",
  ps: "Pashto",
  tk: "Turkmen",
  nn: "Nynorsk",
  mt: "Maltese",
  sa: "Sanskrit",
  lb: "Luxembourgish",
  my: "Myanmar",
  bo: "Tibetan",
  tl: "Tagalog",
  mg: "Malagasy",
  as: "Assamese",
  tt: "Tatar",
  haw: "Hawaiian",
  ln: "Lingala",
  ha: "Hausa",
  ba: "Bashkir",
  jw: "Javanese",
  su: "Sundanese",
  yue: "Cantonese",
  or: "Odia",
};

const STATIC_UI_CODES = new Set(["en"]);

const NATIVE_NAME_OVERRIDES: Record<string, string> = {
  en: "English",
  ta: "தமிழ்",
  hi: "हिन्दी",
  te: "తెలుగు",
  bn: "বাংলা",
  gu: "ગુજરાતી",
  kn: "ಕನ್ನಡ",
  ml: "മലയാളം",
  mr: "मराठी",
  pa: "ਪੰਜਾਬੀ",
  ur: "اردو",
  or: "ଓଡ଼ିଆ",
  as: "অসমীয়া",
};

export const WHISPER_LANGUAGE_CODES = Object.keys(WHISPER_LANGUAGE_NAMES);

export const WHISPER_LANGUAGES: WhisperLanguage[] = Object.entries(WHISPER_LANGUAGE_NAMES).map(
  ([code, name]) => {
    return {
      code,
      name,
      nativeName: NATIVE_NAME_OVERRIDES[code] ?? name,
      supported: true,
      hasStaticUi: STATIC_UI_CODES.has(code),
    };
  }
);

export function getWhisperLanguage(code: string): WhisperLanguage | undefined {
  return WHISPER_LANGUAGES.find((l) => l.code === code);
}

export function isWhisperLanguage(code: string): boolean {
  return WHISPER_LANGUAGE_CODES.includes(code);
}

export function searchWhisperLanguages(query: string, limit = 40): WhisperLanguage[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const score = (lang: WhisperLanguage): number => {
    const name = lang.name.toLowerCase();
    const native = lang.nativeName.toLowerCase();
    const code = lang.code.toLowerCase();

    if (code === q || name === q || native === q) return 0;
    if (name.startsWith(q) || native.startsWith(q) || code.startsWith(q)) return 1;
    if (name.includes(q) || native.includes(q)) return 2;
    return 3;
  };

  return WHISPER_LANGUAGES.filter(
    (lang) =>
      lang.name.toLowerCase().includes(q) ||
      lang.nativeName.toLowerCase().includes(q) ||
      lang.code.toLowerCase().includes(q)
  )
    .sort((a, b) => score(a) - score(b) || a.name.localeCompare(b.name))
    .slice(0, limit);
}
