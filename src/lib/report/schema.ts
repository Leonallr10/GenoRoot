import { z } from "zod";
import { intakeAnswersSchema } from "@/lib/schema/intake";

export const reportRequestSchema = z.object({
  language: z.string().min(1),
  answers: intakeAnswersSchema,
  transcripts: z.record(z.string(), z.string()).optional(),
  englishTranscripts: z.record(z.string(), z.string()).optional(),
});

export type ReportRequest = z.infer<typeof reportRequestSchema>;

export const answerSourceSchema = z.enum([
  "selected",
  "manual",
  "voice",
  "mixed",
]);

export type AnswerSource = z.infer<typeof answerSourceSchema>;

export const reportFindingSchema = z.object({
  stepId: z.string(),
  sectionId: z.string(),
  sectionTitle: z.string(),
  question: z.string(),
  answer: z.string(),
  source: answerSourceSchema,
  voiceOriginal: z.string().optional(),
  voiceEnglish: z.string().optional(),
});

export type ReportFinding = z.infer<typeof reportFindingSchema>;

export const reportPayloadSchema = z.object({
  form: z.string(),
  sourceLanguage: z.string(),
  findings: z.array(reportFindingSchema),
  unanswered: z.array(
    z.object({
      sectionTitle: z.string(),
      question: z.string(),
    })
  ),
  patientReportedNotes: z.array(
    z.object({
      question: z.string(),
      text: z.string(),
      source: z.enum(["manual", "voice"]),
    })
  ),
});

export type ReportPayload = z.infer<typeof reportPayloadSchema>;

export const clinicalReportSchema = z.object({
  title: z.string(),
  patient_overview: z.string(),
  hair_loss_timeline: z.string(),
  pattern_and_presentation: z.string(),
  family_history_notes: z.string(),
  health_and_hormonal_factors: z.string(),
  lifestyle_and_environmental_triggers: z.string(),
  products_and_procedures: z.string(),
  patient_reported_notes: z.string(),
  clinical_considerations: z.array(z.string()),
  recommended_discussion_points: z.array(z.string()),
  sample_and_consent: z.string(),
  confidence_notes: z.string(),
});

export type ClinicalReport = z.infer<typeof clinicalReportSchema>;

export const REPORT_JSON_SCHEMA = {
  name: "clinical_intake_report",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: [
      "title",
      "patient_overview",
      "hair_loss_timeline",
      "pattern_and_presentation",
      "family_history_notes",
      "health_and_hormonal_factors",
      "lifestyle_and_environmental_triggers",
      "products_and_procedures",
      "patient_reported_notes",
      "clinical_considerations",
      "recommended_discussion_points",
      "sample_and_consent",
      "confidence_notes",
    ],
    properties: {
      title: { type: "string" },
      patient_overview: { type: "string" },
      hair_loss_timeline: { type: "string" },
      pattern_and_presentation: { type: "string" },
      family_history_notes: { type: "string" },
      health_and_hormonal_factors: { type: "string" },
      lifestyle_and_environmental_triggers: { type: "string" },
      products_and_procedures: { type: "string" },
      patient_reported_notes: { type: "string" },
      clinical_considerations: {
        type: "array",
        items: { type: "string" },
      },
      recommended_discussion_points: {
        type: "array",
        items: { type: "string" },
      },
      sample_and_consent: { type: "string" },
      confidence_notes: { type: "string" },
    },
  },
} as const;

export const REPORT_SECTIONS: {
  key: keyof ClinicalReport;
  label: string;
}[] = [
  { key: "patient_overview", label: "Overview" },
  { key: "hair_loss_timeline", label: "Timeline" },
  { key: "pattern_and_presentation", label: "Pattern & presentation" },
  { key: "family_history_notes", label: "Family history" },
  { key: "health_and_hormonal_factors", label: "Health & hormones" },
  { key: "lifestyle_and_environmental_triggers", label: "Lifestyle & triggers" },
  { key: "products_and_procedures", label: "Products & procedures" },
  { key: "patient_reported_notes", label: "Patient-reported notes" },
  { key: "clinical_considerations", label: "Clinical considerations" },
  { key: "recommended_discussion_points", label: "Discussion points" },
  { key: "sample_and_consent", label: "Sample & consent" },
  { key: "confidence_notes", label: "Certainty notes" },
];
