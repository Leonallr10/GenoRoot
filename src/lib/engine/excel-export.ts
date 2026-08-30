import ExcelJS from "exceljs";
import type { ExportDocumentInput } from "@/lib/report/pdf-fonts";

export async function buildIntakeExcel(
  input: ExportDocumentInput
): Promise<Uint8Array> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "GenoRoot";
  workbook.created = new Date();

  const answers = workbook.addWorksheet("Answers", {
    views: [{ state: "frozen", ySplit: 1 }],
  });
  answers.columns = [
    { header: "Section", key: "section", width: 36 },
    { header: "Question", key: "question", width: 48 },
    { header: input.valueHeader, key: "answer", width: 42 },
  ];
  styleHeader(answers);

  for (const row of input.rows) {
    answers.addRow({
      section: `Section ${row.sectionId} - ${row.sectionTitle}`,
      question: row.label,
      answer: row.value,
    });
  }

  if (input.transcripts && input.transcripts.length > 0) {
    const sheet = workbook.addWorksheet("Transcripts", {
      views: [{ state: "frozen", ySplit: 1 }],
    });
    const includeEnglish = input.transcripts.some((row) => row.english);
    sheet.columns = includeEnglish
      ? [
          { header: "Field", key: "label", width: 28 },
          { header: "Original", key: "original", width: 42 },
          { header: "English", key: "english", width: 42 },
        ]
      : [
          { header: "Field", key: "label", width: 28 },
          { header: "Transcript", key: "original", width: 56 },
        ];
    styleHeader(sheet);
    for (const row of input.transcripts) {
      sheet.addRow({
        label: row.label,
        original: row.original,
        english: row.english ?? "",
      });
    }
  }

  if (input.report) {
    const sheet = workbook.addWorksheet("Clinical Report", {
      views: [{ state: "frozen", ySplit: 1 }],
    });
    sheet.columns = [
      { header: "Section", key: "section", width: 32 },
      { header: "Content", key: "content", width: 80 },
    ];
    styleHeader(sheet);
    sheet.addRow({ section: "Title", content: input.report.title });
    for (const section of input.report.sections) {
      sheet.addRow({
        section: section.label,
        content: Array.isArray(section.value)
          ? section.value.join("\n")
          : section.value,
      });
    }
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return new Uint8Array(buffer);
}

function styleHeader(sheet: ExcelJS.Worksheet) {
  const row = sheet.getRow(1);
  row.font = { bold: true, color: { argb: "FFFFFFFF" } };
  row.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFD96938" },
  };
  row.alignment = { vertical: "middle", wrapText: true };
  row.height = 22;
}
