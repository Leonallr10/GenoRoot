import type { IntakeAnswers } from "@/lib/schema/intake";
import { getResumeStepIndex, getVisibleSteps } from "@/lib/engine/question-flow";

export function getIntakeContinuePath(
  answers: IntakeAnswers,
  submitted = false
): string {
  if (submitted) {
    return "/intake/complete";
  }

  const visibleSteps = getVisibleSteps(answers);
  const resumeStep = getResumeStepIndex(answers);

  if (resumeStep >= visibleSteps.length) {
    return "/intake/review";
  }

  return `/intake/${resumeStep}`;
}

export function getIntakeContinueStepIndex(
  answers: IntakeAnswers,
  submitted = false
): number {
  if (submitted) {
    return getVisibleSteps(answers).length;
  }

  const visibleSteps = getVisibleSteps(answers);
  const resumeStep = getResumeStepIndex(answers);
  return resumeStep >= visibleSteps.length ? visibleSteps.length : resumeStep;
}

export function hasIntakeProgress(answers: IntakeAnswers, submitted = false): boolean {
  return submitted || Object.keys(answers).length > 0;
}
