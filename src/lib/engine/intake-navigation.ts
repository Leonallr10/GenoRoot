import type { IntakeAnswers } from "@/lib/schema/intake";
import { getResumeStepIndex, getVisibleSteps } from "@/lib/engine/question-flow";

export function getIntakeContinuePath(answers: IntakeAnswers): string {
  const visibleSteps = getVisibleSteps(answers);
  const resumeStep = getResumeStepIndex(answers);

  if (resumeStep >= visibleSteps.length) {
    return "/intake/review";
  }

  return `/intake/${resumeStep}`;
}

export function getIntakeContinueStepIndex(answers: IntakeAnswers): number {
  const visibleSteps = getVisibleSteps(answers);
  const resumeStep = getResumeStepIndex(answers);
  return resumeStep >= visibleSteps.length ? visibleSteps.length : resumeStep;
}
