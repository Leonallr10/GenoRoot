"use client";

import { CheckCircle2 } from "lucide-react";
import { getProgress } from "@/lib/engine/question-flow";
import { getSectionTitle } from "@/lib/i18n/translations";
import { en } from "@/lib/i18n/translations/en";
import { hasStaticTranslations } from "@/lib/i18n/static-languages";
import { useIntakeStore } from "@/hooks/use-intake-store";
import { useLiveT } from "@/hooks/use-live-t";
import { useLiveText } from "@/hooks/use-live-text";

const SEGMENTS = 8;

export function ProgressBar({ stepIndex }: { stepIndex?: number }) {
  const lang = useIntakeStore((s) => s.preferredLanguage);
  const answers = useIntakeStore((s) => s.answers);
  const storeStep = useIntakeStore((s) => s.currentStep);
  const activeStep = stepIndex ?? storeStep;
  const progress = getProgress(activeStep, answers);

  const filled = Math.max(1, Math.round((progress.percent / 100) * SEGMENTS));
  const isAlmostDone = progress.percent > 50;

  const appSubtitle = useLiveT(lang, "appSubtitle");
  const questionOf = useLiveT(lang, "questionOf", {
    current: progress.currentQuestion,
    total: progress.totalQuestions,
  });
  const aboutHalfway = useLiveT(lang, "aboutHalfway");
  const almostDone = useLiveT(lang, "almostDone");
  const englishSectionTitle = en.sections[progress.sectionId] ?? progress.sectionId;
  const staticSectionTitle = hasStaticTranslations(lang)
    ? getSectionTitle(lang, progress.sectionId)
    : null;
  const liveSection = useLiveText(lang, englishSectionTitle, !hasStaticTranslations(lang));
  const sectionTitle = staticSectionTitle ?? liveSection.text;

  return (
    <div className="shrink-0 space-y-3 px-5 pb-4 pt-3">
      <div className="flex items-center justify-between">
        <span className="text-lg font-bold text-slate-800 sm:text-xl">{appSubtitle}</span>
        <span className="text-base font-semibold text-[#c96f35] sm:text-lg">{questionOf}</span>
      </div>

      <div className="flex gap-2" aria-hidden>
        {Array.from({ length: SEGMENTS }).map((_, i) => (
          <div
            key={i}
            className={`h-2.5 flex-1 rounded-full transition-colors ${
              i < filled
                ? "bg-gradient-to-r from-[#e8894a] to-[#f0a060]"
                : "bg-white/75"
            }`}
          />
        ))}
      </div>

      <div className="flex items-center gap-2">
        {isAlmostDone && (
          <CheckCircle2 className="h-5 w-5 text-[#e8894a]" aria-hidden />
        )}
        <p className="text-base font-semibold text-[#c96f35] sm:text-lg">
          {progress.percent <= 50 ? aboutHalfway : almostDone}
        </p>
      </div>

      <p className="text-sm font-semibold uppercase tracking-wide text-[#d4845c] sm:text-base">
        Section {progress.sectionId} — {sectionTitle}
      </p>
    </div>
  );
}
