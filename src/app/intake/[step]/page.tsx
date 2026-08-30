"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { QuestionCard } from "@/components/intake/QuestionCard";
import { useIntakeStore } from "@/hooks/use-intake-store";
import { getStepAnswer, setStepAnswer } from "@/lib/engine/answers";
import { getVisibleSteps } from "@/lib/engine/question-flow";
import {
  consumeStepNavDirection,
  setStepNavDirection,
} from "@/lib/engine/step-transition";
import { cn } from "@/lib/utils";

function IntakeStepContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const stepIndex = Number(params.step);
  const fromReview = searchParams.get("from") === "review";

  const lang = useIntakeStore((s) => s.preferredLanguage);
  const answers = useIntakeStore((s) => s.answers);
  const setAnswer = useIntakeStore((s) => s.setAnswer);
  const setCurrentStep = useIntakeStore((s) => s.setCurrentStep);

  const [enterClass, setEnterClass] = useState("");

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

  useEffect(() => {
    const direction = consumeStepNavDirection();
    setEnterClass(
      direction === "back" ? "intake-step-enter-back" : "intake-step-enter-forward"
    );
  }, [stepIndex]);

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

  const reviewQuery = fromReview ? "?from=review" : "";

  const goToStep = (index: number, direction: "forward" | "back") => {
    setStepNavDirection(direction);
    router.push(`/intake/${index}${reviewQuery}`);
  };

  return (
    <div className="flex min-h-dvh flex-col overflow-x-hidden safe-top">
      <div className={cn("flex min-h-0 flex-1 flex-col", enterClass)}>
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
            if (fromReview) {
              setStepNavDirection("back");
              router.push("/intake/review");
              return;
            }
            if (stepIndex > 0) {
              goToStep(stepIndex - 1, "back");
            } else {
              router.push("/");
            }
          }}
          onContinue={() => {
            if (fromReview) {
              setStepNavDirection("forward");
              router.push("/intake/review");
              return;
            }
            const next = stepIndex + 1;
            if (stepIndex < visibleSteps.length - 1) {
              setCurrentStep(next);
              goToStep(next, "forward");
            } else {
              setCurrentStep(visibleSteps.length);
              setStepNavDirection("forward");
              router.push("/intake/review");
            }
          }}
          canContinue={canContinue}
        />
      </div>
    </div>
  );
}

export default function IntakeStepPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center safe-top">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#e8894a] border-t-transparent" />
        </div>
      }
    >
      <IntakeStepContent />
    </Suspense>
  );
}
