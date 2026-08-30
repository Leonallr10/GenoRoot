import { buildReportPayload } from "./payload";
import { buildReportUserPrompt, REPORT_SYSTEM_PROMPT } from "./prompt";
import { extractJsonText, generateWithGroq } from "./groq";
import {
  clinicalReportSchema,
  reportRequestSchema,
  type ClinicalReport,
  type ReportPayload,
  type ReportRequest,
} from "./schema";

export type ReportPipelineSuccess = {
  ok: true;
  report: ClinicalReport;
  payload: ReportPayload;
  model: string;
  generatedAt: string;
};

export type ReportPipelineFailure = {
  ok: false;
  error: string;
  stage: "validate" | "compose" | "generate" | "parse";
};

export type ReportPipelineResult = ReportPipelineSuccess | ReportPipelineFailure;

function fail(
  stage: ReportPipelineFailure["stage"],
  error: unknown
): ReportPipelineFailure {
  return {
    ok: false,
    stage,
    error: error instanceof Error ? error.message : String(error),
  };
}

function coerceReportJson(value: unknown): unknown {
  if (!value || typeof value !== "object" || Array.isArray(value)) return value;

  const report = { ...(value as Record<string, unknown>) };
  for (const key of ["clinical_considerations", "recommended_discussion_points"]) {
    const field = report[key];
    if (typeof field === "string") {
      report[key] = field
        .split(/\r?\n|;/)
        .map((item) => item.replace(/^[-*]\s*/, "").trim())
        .filter(Boolean);
    }
  }
  return report;
}

export async function runReportPipeline(
  input: unknown
): Promise<ReportPipelineResult> {
  let request: ReportRequest;
  try {
    request = reportRequestSchema.parse(input);
  } catch (error) {
    return fail("validate", error);
  }

  if (Object.keys(request.answers).length === 0) {
    return fail("validate", "No intake answers were provided.");
  }

  let payload: ReportPayload;
  let userPrompt: string;
  try {
    payload = buildReportPayload(
      request.answers,
      request.language,
      request.transcripts,
      request.englishTranscripts
    );
    userPrompt = buildReportUserPrompt(payload);
  } catch (error) {
    return fail("compose", error);
  }

  let raw: string;
  let model: string;
  try {
    const generated = await generateWithGroq([
      { role: "system", content: REPORT_SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ]);
    raw = generated.content;
    model = generated.model;
  } catch (error) {
    return fail("generate", error);
  }

  try {
    const parsed = coerceReportJson(JSON.parse(extractJsonText(raw)));
    const report = clinicalReportSchema.parse(parsed);
    return {
      ok: true,
      report,
      payload,
      model,
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    return fail("parse", error);
  }
}
