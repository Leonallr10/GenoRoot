import type { AnswerTableRow } from "@/lib/engine/answer-table";
import { downloadTextFile } from "@/lib/engine/data-export";

function escapeCsv(value: string): string {
  const safe = value.replace(/\r?\n/g, " ").trim();
  if (/[",]/.test(safe)) return `"${safe.replace(/"/g, '""')}"`;
  return safe;
}

export function answerRowsToCsv(
  rows: AnswerTableRow[],
  valueHeader = "Answer"
): string {
  const lines = [`Section,Question,${valueHeader}`];
  for (const row of rows) {
    lines.push(
      [
        escapeCsv(`Section ${row.sectionId} — ${row.sectionTitle}`),
        escapeCsv(row.label),
        escapeCsv(row.value),
      ].join(",")
    );
  }
  return lines.join("\n");
}

export function transcriptRowsToCsv(
  rows: { label: string; original: string; english: string }[]
): string {
  const lines = ["Field,Original,English"];
  for (const row of rows) {
    lines.push(
      [escapeCsv(row.label), escapeCsv(row.original), escapeCsv(row.english)].join(
        ","
      )
    );
  }
  return lines.join("\n");
}

export function combineCsvSections(...sections: string[]): string {
  return sections.filter(Boolean).join("\n\n");
}

export function downloadCsvFile(filename: string, csv: string): void {
  downloadTextFile(filename, csv, "text/csv;charset=utf-8;", true);
}
