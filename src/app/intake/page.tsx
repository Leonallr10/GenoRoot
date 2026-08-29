"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useIntakeStore } from "@/hooks/use-intake-store";
import {
  getIntakeContinuePath,
  getIntakeContinueStepIndex,
} from "@/lib/engine/intake-navigation";

export default function IntakePage() {
  const router = useRouter();
  const answers = useIntakeStore((s) => s.answers);
  const setCurrentStep = useIntakeStore((s) => s.setCurrentStep);

  useEffect(() => {
    const stepIndex = getIntakeContinueStepIndex(answers);
    setCurrentStep(stepIndex);
    router.replace(getIntakeContinuePath(answers));
  }, [answers, router, setCurrentStep]);

  return null;
}
