import {
  formatStepAnswerForDisplay,
  getStepAnswer,
  isStepAnswered,
} from "@/lib/engine/answers";
import { getStepPrompt } from "@/lib/engine/normalize";
import { getVisibleSteps } from "@/lib/engine/question-flow";
import { getSectionTitle } from "@/lib/i18n/translations";
import type { IntakeAnswers } from "@/lib/schema/intake";
import { intakeSchema } from "@/lib/schema/questions";
import type { AnswerSource, ReportFinding, ReportPayload } from "./schema";

const OTHER_ANSWER = "Other";

function isCustomString(value: string, options?: string[]): boolean {
  if (value === OTHER_ANSWER) return true;
  if (!options || options.length === 0) return true;
  return !options.includes(value);
}

function valueHasManualInput(value: unknown, options?: string[]): boolean {
  if (typeof value === "string") return isCustomString(value, options);
  if (Array.isArray(value)) {
    return value.some(
      (item) => typeof item === "string" && isCustomString(item, options)
    );
  }
  return false;
}

function resolveSource(
  isManual: boolean,
  hasVoice: boolean
): AnswerSource {
  if (isManual && hasVoice) return "mixed";
  if (hasVoice) return "voice";
  if (isManual) return "manual";
  return "selected";
}

export function buildReportPayload(
  answers: IntakeAnswers,
  sourceLanguage: string,
  transcripts?: Record<string, string>,
  englishTranscripts?: Record<string, string>
): ReportPayload {
  const visible = getVisibleSteps(answers);
  const findings: ReportFinding[] = [];
  const unanswered: ReportPayload["unanswered"] = [];
  const patientReportedNotes: ReportPayload["patientReportedNotes"] = [];

  for (const step of visible) {
    const sectionTitle = getSectionTitle("en", step.sectionId);
    const question = getStepPrompt(
      "en",
      step.questionKey,
      step.rowKey,
      step.followupKey,
      step.columnKey
    );

    if (!isStepAnswered(answers, step)) {
      unanswered.push({ sectionTitle, question });
      continue;
    }

    const raw = getStepAnswer(answers, step);
    const answer = formatStepAnswerForDisplay(step, raw, "en", "Yes", "No");
    const voiceOriginal = transcripts?.[step.id]?.trim() || undefined;
    const voiceEnglish =
      englishTranscripts?.[step.id]?.trim() || voiceOriginal;
    const isManual =
      step.type === "text" || valueHasManualInput(raw, step.options);
    const source = resolveSource(isManual, Boolean(voiceOriginal));

    findings.push({
      stepId: step.id,
      sectionId: step.sectionId,
      sectionTitle,
      question,
      answer,
      source,
      ...(voiceOriginal ? { voiceOriginal, voiceEnglish } : {}),
    });

    if (isManual && typeof raw === "string" && raw !== OTHER_ANSWER) {
      patientReportedNotes.push({
        question,
        text: raw,
        source: "manual",
      });
    }

    if (Array.isArray(raw)) {
      for (const item of raw) {
        if (typeof item === "string" && isCustomString(item, step.options)) {
          patientReportedNotes.push({
            question,
            text: item,
            source: "manual",
          });
        }
      }
    }

    if (voiceEnglish) {
      patientReportedNotes.push({
        question,
        text: voiceEnglish,
        source: "voice",
      });
    }
  }

  return {
    form: intakeSchema.form,
    sourceLanguage,
    findings,
    unanswered,
    patientReportedNotes,
  };
}
