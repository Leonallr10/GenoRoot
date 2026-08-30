"use client";

import { useCallback, useState } from "react";
import type { IntakeAnswers } from "@/lib/schema/intake";
import type { ClinicalReport } from "@/lib/report/schema";

export type ReportMeta = {
  report: ClinicalReport;
  model: string;
  generatedAt: string;
};

export function useClinicalReport(initialReport: ReportMeta | null = null) {
  const [report, setReport] = useState<ReportMeta | null>(initialReport);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(
    async (input: {
      language: string;
      answers: IntakeAnswers;
      transcripts?: Record<string, string>;
      englishTranscripts?: Record<string, string>;
    }) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Report generation failed.");
        }
        const next: ReportMeta = {
          report: data.report,
          model: data.model,
          generatedAt: data.generatedAt,
        };
        setReport(next);
        return next;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { report, setReport, loading, error, generate };
}
