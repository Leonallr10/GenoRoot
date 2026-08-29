import { intakeSchema, TOTAL_QUESTIONS, type QuestionType } from "@/lib/schema/questions";
import type { IntakeAnswers } from "@/lib/schema/intake";
import { isStepAnswered } from "@/lib/engine/answers";
import {
  shouldShowProductColumn,
  shouldShowStep,
} from "@/lib/engine/branching";
import type { HabitRow } from "@/lib/schema/questions";

export interface FlowStep {
  id: string;
  questionKey: string;
  questionNumber: number;
  sectionId: string;
  type: QuestionType;
  options?: string[];
  rowKey?: string;
  columnKey?: string;
  followupKey?: string;
  tableParent?: "products" | "procedures";
}

function isHabitRow(row: HabitRow | string): row is HabitRow {
  return typeof row === "object";
}

export function buildFlowSteps(): FlowStep[] {
  const steps: FlowStep[] = [];

  for (const section of intakeSchema.sections) {
    for (const question of section.questions) {
      if (question.type === "table" && question.key === "habits") {
        const rows = question.rows as HabitRow[];
        for (const row of rows) {
          steps.push({
            id: `habits.${row.key}`,
            questionKey: "habits",
            questionNumber: question.n,
            sectionId: section.id,
            type: row.type,
            options: row.options,
            rowKey: row.key,
          });
          if (row.followup) {
            steps.push({
              id: `habits.${row.followup.key}`,
              questionKey: "habits",
              questionNumber: question.n,
              sectionId: section.id,
              type: row.followup.type,
              options: row.followup.options,
              rowKey: row.key,
              followupKey: row.followup.key,
            });
          }
        }
        continue;
      }

      if (
        question.type === "table" &&
        (question.key === "products" || question.key === "procedures")
      ) {
        const rows = question.rows as string[];
        const boolCol = question.columns!.find(
          (c) => c.key === "used" || c.key === "done"
        )!;
        for (const rowName of rows) {
          steps.push({
            id: `${question.key}.${rowName}.${boolCol.key}`,
            questionKey: question.key,
            questionNumber: question.n,
            sectionId: section.id,
            type: "bool",
            rowKey: rowName,
            columnKey: boolCol.key,
            tableParent: question.key as "products" | "procedures",
          });
          for (const col of question.columns!) {
            if (col.key === boolCol.key) continue;
            steps.push({
              id: `${question.key}.${rowName}.${col.key}`,
              questionKey: question.key,
              questionNumber: question.n,
              sectionId: section.id,
              type: col.type,
              options: col.options,
              rowKey: rowName,
              columnKey: col.key,
              tableParent: question.key as "products" | "procedures",
            });
          }
        }
        continue;
      }

      steps.push({
        id: question.key,
        questionKey: question.key,
        questionNumber: question.n,
        sectionId: section.id,
        type: question.type,
        options: question.options,
      });

      if (question.followup) {
        steps.push({
          id: question.followup.key,
          questionKey: question.key,
          questionNumber: question.n,
          sectionId: section.id,
          type: question.followup.type,
          options: question.followup.options,
          followupKey: question.followup.key,
        });
      }
    }
  }

  return steps;
}

export const ALL_STEPS = buildFlowSteps();

export function getVisibleSteps(answers: IntakeAnswers): FlowStep[] {
  return ALL_STEPS.filter((step) => {
    if (step.followupKey) {
      return shouldShowStep(step.followupKey, answers);
    }
    if (step.tableParent && step.columnKey) {
      return shouldShowProductColumn(
        step.tableParent,
        step.rowKey!,
        step.columnKey,
        answers
      );
    }
    return true;
  });
}

export function getProgress(stepIndex: number, answers: IntakeAnswers) {
  const visible = getVisibleSteps(answers);
  const totalSteps = visible.length;
  const safeIndex =
    totalSteps === 0 ? 0 : Math.min(Math.max(0, stepIndex), totalSteps - 1);
  const current = visible[safeIndex];
  const questionNumber = current?.questionNumber ?? 1;
  const stepPercent =
    totalSteps > 0 ? Math.round(((safeIndex + 1) / totalSteps) * 100) : 0;

  return {
    currentQuestion: questionNumber,
    totalQuestions: TOTAL_QUESTIONS,
    percent: stepPercent,
    sectionId: current?.sectionId ?? "A",
    stepIndex: safeIndex,
    totalSteps,
    currentStepDisplay: safeIndex + 1,
    message:
      stepPercent <= 50
        ? "About halfway there"
        : stepPercent < 100
          ? "Almost there"
          : "Final questions",
  };
}

/** First unanswered step — used for welcome-back resume and progress sync. */
export function getResumeStepIndex(answers: IntakeAnswers): number {
  const visible = getVisibleSteps(answers);
  const idx = visible.findIndex((step) => !isStepAnswered(answers, step));
  if (idx === -1) return visible.length;
  return idx;
}

export function findStepIndexById(stepId: string, answers: IntakeAnswers): number {
  const visible = getVisibleSteps(answers);
  return visible.findIndex((s) => s.id === stepId);
}
