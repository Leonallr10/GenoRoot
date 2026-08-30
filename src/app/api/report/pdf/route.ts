import { NextRequest, NextResponse } from "next/server";
import { buildReportPdf } from "@/lib/report/pdf";
import { clinicalReportSchema } from "@/lib/report/schema";
import { z } from "zod";

export const runtime = "nodejs";

const pdfRequestSchema = z.object({
  report: clinicalReportSchema,
  model: z.string().optional(),
  generatedAt: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = pdfRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid report payload for PDF export." },
        { status: 400 }
      );
    }

    const bytes = await buildReportPdf(parsed.data.report, {
      model: parsed.data.model,
      generatedAt: parsed.data.generatedAt,
    });

    return new NextResponse(Buffer.from(bytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition":
          'attachment; filename="genoroot-clinical-report.pdf"',
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "PDF generation failed", details: String(error) },
      { status: 500 }
    );
  }
}
