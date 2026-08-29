import type { IntakeAnswers } from "@/lib/schema/intake";

export function downloadTextFile(
  filename: string,
  content: string,
  mimeType: string,
  bom = false
): void {
  const body = bom ? `\uFEFF${content}` : content;
  const blob = new Blob([body], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function downloadJsonFile(filename: string, data: unknown): void {
  const json = JSON.stringify(data, null, 2);
  downloadTextFile(filename, json, "application/json;charset=utf-8;");
}

export function buildOriginalIntakeJson(
  lang: string,
  answers: IntakeAnswers,
  transcripts: Record<string, string> | undefined
) {
  return {
    format: "genoroot-intake-v1",
    exportedAt: new Date().toISOString(),
    preferredLanguage: lang,
    answers,
    ...(transcripts && Object.keys(transcripts).length > 0
      ? { transcripts }
      : {}),
  };
}

export function buildEnglishIntakeJson(
  sourceLanguage: string,
  answers: IntakeAnswers,
  transcripts: Record<string, string> | undefined,
  translatedTranscripts: Record<string, string>
) {
  const voiceTranscripts = Object.entries(transcripts ?? {}).map(([field, original]) => ({
    field,
    original,
    english: translatedTranscripts[field] ?? original,
  }));

  return {
    format: "genoroot-intake-english-v1",
    exportedAt: new Date().toISOString(),
    sourceLanguage,
    answers,
    ...(voiceTranscripts.length > 0 ? { voiceTranscripts } : {}),
  };
}
