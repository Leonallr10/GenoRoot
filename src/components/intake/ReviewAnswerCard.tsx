"use client";

import { Pencil } from "lucide-react";
import { formatStepAnswerForDisplay, getStepAnswer } from "@/lib/engine/answers";
import type { IntakeAnswers } from "@/lib/schema/intake";
import type { FlowStep } from "@/lib/engine/question-flow";
import { getStepPrompt } from "@/lib/engine/normalize";
import { t } from "@/lib/i18n/translations";

interface ReviewAnswerCardProps {
  step: FlowStep;
  lang: string;
  answers: IntakeAnswers;
  onEdit: () => void;
}

export function ReviewAnswerCard({
  step,
  lang,
  answers,
  onEdit,
}: ReviewAnswerCardProps) {
  const val = getStepAnswer(answers, step);

  return (
    <li className="genoroot-glass flex w-full items-start justify-between gap-4 rounded-2xl p-5">
      <div className="min-w-0 flex-1">
        <p className="text-base text-slate-600 sm:text-lg">
          {getStepPrompt(
            lang,
            step.questionKey,
            step.rowKey,
            step.followupKey,
            step.columnKey
          )}
        </p>
        <p className="mt-2 text-xl font-bold leading-snug text-slate-900 sm:text-2xl">
          {formatStepAnswerForDisplay(step, val, lang, t(lang, "yes"), t(lang, "no"))}
        </p>
      </div>
      <button
        type="button"
        className="flex shrink-0 flex-col items-center gap-1 rounded-xl px-3 py-2 text-[#c96f35] transition hover:bg-white/40"
        onClick={onEdit}
      >
        <Pencil className="h-5 w-5" />
        <span className="text-sm font-semibold">{t(lang, "edit")}</span>
      </button>
    </li>
  );
}
