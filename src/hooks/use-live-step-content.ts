"use client";

import { useEffect, useMemo, useState } from "react";
import type { FlowStep } from "@/lib/engine/question-flow";
import { getLocalizedOptions, getStepPrompt } from "@/lib/engine/normalize";
import { hasStaticTranslations } from "@/lib/i18n/static-languages";
import { getCachedTranslation } from "@/lib/i18n/translation-cache";
import {
  translateManyToLanguage,
  TranslationUnavailableError,
} from "@/lib/i18n/translation-runtime";
import { useLiveText } from "@/hooks/use-live-text";

export function useLiveStepContent(lang: string, step: FlowStep) {
  const englishPrompt = useMemo(
    () =>
      getStepPrompt(
        "en",
        step.questionKey,
        step.rowKey,
        step.followupKey,
        step.columnKey
      ),
    [step]
  );

  const staticPrompt = useMemo(() => {
    if (!hasStaticTranslations(lang)) return null;
    return getStepPrompt(
      lang,
      step.questionKey,
      step.rowKey,
      step.followupKey,
      step.columnKey
    );
  }, [lang, step]);

  const livePrompt = useLiveText(lang, englishPrompt, !hasStaticTranslations(lang));

  const englishOptions = useMemo(() => {
    if (!step.options) return [];
    return getLocalizedOptions("en", step.questionKey, step.options, step.followupKey, step.columnKey);
  }, [step]);

  const [options, setOptions] = useState(englishOptions);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [optionsError, setOptionsError] = useState<string | null>(null);

  useEffect(() => {
    if (!step.options) {
      setOptions([]);
      return;
    }

    if (hasStaticTranslations(lang)) {
      setOptions(getLocalizedOptions(lang, step.questionKey, step.options, step.followupKey, step.columnKey));
      setOptionsError(null);
      return;
    }

    let cancelled = false;
    setOptionsLoading(true);
    setOptionsError(null);

    const labels = englishOptions.map((opt) => opt.label);
    const allCached = labels.every((label) => getCachedTranslation(lang, label));

    if (allCached) {
      setOptions(
        englishOptions.map((opt) => ({
          ...opt,
          label: getCachedTranslation(lang, opt.label) ?? opt.label,
        }))
      );
      setOptionsLoading(false);
      return;
    }

    translateManyToLanguage(labels, lang)
      .then((translated) => {
        if (cancelled) return;
        setOptions(
          englishOptions.map((opt, index) => ({
            ...opt,
            label: translated[index] ?? opt.label,
          }))
        );
        setOptionsLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setOptions(englishOptions);
        setOptionsLoading(false);
        setOptionsError(
          err instanceof TranslationUnavailableError
            ? err.message
            : "Could not translate options"
        );
      });

    return () => {
      cancelled = true;
    };
  }, [lang, step, englishOptions]);

  return {
    prompt: staticPrompt ?? livePrompt.text,
    englishPrompt,
    promptLoading: !staticPrompt && livePrompt.loading,
    promptError: livePrompt.error,
    options,
    englishOptions,
    optionsLoading,
    optionsError,
    loading: false,
    translating:
      (!staticPrompt && livePrompt.loading) ||
      (!hasStaticTranslations(lang) && Boolean(step.options) && optionsLoading),
    error: livePrompt.error ?? optionsError,
  };
}
