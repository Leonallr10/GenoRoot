import type { TranslationDict } from "./en";
import { en } from "./en";
import { hasStaticTranslations } from "../static-languages";
import { getCachedTranslation } from "../translation-cache";

const staticTranslations: Record<string, TranslationDict> = { en };

const liveTranslations: Record<string, TranslationDict> = {};

export function setLiveTranslations(lang: string, dict: TranslationDict) {
  liveTranslations[lang] = dict;
}

export function hasLiveTranslations(lang: string): boolean {
  return Boolean(liveTranslations[lang]);
}

export function clearLiveTranslations(lang?: string) {
  if (lang) {
    delete liveTranslations[lang];
    return;
  }
  for (const key of Object.keys(liveTranslations)) {
    delete liveTranslations[key];
  }
}

export function getTranslations(lang: string): TranslationDict {
  if (staticTranslations[lang]) return staticTranslations[lang];
  if (liveTranslations[lang]) return liveTranslations[lang];
  return en;
}

export function t(
  lang: string,
  key: keyof Omit<TranslationDict, "sections" | "questions">,
  vars?: Record<string, string | number>
): string {
  const dict = getTranslations(lang);
  let text = dict[key] as string;
  if (vars) {
    Object.entries(vars).forEach(([k, v]) => {
      text = text.replace(`{${k}}`, String(v));
    });
  }
  return text;
}

export function getQuestionText(
  lang: string,
  questionKey: string,
  subKey?: "question" | string
): string {
  if (hasStaticTranslations(lang)) {
    const dict = getTranslations(lang);
    const q = dict.questions[questionKey];
    if (!q) return questionKey;
    if (subKey && subKey !== "question") {
      const followup = q.followups?.[subKey];
      if (followup) return followup.question;
      const row = q.rows?.[subKey];
      if (row) return row;
      const col = q.columns?.[subKey];
      if (col) return col;
    }
    return q.question;
  }

  const english = en.questions[questionKey];
  if (!english) return questionKey;

  let sourceText = english.question;
  if (subKey && subKey !== "question") {
    sourceText =
      english.followups?.[subKey]?.question ??
      english.rows?.[subKey] ??
      english.columns?.[subKey] ??
      questionKey;
  }

  return getCachedTranslation(lang, sourceText) ?? sourceText;
}

export function getOptionText(
  lang: string,
  questionKey: string,
  canonicalOption: string,
  followupKey?: string,
  columnKey?: string
): string {
  if (hasStaticTranslations(lang)) {
    const dict = getTranslations(lang);
    const q = dict.questions[questionKey];
    if (columnKey && q?.columnOptions?.[columnKey]?.[canonicalOption]) {
      return q.columnOptions[columnKey][canonicalOption];
    }
    if (followupKey && q?.followups?.[followupKey]?.options) {
      return (
        q.followups[followupKey].options![canonicalOption] ?? canonicalOption
      );
    }
    return q?.options?.[canonicalOption] ?? canonicalOption;
  }

  const q = en.questions[questionKey];
  let sourceText = canonicalOption;
  if (columnKey && q?.columnOptions?.[columnKey]?.[canonicalOption]) {
    sourceText = q.columnOptions[columnKey][canonicalOption];
  } else if (followupKey && q?.followups?.[followupKey]?.options) {
    sourceText = q.followups[followupKey].options![canonicalOption] ?? canonicalOption;
  } else {
    sourceText = q?.options?.[canonicalOption] ?? canonicalOption;
  }

  return getCachedTranslation(lang, sourceText) ?? sourceText;
}

export function getRowText(
  lang: string,
  questionKey: string,
  rowKey: string
): string {
  if (hasStaticTranslations(lang)) {
    return getTranslations(lang).questions[questionKey]?.rows?.[rowKey] ?? rowKey;
  }
  const sourceText = en.questions[questionKey]?.rows?.[rowKey] ?? rowKey;
  return getCachedTranslation(lang, sourceText) ?? sourceText;
}

export function getColumnText(
  lang: string,
  questionKey: string,
  columnKey: string
): string {
  if (hasStaticTranslations(lang)) {
    return getTranslations(lang).questions[questionKey]?.columns?.[columnKey] ?? columnKey;
  }
  const sourceText = en.questions[questionKey]?.columns?.[columnKey] ?? columnKey;
  return getCachedTranslation(lang, sourceText) ?? sourceText;
}

export function getSectionTitle(lang: string, sectionId: string): string {
  if (hasStaticTranslations(lang)) {
    return getTranslations(lang).sections[sectionId] ?? sectionId;
  }
  const sourceText = en.sections[sectionId] ?? sectionId;
  return getCachedTranslation(lang, sourceText) ?? sourceText;
}

export function needsLiveTranslation(lang: string): boolean {
  return !hasStaticTranslations(lang);
}

export { en };
