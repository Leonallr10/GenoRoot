import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { buildIntakeExcel } from "@/lib/engine/excel-export";
import { buildIntakeExportPdf } from "@/lib/report/pdf";

export const runtime = "nodejs";
export const maxDuration = 60;

const exportSchema = z.object({
  format: z.enum(["xlsx", "pdf"]),
  language: z.string().min(1),
  languageLabel: z.string().min(1),
  valueHeader: z.string().min(1),
  rows: z.array(
    z.object({
      sectionId: z.string(),
      sectionTitle: z.string(),
      label: z.string(),
      value: z.string(),
    })
  ),
  transcripts: z
    .array(
      z.object({
        label: z.string(),
        original: z.string(),
        english: z.string().optional(),
      })
    )
    .optional(),
  report: z
    .object({
      title: z.string(),
      sections: z.array(
        z.object({
          label: z.string(),
          value: z.union([z.string(), z.array(z.string())]),
        })
      ),
    })
    .optional(),
  model: z.string().optional(),
  generatedAt: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const parsed = exportSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid export payload." },
        { status: 400 }
      );
    }

    const input = parsed.data;
    const langTag = input.language === "en" ? "english" : input.language;
    const bytes =
      input.format === "xlsx"
        ? await buildIntakeExcel(input)
        : await buildIntakeExportPdf(input);

    const filename =
      input.format === "xlsx"
        ? `genoroot-intake-${langTag}.xlsx`
        : `genoroot-intake-${langTag}.pdf`;
    const mime =
      input.format === "xlsx"
        ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        : "application/pdf";

    return new NextResponse(Buffer.from(bytes), {
      status: 200,
      headers: {
        "Content-Type": mime,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Export failed", details: String(error) },
      { status: 500 }
    );
  }
}
