import type { IntakeAnswers } from "@/lib/schema/intake";

export interface BranchRule {
  when: { path: string; equals: unknown };
  show: string;
}

export const branchRules: BranchRule[] = [
  {
    when: { path: "habits.smoking", equals: true },
    show: "smoking_severity",
  },
  {
    when: { path: "habits.salon_treatments", equals: true },
    show: "salon_treatment_detail",
  },
  {
    when: { path: "past_treatment_side_effects", equals: true },
    show: "describe",
  },
];

export function getNestedValue(obj: IntakeAnswers, path: string): unknown {
  const parts = path.split(".");
  let current: unknown = obj;
  for (const part of parts) {
    if (current == null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

export function shouldShowStep(stepId: string, answers: IntakeAnswers): boolean {
  const rule = branchRules.find((r) => r.show === stepId);
  if (!rule) return true;
  return getNestedValue(answers, rule.when.path) === rule.when.equals;
}

export function shouldShowProductColumn(
  questionKey: "products" | "procedures",
  rowName: string,
  columnKey: string,
  answers: IntakeAnswers
): boolean {
  const table = answers[questionKey]?.[rowName];
  if (!table) return true;

  const boolKey = questionKey === "products" ? "used" : "done";
  const isUsed = table[boolKey as keyof typeof table];

  if (columnKey === boolKey) return true;
  return isUsed === true;
}
