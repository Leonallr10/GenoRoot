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

const REPORT_STRING_FIELDS = [
  "title",
  "patient_overview",
  "hair_loss_timeline",
  "pattern_and_presentation",
  "family_history_notes",
  "health_and_hormonal_factors",
  "lifestyle_and_environmental_triggers",
  "products_and_procedures",
  "patient_reported_notes",
  "sample_and_consent",
  "confidence_notes",
] as const;

const REPORT_ARRAY_FIELDS = [
  "clinical_considerations",
  "recommended_discussion_points",
] as const;

function coerceToString(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (Array.isArray(value)) {
    return value.map((item) => coerceToString(item)).filter(Boolean).join("; ");
  }
  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    const parts = Object.entries(record)
      .map(([key, entry]) => {
        const text = coerceToString(entry);
        return text ? `${key}: ${text}` : "";
      })
      .filter(Boolean);
    if (parts.length > 0) return parts.join(". ");
    return JSON.stringify(value);
  }
  return String(value);
}

function coerceToStringArray(value: unknown): string[] {
  if (value == null) return [];
  if (Array.isArray(value)) {
    return value.map((item) => coerceToString(item)).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(/\r?\n|;/)
      .map((item) => item.replace(/^[-*]\s*/, "").trim())
      .filter(Boolean);
  }
  const asString = coerceToString(value);
  return asString ? [asString] : [];
}

function coerceReportJson(value: unknown): unknown {
  if (!value || typeof value !== "object" || Array.isArray(value)) return value;

  const report = { ...(value as Record<string, unknown>) };

  for (const key of REPORT_STRING_FIELDS) {
    if (key in report && typeof report[key] !== "string") {
      report[key] = coerceToString(report[key]);
    }
  }

  for (const key of REPORT_ARRAY_FIELDS) {
    if (key in report && !Array.isArray(report[key])) {
      report[key] = coerceToStringArray(report[key]);
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
