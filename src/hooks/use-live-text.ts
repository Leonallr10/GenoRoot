"use client";

import { useEffect, useState } from "react";
import { hasStaticTranslations } from "@/lib/i18n/static-languages";
import {
  getCachedTranslation,
  translateToLanguage,
  TranslationUnavailableError,
} from "@/lib/i18n/translation-runtime";

export function useLiveText(
  targetLang: string,
  sourceText: string,
  enabled = true
): { text: string; loading: boolean; error: string | null } {
  const [text, setText] = useState(sourceText);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || hasStaticTranslations(targetLang) || targetLang === "en") {
      setText(sourceText);
      setLoading(false);
      setError(null);
      return;
    }

    const cached = getCachedTranslation(targetLang, sourceText);
    if (cached) {
      setText(cached);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    translateToLanguage(sourceText, targetLang)
      .then((translated) => {
        if (!cancelled) {
          setText(translated);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setText(sourceText);
          setLoading(false);
          setError(
            err instanceof TranslationUnavailableError
              ? err.message
              : "Translation failed"
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [targetLang, sourceText, enabled]);

  return { text, loading, error };
}
