"use client";

import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnswerOptionProps {
  label: string;
  selected: boolean;
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export function AnswerOption({
  label,
  selected,
  onClick,
  loading = false,
  disabled = false,
}: AnswerOptionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading}
      className={cn(
        "genoroot-option",
        selected && "genoroot-option-selected",
        (loading || disabled) && "pointer-events-none opacity-80"
      )}
    >
      <span
        className={cn(
          "text-left leading-snug",
          loading && "text-slate-500"
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2",
          selected
            ? "border-white bg-white text-[#d96938]"
            : "border-[#e8894a]/35 bg-transparent"
        )}
        aria-hidden
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin text-[#c96f35]" />
        ) : selected ? (
          <Check className="h-5 w-5 stroke-[3]" />
        ) : null}
      </span>
    </button>
  );
}
