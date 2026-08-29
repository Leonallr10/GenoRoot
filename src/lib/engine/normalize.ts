import type { QuestionType } from "@/lib/schema/questions";
import {
  getOptionText,
  getQuestionText,
  getRowText,
} from "@/lib/i18n/translations";

export function normalizeSingleAnswer(
  lang: string,
  questionKey: string,
  spokenText: string,
  options: string[],
  followupKey?: string,
  columnKey?: string
): string | null {
  const normalized = spokenText.trim().toLowerCase();
  if (!normalized) return null;

  for (const canonical of options) {
    const localized = getOptionText(lang, questionKey, canonical, followupKey, columnKey)
      .trim()
      .toLowerCase();
    if (
      normalized === localized ||
      normalized.includes(localized) ||
      localized.includes(normalized) ||
      normalized === canonical.toLowerCase()
    ) {
      return canonical;
    }
  }

  return null;
}

export function normalizeMultiAnswer(
  lang: string,
  questionKey: string,
  spokenText: string,
  options: string[],
  columnKey?: string
): string[] {
  const parts = spokenText.split(/[,;]| and | மற்றும் | और /i);
  const matched: string[] = [];

  for (const part of parts) {
    const single = normalizeSingleAnswer(lang, questionKey, part, options, undefined, columnKey);
    if (single && !matched.includes(single)) {
      matched.push(single);
    }
  }

  if (matched.length === 0) {
    const single = normalizeSingleAnswer(lang, questionKey, spokenText, options, undefined, columnKey);
    if (single) matched.push(single);
  }

  return matched;
}

export function normalizeYesNo(spokenText: string, lang: string): boolean | null {
  const t = spokenText.trim().toLowerCase();
  const yesWords = ["yes", "yeah", "yep", "true", "ஆம்", "ஆமா", "हाँ", "हां", "haan"];
  const noWords = ["no", "nope", "false", "இல்லை", "illai", "नहीं", "nahi"];

  if (yesWords.some((w) => t.includes(w))) return true;
  if (noWords.some((w) => t.includes(w))) return false;
  if (lang === "en" && t.startsWith("y")) return true;
  if (lang === "en" && t.startsWith("n")) return false;
  return null;
}

export function normalizeNumber(spokenText: string): number | null {
  const digits = spokenText.replace(/[^\d.]/g, "");
  const num = parseFloat(digits);
  return Number.isFinite(num) ? num : null;
}

export function getLocalizedOptions(
  lang: string,
  questionKey: string,
  options: string[],
  followupKey?: string,
  columnKey?: string
): { canonical: string; label: string }[] {
  return options.map((canonical) => ({
    canonical,
    label: getOptionText(lang, questionKey, canonical, followupKey, columnKey),
  }));
}

export function getStepPrompt(
  lang: string,
  questionKey: string,
  rowKey?: string,
  followupKey?: string,
  columnKey?: string
): string {
  if (followupKey) {
    return getQuestionText(lang, questionKey, followupKey);
  }
  if (columnKey && rowKey) {
    const rowLabel = getRowText(lang, questionKey, rowKey);
    return `${rowLabel} — ${getQuestionText(lang, questionKey, columnKey)}`;
  }
  if (rowKey) {
    return getRowText(lang, questionKey, rowKey);
  }
  return getQuestionText(lang, questionKey);
}

export function allowsVoiceOther(type: QuestionType, columnKey?: string): boolean {
  if (columnKey === "used" || columnKey === "done") return false;
  return ["single", "multi", "text"].includes(type);
}
