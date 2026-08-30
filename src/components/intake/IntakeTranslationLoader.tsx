"use client";

import { useEffect } from "react";
import { useIntakeStore } from "@/hooks/use-intake-store";
import { prefetchIntakeTranslations } from "@/lib/i18n/prefetch-intake-translations";
import { hasStaticTranslations } from "@/lib/i18n/static-languages";

export function IntakeTranslationLoader({ children }: { children: React.ReactNode }) {
  const lang = useIntakeStore((s) => s.preferredLanguage);

  useEffect(() => {
    if (hasStaticTranslations(lang)) return;
    void prefetchIntakeTranslations(lang);
  }, [lang]);

  return <>{children}</>;
}
