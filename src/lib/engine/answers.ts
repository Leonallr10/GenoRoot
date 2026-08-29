import type { IntakeAnswers } from "@/lib/schema/intake";
import type { FlowStep } from "@/lib/engine/question-flow";
import { getOptionText } from "@/lib/i18n/translations";

export function setStepAnswer(
  answers: IntakeAnswers,
  step: FlowStep,
  value: unknown
): IntakeAnswers {
  const next = { ...answers };

  if (step.questionKey === "habits" && step.rowKey) {
    next.habits = { ...next.habits };
    if (step.followupKey) {
      (next.habits as Record<string, unknown>)[step.followupKey] = value;
    } else if (step.type === "single") {
      (next.habits as Record<string, unknown>)[step.rowKey] = value;
    } else {
      (next.habits as Record<string, unknown>)[step.rowKey] = value;
    }
    return next;
  }

  if (
    (step.questionKey === "products" || step.questionKey === "procedures") &&
    step.rowKey &&
    step.columnKey
  ) {
    next[step.questionKey] = { ...next[step.questionKey] };
    const row = {
      ...(next[step.questionKey]![step.rowKey] ?? {}),
    };
    (row as Record<string, unknown>)[step.columnKey] = value;
    next[step.questionKey]![step.rowKey] = row;
    return next;
  }

  if (step.followupKey) {
    (next as Record<string, unknown>)[step.followupKey] = value;
    return next;
  }

  (next as Record<string, unknown>)[step.questionKey] = value;
  return next;
}

export function getStepAnswer(answers: IntakeAnswers, step: FlowStep): unknown {
  if (step.questionKey === "habits" && step.rowKey) {
    if (step.followupKey) return answers.habits?.[step.followupKey as keyof typeof answers.habits];
    return answers.habits?.[step.rowKey as keyof typeof answers.habits];
  }

  if (
    (step.questionKey === "products" || step.questionKey === "procedures") &&
    step.rowKey &&
    step.columnKey
  ) {
    return answers[step.questionKey]?.[step.rowKey]?.[
      step.columnKey as "used" | "done" | "duration" | "helped" | "side_effects" | "sessions"
    ];
  }

  if (step.followupKey) {
    return (answers as Record<string, unknown>)[step.followupKey];
  }

  return (answers as Record<string, unknown>)[step.questionKey];
}

export function isStepAnswered(answers: IntakeAnswers, step: FlowStep): boolean {
  const val = getStepAnswer(answers, step);
  if (val === undefined || val === null || val === "") return false;
  if (Array.isArray(val) && val.length === 0) return false;
  return true;
}

export function formatStepAnswerForDisplay(
  step: FlowStep,
  value: unknown,
  lang: string,
  yesLabel = "Yes",
  noLabel = "No"
): string {
  if (value === undefined || value === null) return "—";
  if (typeof value === "boolean") return value ? yesLabel : noLabel;
  if (typeof value === "string" && step.type === "single") {
    return getOptionText(
      lang,
      step.questionKey,
      value,
      step.followupKey,
      step.columnKey
    );
  }
  if (Array.isArray(value)) {
    return value
      .map((item) =>
        typeof item === "string"
          ? getOptionText(lang, step.questionKey, item, step.followupKey, step.columnKey)
          : String(item)
      )
      .join(", ");
  }
  return formatAnswerForDisplay(value, lang, yesLabel, noLabel);
}

export function formatAnswerForDisplay(
  value: unknown,
  _lang: string,
  yesLabel = "Yes",
  noLabel = "No"
): string {
  if (value === undefined || value === null) return "—";
  if (typeof value === "boolean") return value ? yesLabel : noLabel;
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") {
    return Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => v !== undefined && v !== null)
      .map(([k, v]) => {
        const display =
          typeof v === "boolean" ? (v ? yesLabel : noLabel) : String(v);
        return `${k.replace(/_/g, " ")}: ${display}`;
      })
      .join(" · ");
  }
  return String(value);
}
