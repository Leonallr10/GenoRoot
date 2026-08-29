"use client";

import { useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { QuestionCard } from "@/components/intake/QuestionCard";
import { useIntakeStore } from "@/hooks/use-intake-store";
import { getStepAnswer, setStepAnswer } from "@/lib/engine/answers";
import { getVisibleSteps } from "@/lib/engine/question-flow";

export default function IntakeStepPage() {
  const params = useParams();
  const router = useRouter();
  const stepIndex = Number(params.step);

  const lang = useIntakeStore((s) => s.preferredLanguage);
  const answers = useIntakeStore((s) => s.answers);
  const setAnswer = useIntakeStore((s) => s.setAnswer);
  const setCurrentStep = useIntakeStore((s) => s.setCurrentStep);

  const visibleSteps = useMemo(() => getVisibleSteps(answers), [answers]);
  const step = visibleSteps[stepIndex];

  useEffect(() => {
    if (!Number.isFinite(stepIndex) || stepIndex < 0) {
      router.replace("/intake/0");
    }
  }, [stepIndex, router]);

  useEffect(() => {
    setCurrentStep(stepIndex);
  }, [stepIndex, setCurrentStep]);

  if (!step) {
    if (stepIndex >= visibleSteps.length) {
      router.replace("/intake/review");
    }
    return null;
  }

  const currentValue = getStepAnswer(answers, step);
  const canContinue =
    currentValue !== undefined &&
    currentValue !== null &&
    !(Array.isArray(currentValue) && currentValue.length === 0) &&
    currentValue !== "";

  return (
    <div className="flex min-h-dvh flex-col safe-top">
      <QuestionCard
        step={step}
        stepIndex={stepIndex}
        language={lang}
        answers={answers}
        onAnswer={(value) => {
          setAnswer((prev) => setStepAnswer(prev, step, value));
        }}
        onTranscript={(text) => {
          useIntakeStore.getState().setTranscript(step.id, text);
        }}
        onBack={() => {
          if (stepIndex > 0) router.push(`/intake/${stepIndex - 1}`);
          else router.push("/");
        }}
        onContinue={() => {
          const next = stepIndex + 1;
          if (stepIndex < visibleSteps.length - 1) {
            setCurrentStep(next);
            router.push(`/intake/${next}`);
          } else {
            setCurrentStep(visibleSteps.length);
            router.push("/intake/review");
          }
        }}
        canContinue={canContinue}
      />
    </div>
  );
}
