"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnswerOptionProps {
  label: string;
  selected: boolean;
  onClick: () => void;
}

export function AnswerOption({ label, selected, onClick }: AnswerOptionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn("genoroot-option", selected && "genoroot-option-selected")}
    >
      <span className="text-left leading-snug">{label}</span>
      <span
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2",
          selected
            ? "border-white bg-white text-[#d96938]"
            : "border-[#e8894a]/35 bg-transparent"
        )}
        aria-hidden
      >
        {selected ? <Check className="h-5 w-5 stroke-[3]" /> : null}
      </span>
    </button>
  );
}
