"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  Mic,
  Pause,
  Play,
  Volume2,
  VolumeX,
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
import { useTts } from "@/hooks/use-tts";
import type { IntakeAnswers } from "@/lib/schema/intake";
import { cn } from "@/lib/utils";

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
  const [numberInput, setNumberInput] = useState("");
  const { speak, stop, pause, resume, isSpeaking, isPaused } = useTts(language);
  const { prompt, options, loading, error } = useLiveStepContent(language, step);

  const listenLabel = useLiveT(language, "listen");
  const pauseListeningLabel = useLiveT(language, "pauseListening");
  const resumeListeningLabel = useLiveT(language, "resumeListening");
  const stopListeningLabel = useLiveT(language, "stopListening");
  const questionHelper = useLiveT(language, "questionHelper");
  const otherSpeak = useLiveT(language, "otherSpeak");
  const backLabel = useLiveT(language, "back");
  const continueLabel = useLiveT(language, "continue");
  const yesLabel = useLiveT(language, "yes");
  const noLabel = useLiveT(language, "no");
  const translatingContent = useLiveT(language, "translatingContent");

  const currentValue = getStepAnswer(answers, step);
  const showOther = allowsVoiceOther(step.type, step.columnKey);

  const handleVoiceConfirm = (transcript: string) => {
    onTranscript?.(transcript);
    if (step.type === "number") {
      const num = normalizeNumber(transcript);
      if (num != null) onAnswer(num);
    } else if (step.type === "yesno" || step.type === "bool") {
      const yn = normalizeYesNo(transcript, language);
      if (yn != null) onAnswer(yn);
    } else if (step.type === "single" && step.options) {
      const val = normalizeSingleAnswer(
        language,
        step.questionKey,
        transcript,
        step.options,
        step.followupKey,
        step.columnKey
      );
      onAnswer(val ?? transcript);
    } else if (step.type === "multi" && step.options) {
      const vals = normalizeMultiAnswer(language, step.questionKey, transcript, step.options);
      onAnswer(vals.length ? vals : [transcript]);
    } else {
      onAnswer(transcript);
    }
    setShowVoice(false);
  };

  const renderOptions = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center gap-3 py-10 text-slate-600">
          <Loader2 className="h-6 w-6 animate-spin text-[#e8894a]" />
          <span>{translatingContent}</span>
        </div>
      );
    }

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
          {options.map(({ canonical, label }) => (
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
          {options.map(({ canonical, label }) => {
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
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-[#e8894a]" />
              {translatingContent}
            </span>
          ) : (
            prompt
          )}
        </h1>
        <p className="mt-3 text-lg text-slate-600 sm:text-xl">{questionHelper}</p>

        <div className="mt-5 flex flex-wrap gap-3">
          {!isSpeaking ? (
            <button
              type="button"
              className="genoroot-btn-listen"
              onClick={() => speak(prompt)}
              disabled={loading}
            >
              <Volume2 className="h-4 w-4" />
              {listenLabel}
            </button>
          ) : (
            <>
              <button
                type="button"
                className="genoroot-btn-listen"
                onClick={isPaused ? resume : pause}
              >
                {isPaused ? (
                  <Play className="h-4 w-4" />
                ) : (
                  <Pause className="h-4 w-4" />
                )}
                {isPaused ? resumeListeningLabel : pauseListeningLabel}
              </button>
              <button type="button" className="genoroot-btn-listen" onClick={stop}>
                <VolumeX className="h-4 w-4" />
                {stopListeningLabel}
              </button>
            </>
          )}
        </div>
      </section>

      <section className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 pb-4">
        <div className="flex flex-1 flex-col gap-3">{renderOptions()}</div>

        {showOther && !showVoice && (
          <button
            type="button"
            className={cn("genoroot-option mt-4 justify-center")}
            onClick={() => setShowVoice(true)}
          >
            <Mic className="h-6 w-6 shrink-0 text-[#c96f35]" />
            <span>{otherSpeak}</span>
            <span className="h-8 w-8 shrink-0 rounded-full border-2 border-[#e8894a]/35" />
          </button>
        )}

        {showVoice && (
          <VoiceCapture
            language={language}
            onConfirm={handleVoiceConfirm}
            onCancel={() => setShowVoice(false)}
          />
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
          disabled={!canContinue || loading}
          onClick={onContinue}
        >
          {continueLabel}
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
