import type { IntakeAnswers } from "@/lib/schema/intake";
import {
  formatStepAnswerForDisplay,
  getStepAnswer,
  isStepAnswered,
} from "@/lib/engine/answers";
import { getVisibleSteps } from "@/lib/engine/question-flow";
import { getStepPrompt } from "@/lib/engine/normalize";
import { getSectionTitle, t } from "@/lib/i18n/translations";

export type AnswerTableRow = {
  sectionId: string;
  sectionTitle: string;
  label: string;
  value: string;
};

export function buildAnswerTableRows(
  answers: IntakeAnswers,
  lang: string
): AnswerTableRow[] {
  const yes = t(lang, "yes");
  const no = t(lang, "no");
  const visible = getVisibleSteps(answers);

  return visible
    .filter((step) => isStepAnswered(answers, step))
    .map((step) => ({
      sectionId: step.sectionId,
      sectionTitle: getSectionTitle(lang, step.sectionId),
      label: getStepPrompt(
        lang,
        step.questionKey,
        step.rowKey,
        step.followupKey,
        step.columnKey
      ),
      value: formatStepAnswerForDisplay(
        step,
        getStepAnswer(answers, step),
        lang,
        yes,
        no
      ),
    }));
}

export function buildEnglishTranscriptRows(
  transcripts: Record<string, string> | undefined,
  translations: Record<string, string>
): { label: string; original: string; english: string }[] {
  if (!transcripts) return [];

  return Object.entries(transcripts).map(([key, original]) => ({
    label: key.replace(/\./g, " · "),
    original,
    english: translations[key] ?? original,
  }));
}

export function groupRowsBySection(
  rows: AnswerTableRow[]
): { sectionId: string; sectionTitle: string; rows: AnswerTableRow[] }[] {
  const map = new Map<string, { sectionTitle: string; rows: AnswerTableRow[] }>();

  for (const row of rows) {
    const existing = map.get(row.sectionId);
    if (existing) {
      existing.rows.push(row);
    } else {
      map.set(row.sectionId, { sectionTitle: row.sectionTitle, rows: [row] });
    }
  }

  return Array.from(map.entries()).map(([sectionId, data]) => ({
    sectionId,
    sectionTitle: data.sectionTitle,
    rows: data.rows,
  }));
}

export function buildEnglishAnswerTableRows(
  answers: IntakeAnswers
): AnswerTableRow[] {
  return buildAnswerTableRows(answers, "en");
}
