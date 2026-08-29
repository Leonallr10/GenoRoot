import {
  getWhisperLanguage,
  isWhisperLanguage,
  WHISPER_LANGUAGES,
} from "./whisper-languages";
import { hasStaticTranslations } from "./static-languages";

export type Language = {
  code: string;
  name: string;
  nativeName: string;
  speechLocale: string;
  supported: boolean;
  hasStaticUi: boolean;
};

export const LANGUAGES: Language[] = [
  { code: "en", name: "English", nativeName: "English", speechLocale: "en-IN", supported: true, hasStaticUi: true },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்", speechLocale: "ta-IN", supported: true, hasStaticUi: true },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", speechLocale: "hi-IN", supported: true, hasStaticUi: true },
  { code: "te", name: "Telugu", nativeName: "తెలుగు", speechLocale: "te-IN", supported: true, hasStaticUi: false },
  { code: "bn", name: "Bengali", nativeName: "বাংলা", speechLocale: "bn-IN", supported: true, hasStaticUi: false },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી", speechLocale: "gu-IN", supported: true, hasStaticUi: false },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ", speechLocale: "kn-IN", supported: true, hasStaticUi: false },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം", speechLocale: "ml-IN", supported: true, hasStaticUi: false },
  { code: "mr", name: "Marathi", nativeName: "मराठी", speechLocale: "mr-IN", supported: true, hasStaticUi: false },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", speechLocale: "pa-IN", supported: true, hasStaticUi: false },
  { code: "ur", name: "Urdu", nativeName: "اردو", speechLocale: "ur-PK", supported: true, hasStaticUi: false },
  { code: "or", name: "Odia", nativeName: "ଓଡ଼ିଆ", speechLocale: "or-IN", supported: true, hasStaticUi: false },
  { code: "as", name: "Assamese", nativeName: "অসমীয়া", speechLocale: "as-IN", supported: true, hasStaticUi: false },
];

const SPEECH_LOCALE_OVERRIDES: Record<string, string> = {
  en: "en-IN",
  ta: "ta-IN",
  hi: "hi-IN",
  te: "te-IN",
  bn: "bn-IN",
  gu: "gu-IN",
  kn: "kn-IN",
  ml: "ml-IN",
  mr: "mr-IN",
  pa: "pa-IN",
  ur: "ur-PK",
  or: "or-IN",
  as: "as-IN",
  ar: "ar-SA",
  zh: "zh-CN",
  ja: "ja-JP",
  ko: "ko-KR",
  fr: "fr-FR",
  de: "de-DE",
  es: "es-ES",
  pt: "pt-BR",
  ru: "ru-RU",
  th: "th-TH",
  vi: "vi-VN",
  id: "id-ID",
  ms: "ms-MY",
  tr: "tr-TR",
  it: "it-IT",
  nl: "nl-NL",
  pl: "pl-PL",
  sv: "sv-SE",
  fi: "fi-FI",
  ne: "ne-NP",
  si: "si-LK",
};

export function getSpeechLocale(code: string): string {
  return SPEECH_LOCALE_OVERRIDES[code] ?? `${code}-IN`;
}

export const SUPPORTED_LANGUAGE_CODES = WHISPER_LANGUAGES.map((l) => l.code);

/** Region hints from IANA timezone → likely spoken languages. */
const TIMEZONE_LANGUAGE_HINTS: Record<string, string[]> = {
  "Asia/Kolkata": ["hi", "ta", "te", "bn", "en"],
  "Asia/Calcutta": ["hi", "ta", "te", "bn", "en"],
  "Asia/Colombo": ["ta", "si", "en"],
  "Asia/Dhaka": ["bn", "en"],
  "Asia/Karachi": ["ur", "en"],
  "Asia/Kathmandu": ["ne", "en"],
};

/** BCP-47 region subtag → regional language hints. */
const REGION_LANGUAGE_HINTS: Record<string, string[]> = {
  IN: ["hi", "ta", "te", "bn", "en"],
  LK: ["ta", "si", "en"],
  BD: ["bn", "en"],
  PK: ["ur", "en"],
  NP: ["ne", "en"],
};

export function getLanguage(code: string): Language | undefined {
  const appLang = LANGUAGES.find((l) => l.code === code);
  if (appLang) return appLang;

  const whisper = getWhisperLanguage(code);
  if (!whisper) return undefined;

  return {
    code: whisper.code,
    name: whisper.name,
    nativeName: whisper.nativeName,
    speechLocale: getSpeechLocale(code),
    supported: true,
    hasStaticUi: whisper.hasStaticUi,
  };
}

export type LocaleHints = {
  browserLang: string;
  browserRegion?: string;
  timezone?: string;
};

export function detectLocaleHints(): LocaleHints {
  if (typeof navigator === "undefined") {
    return { browserLang: "en" };
  }

  const locale = navigator.language ?? "en";
  const parts = locale.split("-");
  const browserLang = parts[0]?.toLowerCase() ?? "en";
  const browserRegion = parts[1]?.toUpperCase();

  let timezone: string | undefined;
  try {
    timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    timezone = undefined;
  }

  return { browserLang, browserRegion, timezone };
}

export function getSuggestedLanguages(hints?: LocaleHints): Language[] {
  const { browserLang, browserRegion, timezone } = hints ?? detectLocaleHints();
  const suggestions: Language[] = [];
  const seen = new Set<string>();

  const add = (code: string) => {
    if (seen.has(code)) return;
    const lang = getLanguage(code);
    if (lang) {
      seen.add(code);
      suggestions.push(lang);
    }
  };

  add(browserLang);

  if (browserRegion && REGION_LANGUAGE_HINTS[browserRegion]) {
    for (const code of REGION_LANGUAGE_HINTS[browserRegion]) {
      add(code);
    }
  }

  if (timezone && TIMEZONE_LANGUAGE_HINTS[timezone]) {
    for (const code of TIMEZONE_LANGUAGE_HINTS[timezone]) {
      add(code);
    }
  }

  add("en");

  return suggestions.slice(0, 6);
}

export function isBrowserRecommended(code: string, hints?: LocaleHints): boolean {
  const { browserLang } = hints ?? detectLocaleHints();
  return code === browserLang;
}

export function searchLanguages(query: string): Language[] {
  const q = query.trim().toLowerCase();
  if (!q) return LANGUAGES;

  let results = LANGUAGES.filter(
    (l) =>
      l.name.toLowerCase().startsWith(q) ||
      l.nativeName.toLowerCase().startsWith(q) ||
      l.code.toLowerCase().startsWith(q)
  );

  if (results.length === 0) {
    results = LANGUAGES.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.nativeName.toLowerCase().includes(q) ||
        l.code.toLowerCase().includes(q)
    );
  }

  return results;
}

export function isIntakeLanguage(code: string): boolean {
  return isWhisperLanguage(code);
}

/** @deprecated Use isIntakeLanguage */
export function isSupportedLanguage(code: string): boolean {
  return isIntakeLanguage(code);
}

export { hasStaticTranslations };
