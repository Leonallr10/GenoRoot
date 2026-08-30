"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Languages,
  RotateCcw,
  Send,
} from "lucide-react";
import { ReviewAnswerCard } from "@/components/intake/ReviewAnswerCard";
import { useIntakeStore } from "@/hooks/use-intake-store";
import { getVisibleSteps, findStepIndexById } from "@/lib/engine/question-flow";
import { setStepNavDirection } from "@/lib/engine/step-transition";
import { getSectionTitle, t } from "@/lib/i18n/translations";
import { getLanguage } from "@/lib/i18n/languages";
import { intakeSchema } from "@/lib/schema/questions";
import { intakeStateSchema } from "@/lib/schema/intake";

export default function ReviewPage() {
  const router = useRouter();
  const lang = useIntakeStore((s) => s.preferredLanguage);
  const answers = useIntakeStore((s) => s.answers);
  const markSubmitted = useIntakeStore((s) => s.markSubmitted);
  const resetIntake = useIntakeStore((s) => s.resetIntake);
  const setCurrentStep = useIntakeStore((s) => s.setCurrentStep);

  const visibleSteps = useMemo(() => getVisibleSteps(answers), [answers]);

  const handleReintake = () => {
    resetIntake(lang);
    setCurrentStep(0);
    router.push("/intake/0");
  };

  const handleSubmit = () => {
    const state = {
      preferredLanguage: lang,
      answers,
      currentStep: visibleSteps.length,
      submitted: true,
    };
    const parsed = intakeStateSchema.safeParse(state);
    if (!parsed.success) {
      alert("Please complete all required questions.");
      return;
    }
    markSubmitted();
    router.push("/intake/complete");
  };

  return (
    <div className="flex min-h-dvh w-full flex-col safe-top safe-bottom">
      <div className="flex min-h-0 flex-1 flex-col px-5 pb-5">
        <header className="shrink-0 pb-6 pt-2">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-1 h-8 w-8 shrink-0 text-[#e8894a]" />
            <div>
              <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
                {t(lang, "almostDone")}
              </h1>
              <p className="mt-2 text-lg text-slate-600 sm:text-xl">
                {t(lang, "reviewAnswers")}
              </p>
            </div>
          </div>
        </header>

        <div className="min-h-0 flex-1 space-y-8 overflow-y-auto pb-6">
          {intakeSchema.sections.map((section) => {
            const sectionSteps = visibleSteps.filter((s) => s.sectionId === section.id);
            if (sectionSteps.length === 0) return null;

            return (
              <section key={section.id} className="w-full">
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[#d4845c] sm:text-base">
                  Section {section.id} — {getSectionTitle(lang, section.id)}
                </h2>
                <ul className="flex flex-col gap-3">
                  {sectionSteps.map((step) => {
                    const stepIdx = findStepIndexById(step.id, answers);
                    return (
                      <ReviewAnswerCard
                        key={step.id}
                        step={step}
                        lang={lang}
                        answers={answers}
                        onEdit={() => {
                          setStepNavDirection("back");
                          router.push(`/intake/${stepIdx}?from=review`);
                        }}
                      />
                    );
                  })}
                </ul>
              </section>
            );
          })}

          <div className="genoroot-glass flex items-center gap-3 rounded-2xl px-5 py-4">
            <Languages className="h-5 w-5 shrink-0 text-[#c96f35]" />
            <span className="text-base text-slate-700 sm:text-lg">
              {t(lang, "language")}:{" "}
              <strong className="text-slate-900">{getLanguage(lang)?.nativeName}</strong>
            </span>
          </div>
        </div>

        <div className="shrink-0 space-y-3 pt-3">
          <button
            type="button"
            className="genoroot-btn-back inline-flex w-full items-center justify-center gap-2"
            onClick={handleReintake}
          >
            <RotateCcw className="h-5 w-5" />
            {t(lang, "reintake")}
          </button>

          <div className="flex gap-3">
            <button
              type="button"
              className="genoroot-btn-back inline-flex flex-1 items-center justify-center gap-2"
              onClick={() => router.push(`/intake/${visibleSteps.length - 1}`)}
            >
              <ArrowLeft className="h-5 w-5" />
              {t(lang, "back")}
            </button>
            <button
              type="button"
              className="genoroot-btn-continue inline-flex flex-1 items-center justify-center gap-2"
              onClick={handleSubmit}
            >
              <Send className="h-5 w-5" />
              {t(lang, "submitIntake")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
