import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import type { ClinicalReport } from "./schema";
import {
  loadPdfFontBytes,
  needsUnicodeFont,
  type ExportDocumentInput,
} from "./pdf-fonts";

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN_X = 50;
const HEADER_HEIGHT = 64;
const MARGIN_BOTTOM = 52;
const CONTENT_TOP = PAGE_HEIGHT - HEADER_HEIGHT - 28;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_X * 2;

const ORANGE = rgb(0.851, 0.412, 0.22);
const SLATE = rgb(0.118, 0.161, 0.231);
const MUTED = rgb(0.392, 0.455, 0.545);
const RULE = rgb(0.961, 0.863, 0.784);
const CREAM = rgb(0.992, 0.973, 0.957);

export type ReportPdfMeta = {
  model?: string;
  generatedAt?: string;
};

function latinSafe(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[\u2010-\u2015\u2212]/g, "-")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\u2026/g, "...")
    .replace(/\u00A0/g, " ")
    .replace(/[^\u0009\u000A\u000D\u0020-\u007E\u00A0-\u00FF]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function tidy(text: string): string {
  return text
    .replace(/[\u2010-\u2015\u2212]/g, "-")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\u2026/g, "...")
    .replace(/\s+/g, " ")
    .trim();
}

function canEncode(font: PDFFont, text: string): boolean {
  try {
    font.encodeText(text);
    return true;
  } catch {
    return false;
  }
}

function pickFont(text: string, primary: PDFFont, fallback: PDFFont): PDFFont {
  if (canEncode(primary, text)) return primary;
  if (canEncode(fallback, text)) return fallback;
  return fallback;
}

function wrapText(font: PDFFont, text: string, size: number, maxWidth: number): string[] {
  const safe = tidy(text);
  if (!safe) return [];

  const words = safe.split(" ");
  const lines: string[] = [];
  let current = "";

  const fits = (value: string) => {
    try {
      return font.widthOfTextAtSize(value, size) <= maxWidth;
    } catch {
      return value.length < 40;
    }
  };

  const splitLong = (word: string) => {
    const chunks: string[] = [];
    let chunk = "";
    for (const char of word) {
      const next = chunk + char;
      if (chunk && !fits(next)) {
        chunks.push(chunk);
        chunk = char;
      } else {
        chunk = next;
      }
    }
    if (chunk) chunks.push(chunk);
    return chunks;
  };

  for (const word of words) {
    const pieces = fits(word) ? [word] : splitLong(word);
    for (const piece of pieces) {
      const next = current ? `${current} ${piece}` : piece;
      if (current && !fits(next)) {
        lines.push(current);
        current = piece;
      } else {
        current = next;
      }
    }
  }

  if (current) lines.push(current);
  return lines;
}

function formatGeneratedAt(value?: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return latinSafe(value);
  return date.toISOString().replace("T", " ").slice(0, 16) + " UTC";
}

export async function buildIntakeExportPdf(
  input: ExportDocumentInput
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);

  const standardRegular = await doc.embedFont(StandardFonts.Helvetica);
  const standardBold = await doc.embedFont(StandardFonts.HelveticaBold);

  let regular = standardRegular;
  let bold = standardBold;
  let headerFont = standardBold;
  let headerRegular = standardRegular;

  if (needsUnicodeFont(input.language)) {
    const fonts = await loadPdfFontBytes(input.language);
    if (fonts.latinRegular) {
      headerRegular = await doc.embedFont(fonts.latinRegular);
      regular = headerRegular;
    }
    if (fonts.latinBold) {
      headerFont = await doc.embedFont(fonts.latinBold);
      bold = headerFont;
    }
    if (fonts.script) {
      regular = await doc.embedFont(fonts.script);
    }
  }

  const pages: PDFPage[] = [];
  let page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  pages.push(page);
  let y = CONTENT_TOP;

  const ensureSpace = (needed: number) => {
    if (y - needed < MARGIN_BOTTOM + 8) {
      page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      pages.push(page);
      y = CONTENT_TOP;
    }
  };

  const drawParagraph = (
    text: string,
    options?: { size?: number; font?: PDFFont; color?: ReturnType<typeof rgb>; leading?: number }
  ) => {
    const size = options?.size ?? 10.5;
    const preferred = options?.font ?? regular;
    const color = options?.color ?? SLATE;
    const leading = options?.leading ?? size + 4;
    const font = pickFont(text, preferred, headerRegular);
    const lines = wrapText(font, text, size, CONTENT_WIDTH);
    for (const line of lines) {
      ensureSpace(leading);
      const lineFont = pickFont(line, font, headerRegular);
      page.drawText(canEncode(lineFont, line) ? line : latinSafe(line), {
        x: MARGIN_X,
        y: y - size,
        size,
        font: lineFont,
        color,
      });
      y -= leading;
    }
  };

  const drawBullets = (items: string[]) => {
    if (items.length === 0) {
      drawParagraph("None noted.");
      return;
    }
    const size = 10.5;
    const leading = size + 5;
    const indent = 16;
    for (const item of items) {
      const font = pickFont(item, regular, headerRegular);
      const lines = wrapText(font, item, size, CONTENT_WIDTH - indent);
      if (lines.length === 0) continue;
      ensureSpace(leading);
      page.drawCircle({
        x: MARGIN_X + 4,
        y: y - size + 3,
        size: 2,
        color: ORANGE,
      });
      const first = canEncode(font, lines[0]) ? lines[0] : latinSafe(lines[0]);
      page.drawText(first, {
        x: MARGIN_X + indent,
        y: y - size,
        size,
        font,
        color: SLATE,
      });
      y -= leading;
      for (const line of lines.slice(1)) {
        ensureSpace(leading);
        const text = canEncode(font, line) ? line : latinSafe(line);
        page.drawText(text, {
          x: MARGIN_X + indent,
          y: y - size,
          size,
          font,
          color: SLATE,
        });
        y -= leading;
      }
    }
  };

  const drawHeading = (label: string) => {
    ensureSpace(36);
    const font = pickFont(label, bold, headerFont);
    page.drawText(canEncode(font, label) ? label : latinSafe(label), {
      x: MARGIN_X,
      y: y - 10,
      size: 9,
      font,
      color: ORANGE,
    });
    y -= 18;
  };

  const title = input.report?.title || "GenoRoot Hair & Scalp Intake";
  drawParagraph(title, {
    size: 18,
    font: bold,
    color: SLATE,
    leading: 24,
  });
  y -= 4;
  drawParagraph(
    `${input.languageLabel} export - intake summary for clinical discussion, not a diagnosis.`,
    { size: 9.5, color: MUTED, leading: 13 }
  );

  const metaBits = [
    formatGeneratedAt(input.generatedAt),
    input.model ? latinSafe(input.model) : "",
  ].filter(Boolean);
  if (metaBits.length > 0) {
    drawParagraph(metaBits.join("  |  "), { size: 9, color: MUTED, leading: 13 });
  }

  y -= 10;
  page.drawRectangle({
    x: MARGIN_X,
    y,
    width: CONTENT_WIDTH,
    height: 2,
    color: ORANGE,
  });
  y -= 18;

  if (input.rows.length > 0) {
    drawHeading("INTAKE ANSWERS");
    let currentSection = "";
    for (const row of input.rows) {
      const sectionLabel = `Section ${row.sectionId} - ${row.sectionTitle}`;
      if (sectionLabel !== currentSection) {
        currentSection = sectionLabel;
        drawParagraph(sectionLabel, {
          size: 10,
          font: bold,
          color: SLATE,
          leading: 14,
        });
        y -= 2;
      }
      drawParagraph(row.label, { size: 9, color: MUTED, leading: 12 });
      drawParagraph(row.value, { size: 11, font: bold, leading: 15 });
      y -= 8;
    }
  }

  if (input.transcripts && input.transcripts.length > 0) {
    drawHeading("SPOKEN / TYPED NOTES");
    for (const row of input.transcripts) {
      drawParagraph(row.label, { size: 9, color: MUTED, leading: 12 });
      drawParagraph(row.original, { size: 11, leading: 15 });
      if (row.english && row.english !== row.original) {
        drawParagraph(`English: ${row.english}`, { size: 10, color: MUTED, leading: 14 });
      }
      y -= 8;
    }
  }

  if (input.report) {
    drawHeading("CLINICAL REPORT");
    for (const section of input.report.sections) {
      drawHeading(section.label.toUpperCase());
      if (Array.isArray(section.value)) {
        drawBullets(section.value);
      } else {
        drawParagraph(section.value || "Not reported.");
      }
      y -= 10;
    }
  }

  ensureSpace(28);
  page.drawRectangle({
    x: MARGIN_X,
    y,
    width: CONTENT_WIDTH,
    height: 1,
    color: RULE,
  });
  y -= 14;
  drawParagraph(
    "This document is generated from patient-reported intake answers, including typed and spoken notes. It is not a diagnosis or treatment plan.",
    { size: 8.5, color: MUTED, leading: 12 }
  );

  const total = pages.length;
  const subtitle = `Hair & Scalp Intake  |  ${input.languageLabel}`;
  pages.forEach((pdfPage, index) => {
    pdfPage.drawRectangle({
      x: 0,
      y: PAGE_HEIGHT - HEADER_HEIGHT,
      width: PAGE_WIDTH,
      height: HEADER_HEIGHT,
      color: CREAM,
    });
    pdfPage.drawRectangle({
      x: 0,
      y: PAGE_HEIGHT - 6,
      width: PAGE_WIDTH,
      height: 6,
      color: ORANGE,
    });
    pdfPage.drawText("GenoRoot", {
      x: MARGIN_X,
      y: PAGE_HEIGHT - 32,
      size: 14,
      font: headerFont,
      color: ORANGE,
    });
    pdfPage.drawText(latinSafe(subtitle), {
      x: MARGIN_X,
      y: PAGE_HEIGHT - 48,
      size: 9,
      font: headerRegular,
      color: MUTED,
    });

    pdfPage.drawRectangle({
      x: 0,
      y: 0,
      width: PAGE_WIDTH,
      height: 36,
      color: CREAM,
    });
    pdfPage.drawText("Confidential - for clinical use", {
      x: MARGIN_X,
      y: 16,
      size: 8,
      font: headerRegular,
      color: MUTED,
    });
    const pageLabel = `Page ${index + 1} of ${total}`;
    pdfPage.drawText(pageLabel, {
      x: PAGE_WIDTH - MARGIN_X - headerRegular.widthOfTextAtSize(pageLabel, 8),
      y: 16,
      size: 8,
      font: headerRegular,
      color: MUTED,
    });
  });

  doc.setTitle(latinSafe(title) || "GenoRoot Intake");
  doc.setAuthor("GenoRoot");
  doc.setSubject("Hair and scalp intake export");
  doc.setCreator("GenoRoot");

  return doc.save();
}

export async function buildReportPdf(
  report: ClinicalReport,
  meta?: ReportPdfMeta
): Promise<Uint8Array> {
  return buildIntakeExportPdf({
    language: "en",
    languageLabel: "English",
    valueHeader: "English",
    rows: [],
    report: {
      title: report.title,
      sections: [
        { label: "Overview", value: report.patient_overview },
        { label: "Timeline", value: report.hair_loss_timeline },
        { label: "Pattern & presentation", value: report.pattern_and_presentation },
        { label: "Family history", value: report.family_history_notes },
        { label: "Health & hormones", value: report.health_and_hormonal_factors },
        { label: "Lifestyle & triggers", value: report.lifestyle_and_environmental_triggers },
        { label: "Products & procedures", value: report.products_and_procedures },
        { label: "Patient-reported notes", value: report.patient_reported_notes },
        { label: "Clinical considerations", value: report.clinical_considerations },
        { label: "Discussion points", value: report.recommended_discussion_points },
        { label: "Sample & consent", value: report.sample_and_consent },
        { label: "Certainty notes", value: report.confidence_notes },
      ],
    },
    model: meta?.model,
    generatedAt: meta?.generatedAt,
  });
}

export function pdfBytesToBlob(bytes: Uint8Array): Blob {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return new Blob([copy], { type: "application/pdf" });
}
