"use client";

import {
  getCachedTranslation,
  setCachedTranslation,
} from "@/lib/i18n/translation-cache";

export { getCachedTranslation, setCachedTranslation, primeTranslationCache, clearTranslationCache } from "@/lib/i18n/translation-cache";

export class TranslationUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TranslationUnavailableError";
  }
}

export async function translateToLanguage(text: string, targetLang: string): Promise<string> {
  if (!text.trim() || targetLang === "en") return text;

  const cached = getCachedTranslation(targetLang, text);
  if (cached) return cached;

  const res = await fetch("/api/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text,
      language: targetLang,
      direction: "fromEnglish",
    }),
  });

  const data = (await res.json()) as {
    translation?: string;
    error?: string;
  };

  if (!res.ok) {
    throw new TranslationUnavailableError(
      data.error ?? "Translation service unavailable. Add HF_TOKEN to .env.local."
    );
  }

  const translated = data.translation?.trim() || text;
  setCachedTranslation(targetLang, text, translated);
  return translated;
}

export async function translateManyToLanguage(
  texts: string[],
  targetLang: string
): Promise<string[]> {
  if (targetLang === "en") return texts;

  const unique = [...new Set(texts)];
  const pending = unique.filter((text) => !getCachedTranslation(targetLang, text));

  if (pending.length > 0) {
    const res = await fetch("/api/translate/batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        texts: pending,
        sourceLang: "en",
        targetLang,
      }),
    });

    const data = (await res.json()) as {
      translations?: string[];
      error?: string;
    };

    if (!res.ok) {
      throw new TranslationUnavailableError(
        data.error ?? "Translation service unavailable. Add HF_TOKEN to .env.local."
      );
    }

    const translations = data.translations ?? pending;
    pending.forEach((source, index) => {
      setCachedTranslation(targetLang, source, translations[index] ?? source);
    });
  }

  return texts.map((text) => getCachedTranslation(targetLang, text) ?? text);
}
