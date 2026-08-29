"use client";

import { useEffect, useState } from "react";
import { useIntakeStore } from "@/hooks/use-intake-store";
import { hasStaticTranslations } from "@/lib/i18n/static-languages";
import { t } from "@/lib/i18n/translations";
import type { TranslationDict } from "@/lib/i18n/translations/en";
import { useLiveText } from "@/hooks/use-live-text";

export function useLiveT(
  lang: string,
  key: keyof Omit<TranslationDict, "sections" | "questions">,
  vars?: Record<string, string | number>
): string {
  const english = t("en", key, vars);
  const localized = hasStaticTranslations(lang) ? t(lang, key, vars) : null;
  const live = useLiveText(lang, english, !hasStaticTranslations(lang));
  return localized ?? live.text;
}

export function useStoreHydrated(): boolean {
  const [hydrated, setHydrated] = useState(() => useIntakeStore.persist.hasHydrated());

  useEffect(() => {
    return useIntakeStore.persist.onFinishHydration(() => setHydrated(true));
  }, []);

  return hydrated;
}
