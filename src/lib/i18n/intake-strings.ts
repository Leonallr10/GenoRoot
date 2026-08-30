import { buildFlowSteps } from "@/lib/engine/question-flow";
import { getLocalizedOptions, getStepPrompt } from "@/lib/engine/normalize";
import { en } from "@/lib/i18n/translations/en";

const INTAKE_UI_KEYS = [
  "questionHelper",
  "otherSpeak",
  "back",
  "continue",
  "yes",
  "no",
  "tellUsInYourWords",
  "tapAndSpeak",
  "useThis",
  "tryAgain",
  "pauseRecording",
  "resumeRecording",
  "stopRecording",
  "transcribing",
  "aboutHalfway",
  "questionOf",
  "sectionComplete",
  "nextSection",
  "almostDone",
  "reviewAnswers",
  "submitIntake",
  "edit",
  "translatingContent",
  "generateReport",
  "generatingReport",
  "clinicalReport",
  "downloadCsv",
  "downloadReport",
  "downloadReportPdf",
  "downloadPdf",
  "downloadExcel",
  "download",
  "downloadInEnglish",
  "downloadInLanguage",
  "preparingDownload",
  "regenerateReport",
  "reportFailed",
] as const;

/** All English strings needed during intake (questions, options, UI). */
export function collectIntakeSourceStrings(): string[] {
  const strings = new Set<string>();

  for (const key of INTAKE_UI_KEYS) {
    strings.add(en[key]);
  }

  Object.values(en.sections).forEach((title) => strings.add(title));

  for (const step of buildFlowSteps()) {
    strings.add(
      getStepPrompt(
        "en",
        step.questionKey,
        step.rowKey,
        step.followupKey,
        step.columnKey
      )
    );

    if (step.options) {
      for (const { label } of getLocalizedOptions(
        "en",
        step.questionKey,
        step.options,
        step.followupKey,
        step.columnKey
      )) {
        strings.add(label);
      }
    }
  }

  return [...strings].filter((text) => text.trim().length > 0);
}
