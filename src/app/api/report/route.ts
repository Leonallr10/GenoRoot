import { NextRequest, NextResponse } from "next/server";
import { groqConfig } from "@/lib/report/groq";
import { runReportPipeline } from "@/lib/report/pipeline";

export const maxDuration = 60;
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { apiKey } = groqConfig();
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "GROQ_API_KEY is not configured. Add GROQ_API_KEY and GROQ_MODEL to .env, then restart the server.",
        },
        { status: 503 }
      );
    }

    const body = await req.json();
    const result = await runReportPipeline(body);

    if (!result.ok) {
      const status =
        result.stage === "validate"
          ? 400
          : result.stage === "generate"
            ? 502
            : 500;
      return NextResponse.json(
        { error: result.error, stage: result.stage },
        { status }
      );
    }

    return NextResponse.json({
      report: result.report,
      model: result.model,
      generatedAt: result.generatedAt,
      patientReportedNoteCount: result.payload.patientReportedNotes.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Report generation failed", details: String(error) },
      { status: 500 }
    );
  }
}
