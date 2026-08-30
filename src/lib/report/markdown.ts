import { REPORT_SECTIONS, type ClinicalReport } from "./schema";

function asParagraphs(value: string | string[]): string {
  if (Array.isArray(value)) {
    return value.map((item) => `- ${item}`).join("\n");
  }
  return value;
}

export function reportToMarkdown(
  report: ClinicalReport,
  meta?: { model?: string; generatedAt?: string }
): string {
  const lines = [`# ${report.title}`, ""];

  if (meta?.generatedAt) {
    lines.push(`Generated: ${meta.generatedAt}`);
  }
  if (meta?.model) {
    lines.push(`Model: ${meta.model}`);
  }
  if (meta?.generatedAt || meta?.model) lines.push("");

  for (const section of REPORT_SECTIONS) {
    lines.push(`## ${section.label}`, "");
    lines.push(asParagraphs(report[section.key]), "");
  }

  lines.push(
    "---",
    "",
    "_This is an intake summary for clinical discussion, not a medical diagnosis._"
  );

  return lines.join("\n");
}
