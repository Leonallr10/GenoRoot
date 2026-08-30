"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  Mic,
} from "lucide-react";
import { AnswerOption } from "@/components/intake/AnswerOption";
import { VoiceCapture } from "@/components/intake/VoiceCapture";
import { ProgressBar } from "@/components/intake/ProgressBar";
import type { FlowStep } from "@/lib/engine/question-flow";
import {
  allowsVoiceOther,
  normalizeMultiAnswer,
  normalizeNumber,
  normalizeSingleAnswer,
  normalizeYesNo,
} from "@/lib/engine/normalize";
import { getStepAnswer } from "@/lib/engine/answers";
import { useLiveStepContent } from "@/hooks/use-live-step-content";
import { useLiveT } from "@/hooks/use-live-t";
import type { IntakeAnswers } from "@/lib/schema/intake";
import { cn } from "@/lib/utils";

const OTHER_ANSWER = "Other";

function isOtherAnswerSelected(
  value: unknown,
  options: string[] | undefined
): boolean {
  if (value === OTHER_ANSWER) return true;
  if (typeof value === "string" && options && !options.includes(value)) return true;
  if (Array.isArray(value)) {
    return value.some((item) => item === OTHER_ANSWER || (options && !options.includes(item)));
  }
  return false;
}

function readOtherInputValue(value: unknown, options: string[] | undefined): string {
  if (typeof value === "string") {
    if (value === OTHER_ANSWER) return "";
    if (options && !options.includes(value)) return value;
  }

  if (Array.isArray(value)) {
    const custom = value.find(
      (item) => item !== OTHER_ANSWER && options && !options.includes(item)
    );
    return custom ?? "";
  }

  return "";
}

interface QuestionCardProps {
  step: FlowStep;
  stepIndex: number;
  language: string;
  answers: IntakeAnswers;
  onAnswer: (value: unknown) => void;
  onTranscript?: (text: string) => void;
  onBack: () => void;
  onContinue: () => void;
  canContinue: boolean;
}

export function QuestionCard({
  step,
  stepIndex,
  language,
  answers,
  onAnswer,
  onTranscript,
  onBack,
  onContinue,
  canContinue,
}: QuestionCardProps) {
  const [showVoice, setShowVoice] = useState(false);
  const [otherInput, setOtherInput] = useState("");
  const [numberInput, setNumberInput] = useState("");
  const { prompt, englishPrompt, options, englishOptions, translating, error } =
    useLiveStepContent(language, step);

  const questionHelper = useLiveT(language, "questionHelper");
  const otherSpeak = useLiveT(language, "otherSpeak");
  const backLabel = useLiveT(language, "back");
  const continueLabel = useLiveT(language, "continue");
  const yesLabel = useLiveT(language, "yes");
  const noLabel = useLiveT(language, "no");
  const translatingContent = useLiveT(language, "translatingContent");

  const currentValue = getStepAnswer(answers, step);
  const showOther = allowsVoiceOther(step.type, step.columnKey);
  const otherSelected = isOtherAnswerSelected(currentValue, step.options);

  useEffect(() => {
    setOtherInput(readOtherInputValue(currentValue, step.options));
    setShowVoice(false);
  }, [step.id, currentValue, step.options]);

  const applyOtherAnswer = (trimmed: string, saveTranscript = false) => {
    if (trimmed && saveTranscript) onTranscript?.(trimmed);

    if (step.type === "number") {
      const num = normalizeNumber(trimmed);
      if (num != null) onAnswer(num);
      else if (!trimmed) onAnswer(OTHER_ANSWER);
      return;
    }

    if (step.type === "yesno" || step.type === "bool") {
      const yn = normalizeYesNo(trimmed, language);
      if (yn != null) onAnswer(yn);
      else if (!trimmed) onAnswer(OTHER_ANSWER);
      return;
    }

    if (step.type === "single" && step.options) {
      if (trimmed) {
        const val = normalizeSingleAnswer(
          language,
          step.questionKey,
          trimmed,
          step.options,
          step.followupKey,
          step.columnKey
        );
        onAnswer(val ?? trimmed);
      } else {
        onAnswer(OTHER_ANSWER);
      }
      return;
    }

    if (step.type === "multi" && step.options) {
      if (trimmed) {
        const vals = normalizeMultiAnswer(
          language,
          step.questionKey,
          trimmed,
          step.options
        );
        onAnswer(vals.length ? vals : [trimmed]);
      } else {
        onAnswer([OTHER_ANSWER]);
      }
      return;
    }

    onAnswer(trimmed || OTHER_ANSWER);
  };

  const handleOtherInputChange = (value: string) => {
    setOtherInput(value);
    applyOtherAnswer(value.trim());
  };

  const handleVoiceConfirm = (transcript: string) => {
    const trimmed = transcript.trim();
    setOtherInput(trimmed);
    applyOtherAnswer(trimmed, true);
    setShowVoice(false);
  };

  const renderOptions = () => {
    const displayOptions =
      options.length > 0 ? options : englishOptions;

    if (step.type === "number") {
      return (
        <input
          type="number"
          inputMode="numeric"
          placeholder="32"
          value={numberInput}
          onChange={(e) => {
            setNumberInput(e.target.value);
            const num = parseFloat(e.target.value);
            if (Number.isFinite(num)) onAnswer(num);
          }}
          className="genoroot-input focus:ring-2 focus:ring-[#e8894a]/50 focus:outline-none"
        />
      );
    }

    if (step.type === "yesno" || step.type === "bool") {
      return (
        <div className="flex flex-col gap-3">
          {[true, false].map((val) => (
            <AnswerOption
              key={String(val)}
              label={val ? yesLabel : noLabel}
              selected={currentValue === val}
              onClick={() => onAnswer(val)}
            />
          ))}
        </div>
      );
    }

    if (step.type === "single" && step.options) {
      return (
        <div className="flex flex-col gap-3">
          {displayOptions.map(({ canonical, label }) => (
            <AnswerOption
              key={canonical}
              label={label}
              selected={currentValue === canonical}
              onClick={() => onAnswer(canonical)}
            />
          ))}
        </div>
      );
    }

    if (step.type === "multi" && step.options) {
      const selected = (currentValue as string[]) ?? [];
      return (
        <div className="flex flex-col gap-3">
          {displayOptions.map(({ canonical, label }) => {
            const isSelected = selected.includes(canonical);
            return (
              <AnswerOption
                key={canonical}
                label={label}
                selected={isSelected}
                onClick={() => {
                  const next = isSelected
                    ? selected.filter((s) => s !== canonical)
                    : [...selected, canonical];
                  onAnswer(next);
                }}
              />
            );
          })}
        </div>
      );
    }

    if (step.type === "text") {
      return (
        <input
          value={(currentValue as string) ?? ""}
          onChange={(e) => onAnswer(e.target.value)}
          placeholder="..."
          className="genoroot-input text-xl focus:ring-2 focus:ring-[#e8894a]/50 focus:outline-none"
        />
      );
    }

    return null;
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ProgressBar stepIndex={stepIndex} />

      {error ? (
        <div className="mx-5 mb-2 rounded-xl border border-[#f5dcc8] bg-[#fff8f0] px-4 py-3 text-sm text-[#c96f35]">
          {error}
        </div>
      ) : null}

      <section className="shrink-0 px-5 pb-5 pt-1">
        <h1 className="text-[1.75rem] font-bold leading-tight text-slate-900 sm:text-4xl">
          {prompt || englishPrompt}
        </h1>
        <p className="mt-3 text-lg text-slate-600 sm:text-xl">{questionHelper}</p>

        {translating ? (
          <p className="mt-2 inline-flex items-center gap-2 text-sm text-[#c96f35]">
            <Loader2 className="h-4 w-4 animate-spin" />
            {translatingContent}
          </p>
        ) : null}
      </section>

      <section className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 pb-4">
        <div className="flex flex-1 flex-col gap-3">{renderOptions()}</div>

        {showOther && (
          <>
            <div
              className={cn(
                "genoroot-option mt-4 gap-3 px-4 py-3",
                otherSelected && "genoroot-option-selected"
              )}
            >
              <input
                type="text"
                value={otherInput}
                placeholder={otherSpeak}
                onChange={(e) => handleOtherInputChange(e.target.value)}
                onFocus={() => {
                  if (!otherSelected) applyOtherAnswer("");
                }}
                className={cn(
                  "min-w-0 flex-1 bg-transparent text-xl font-semibold outline-none placeholder:font-semibold",
                  otherSelected
                    ? "text-white placeholder:text-white/70"
                    : "text-slate-900 placeholder:text-slate-500"
                )}
              />
              <button
                type="button"
                aria-label={otherSpeak}
                onClick={() => setShowVoice(true)}
                className={cn(
                  "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 transition",
                  otherSelected
                    ? "border-white/70 bg-white/15 text-white hover:bg-white/25"
                    : "border-[#e8894a]/35 bg-white/50 text-[#c96f35] hover:bg-white/80"
                )}
              >
                <Mic className="h-6 w-6" />
              </button>
            </div>

            {showVoice && (
              <VoiceCapture
                language={language}
                onConfirm={handleVoiceConfirm}
                onCancel={() => setShowVoice(false)}
              />
            )}
          </>
        )}
      </section>

      <div className="safe-bottom flex shrink-0 gap-3 px-5 pb-5 pt-3">
        <button type="button" className="genoroot-btn-back inline-flex items-center justify-center gap-2" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
          {backLabel}
        </button>
        <button
          type="button"
          className="genoroot-btn-continue inline-flex items-center justify-center gap-2"
          disabled={!canContinue}
          onClick={onContinue}
        >
          {continueLabel}
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
