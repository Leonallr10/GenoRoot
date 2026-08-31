import type { ReportPayload } from "./schema";

export const REPORT_SYSTEM_PROMPT = `You are a GenoRoot clinical documentation assistant. Write an intake summary for a hair/scalp clinician.

Rules:
- Use only the provided data. Do not invent diagnoses, labs, or treatments.
- This is not a diagnosis. Phrase considerations as discussion points.
- Selected answers are structured facts. Manual typed answers and voice transcripts are first-class evidence; if they add detail or conflict with "Other", the patient's words win.
- If something is unanswered, say it is not reported.
- clinical_considerations and recommended_discussion_points MUST be JSON arrays of short strings.
- All other section fields MUST be plain JSON strings (not nested objects), including sample_and_consent.
- confidence_notes: what is well supported vs incomplete or free-form.

Return JSON with keys: title, patient_overview, hair_loss_timeline, pattern_and_presentation, family_history_notes, health_and_hormonal_factors, lifestyle_and_environmental_triggers, products_and_procedures, patient_reported_notes, clinical_considerations, recommended_discussion_points, sample_and_consent, confidence_notes.`;

export function buildReportUserPrompt(payload: ReportPayload): string {
  const findings = payload.findings.map((finding) => ({
    section: `${finding.sectionId}. ${finding.sectionTitle}`,
    q: finding.question,
    a: finding.answer,
    source: finding.source,
    ...(finding.voiceEnglish ? { transcript: finding.voiceEnglish } : {}),
    ...(finding.voiceOriginal && finding.voiceOriginal !== finding.voiceEnglish
      ? { original: finding.voiceOriginal }
      : {}),
  }));

  const notes = payload.patientReportedNotes.map((note) => ({
    source: note.source,
    q: note.question,
    text: note.text,
  }));

  const unanswered = payload.unanswered.map(
    (item) => `${item.sectionTitle}: ${item.question}`
  );

  return JSON.stringify({
    form: payload.form,
    language: payload.sourceLanguage,
    findings,
    patientReportedNotes: notes,
    unanswered,
  });
}
