"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  ClipboardList,
  FileText,
  Globe,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { AnswerTable, TranscriptTable } from "@/components/intake/AnswerTable";
import { DownloadMenu, type ExportFormat, type ExportLocale } from "@/components/intake/DownloadMenu";
import { ReportPdfMenu } from "@/components/intake/ReportPdfMenu";
import { ReportView } from "@/components/intake/ReportView";
import { useClinicalReport } from "@/hooks/use-clinical-report";
import { useIntakeStore } from "@/hooks/use-intake-store";
import {
  buildAnswerTableRows,
  buildEnglishAnswerTableRows,
  buildEnglishTranscriptRows,
  type AnswerTableRow,
} from "@/lib/engine/answer-table";
import {
  answerRowsToCsv,
  combineCsvSections,
  downloadCsvFile,
  originalTranscriptRowsToCsv,
  reportSectionsToCsv,
  transcriptRowsToCsv,
} from "@/lib/engine/csv-export";
import { downloadBlobFile } from "@/lib/engine/data-export";
import { REPORT_SECTIONS, type ClinicalReport } from "@/lib/report/schema";
import { t } from "@/lib/i18n/translations";
import { getLanguage } from "@/lib/i18n/languages";
import { cn } from "@/lib/utils";

type ViewMode = "original" | "english";

type ReportExport = {
  title: string;
  sections: { label: string; value: string | string[] }[];
};

async function fetchTranslations(
  lang: string,
  transcripts: Record<string, string> | undefined
): Promise<Record<string, string>> {
  const entries = Object.entries(transcripts ?? {});
  const next: Record<string, string> = {};
  for (const [key, text] of entries) {
    const res = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, language: lang, direction: "toEnglish" }),
    });
    const data = await res.json();
    next[key] = data.translation ?? text;
  }
  return next;
}

function reportToExport(
  report: ClinicalReport,
  labels?: Record<string, string>
): ReportExport {
  return {
    title: report.title,
    sections: REPORT_SECTIONS.map((section) => ({
      label: labels?.[section.key] ?? section.label,
      value: report[section.key],
    })),
  };
}

async function localizeReport(
  report: ClinicalReport,
  targetLang: string
): Promise<ReportExport> {
  if (targetLang === "en") return reportToExport(report);

  const texts: string[] = [report.title, ...REPORT_SECTIONS.map((section) => section.label)];
  for (const section of REPORT_SECTIONS) {
    const value = report[section.key];
    if (Array.isArray(value)) texts.push(...value);
    else texts.push(value);
  }

  const res = await fetch("/api/translate/batch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      texts,
      sourceLang: "en",
      targetLang,
    }),
  });
  const data = await res.json();
  if (!res.ok) return reportToExport(report);

  const translated: string[] = data.translations ?? texts;
  let index = 0;
  const title = translated[index++] ?? report.title;
  const labels: Record<string, string> = {};
  for (const section of REPORT_SECTIONS) {
    labels[section.key] = translated[index++] ?? section.label;
  }

  return {
    title,
    sections: REPORT_SECTIONS.map((section) => {
      const value = report[section.key];
      if (Array.isArray(value)) {
        return {
          label: labels[section.key],
          value: value.map(() => translated[index++] ?? ""),
        };
      }
      return {
        label: labels[section.key],
        value: translated[index++] ?? value,
      };
    }),
  };
}

export default function CompletePage() {
  const lang = useIntakeStore((s) => s.preferredLanguage);
  const answers = useIntakeStore((s) => s.answers);
  const transcripts = useIntakeStore((s) => s.transcripts);
  const isEnglishSession = lang === "en";
  const [view, setView] = useState<ViewMode>(isEnglishSession ? "english" : "original");
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [loadingEnglish, setLoadingEnglish] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [downloadingReportPdf, setDownloadingReportPdf] = useState(false);
  const { report, loading: generating, error: reportError, generate } =
    useClinicalReport();

  const originalRows = useMemo(
    () => buildAnswerTableRows(answers, lang),
    [answers, lang]
  );

  const englishRows = useMemo(() => buildEnglishAnswerTableRows(answers), [answers]);

  const transcriptRows = useMemo(
    () => buildEnglishTranscriptRows(transcripts, translations),
    [transcripts, translations]
  );

  const languageName = getLanguage(lang)?.nativeName ?? lang;
  const hasAnswers = Object.keys(answers).length > 0;

  const ensureEnglishTranslations = async (): Promise<Record<string, string>> => {
    if (Object.keys(translations).length > 0) return translations;
    if (!transcripts || Object.keys(transcripts).length === 0) return {};
    const next = await fetchTranslations(lang, transcripts);
    setTranslations(next);
    return next;
  };

  const generateReport = async () => {
    const englishTranscripts = isEnglishSession
      ? transcripts
      : await ensureEnglishTranslations();
    await generate({
      language: lang,
      answers,
      transcripts,
      englishTranscripts,
    });
  };

  const loadEnglishView = async () => {
    setView("english");
    if (isEnglishSession) return;
    setLoadingEnglish(true);
    const next = await ensureEnglishTranslations();
    setTranslations(next);
    setLoadingEnglish(false);
  };

  const originalTranscripts = Object.entries(transcripts ?? {}).map(([key, original]) => ({
    label: key.replace(/\./g, " · "),
    original,
  }));

  const downloadClinicalReportPdf = async (locale: ExportLocale) => {
    if (!report) return;

    const targetLang = locale === "en" ? "en" : lang;
    const suffix = targetLang === "en" ? "english" : targetLang;
    setDownloadingReportPdf(true);

    try {
      if (targetLang === "en") {
        const res = await fetch("/api/report/pdf", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            report: report.report,
            model: report.model,
            generatedAt: report.generatedAt,
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "PDF download failed.");
        }
        downloadBlobFile(`genoroot-clinical-report-${suffix}.pdf`, await res.blob());
        return;
      }

      const localizedReport = await localizeReport(report.report, targetLang);
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          format: "pdf",
          language: targetLang,
          languageLabel: languageName,
          valueHeader: languageName,
          rows: [],
          report: localizedReport,
          model: report.model,
          generatedAt: report.generatedAt,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "PDF download failed.");
      }
      downloadBlobFile(`genoroot-clinical-report-${suffix}.pdf`, await res.blob());
    } catch (error) {
      alert(error instanceof Error ? error.message : "PDF download failed.");
    } finally {
      setDownloadingReportPdf(false);
    }
  };

  const handleExport = async (format: ExportFormat, locale: ExportLocale) => {
    const targetLang = locale === "en" ? "en" : lang;
    const languageLabel =
      targetLang === "en" ? "English" : languageName;
    const rows: AnswerTableRow[] =
      targetLang === "en" ? englishRows : originalRows;
    const valueHeader = targetLang === "en" ? "English" : languageName;

    setExporting(true);
    try {
      const englishTranscripts =
        targetLang === "en" ? await ensureEnglishTranslations() : translations;
      const englishTranscriptList = buildEnglishTranscriptRows(
        transcripts,
        englishTranscripts
      );
      const localizedReport = report
        ? await localizeReport(report.report, targetLang)
        : undefined;

      if (format === "csv") {
        const transcriptCsv =
          targetLang === "en"
            ? englishTranscriptList.length > 0
              ? transcriptRowsToCsv(englishTranscriptList)
              : ""
            : originalTranscriptRowsToCsv(originalTranscripts);
        const reportCsv = localizedReport
          ? reportSectionsToCsv(localizedReport.title, localizedReport.sections)
          : "";
        const csv = combineCsvSections(
          answerRowsToCsv(rows, valueHeader),
          transcriptCsv,
          reportCsv
        );
        const suffix = targetLang === "en" ? "english" : targetLang;
        downloadCsvFile(`genoroot-intake-${suffix}.csv`, csv);
        return;
      }

      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          format,
          language: targetLang,
          languageLabel,
          valueHeader,
          rows,
          transcripts:
            targetLang === "en"
              ? englishTranscriptList
              : originalTranscripts,
          report: localizedReport,
          model: report?.model,
          generatedAt: report?.generatedAt,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Download failed.");
      }
      const blob = await res.blob();
      const suffix = targetLang === "en" ? "english" : targetLang;
      const filename =
        format === "xlsx"
          ? `genoroot-intake-${suffix}.xlsx`
          : `genoroot-intake-${suffix}.pdf`;
      downloadBlobFile(filename, blob);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Download failed.");
    } finally {
      setExporting(false);
    }
  };

  const tabClass = (active: boolean) =>
    cn(
      "inline-flex flex-1 items-center justify-center gap-2 rounded-2xl px-4 py-3 text-base font-semibold transition sm:text-lg",
      active
        ? "bg-gradient-to-r from-[#e8894a] to-[#d96938] text-white shadow-md"
        : "genoroot-glass text-[#c96f35]"
    );

  return (
    <div className="flex min-h-dvh w-full flex-col safe-top safe-bottom">
      <div className="flex min-h-0 flex-1 flex-col px-5 py-6">
        <header className="shrink-0 pb-6">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-1 h-9 w-9 shrink-0 text-[#e8894a]" />
            <div>
              <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
                {t(lang, "intakeComplete")}
              </h1>
              <p className="mt-2 text-lg text-slate-600 sm:text-xl">
                {t(lang, "recordedIn", { language: languageName })}
              </p>
            </div>
          </div>
        </header>

        <div className="flex min-h-0 flex-1 flex-col gap-5">
          <div className="flex w-full flex-col gap-3">
            <div className="flex gap-3">
              <button
                type="button"
                className={tabClass(view === "english")}
                disabled={loadingEnglish}
                onClick={loadEnglishView}
              >
                {loadingEnglish ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Globe className="h-5 w-5" />
                )}
                {t(lang, "viewInEnglish")}
              </button>
            </div>

            {!isEnglishSession && (
              <button
                type="button"
                className={tabClass(view === "original")}
                onClick={() => setView("original")}
              >
                <FileText className="h-5 w-5" />
                {t(lang, "viewOriginal")}
              </button>
            )}

            <DownloadMenu
              lang={lang}
              languageName={languageName}
              isEnglishSession={isEnglishSession}
              busy={exporting}
              disabled={!hasAnswers}
              onSelect={(format, locale) => void handleExport(format, locale)}
            />
          </div>

          <div className="min-h-0 flex-1 space-y-8 overflow-y-auto pb-4">
            {view === "original" && !isEnglishSession && (
              <AnswerTable rows={originalRows} valueHeader="Answer" />
            )}

            {view === "english" && (
              <>
                <AnswerTable rows={englishRows} valueHeader="English" />
                <TranscriptTable rows={transcriptRows} />
              </>
            )}

            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <ClipboardList className="h-6 w-6 shrink-0 text-[#c96f35]" />
                <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                  {t(lang, "clinicalReport")}
                </h2>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  className="genoroot-btn-continue inline-flex flex-1 items-center justify-center gap-2"
                  disabled={generating || !hasAnswers}
                  onClick={() => void generateReport()}
                >
                  {generating ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : report ? (
                    <RefreshCw className="h-5 w-5" />
                  ) : (
                    <ClipboardList className="h-5 w-5" />
                  )}
                  {generating
                    ? t(lang, "generatingReport")
                    : report
                      ? t(lang, "regenerateReport")
                      : t(lang, "generateReport")}
                </button>

                <ReportPdfMenu
                  lang={lang}
                  languageName={languageName}
                  isEnglishSession={isEnglishSession}
                  busy={downloadingReportPdf}
                  disabled={!report}
                  onSelect={(locale) => void downloadClinicalReportPdf(locale)}
                />
              </div>

              {generating && !report && (
                <p className="inline-flex items-center gap-2 text-base text-[#c96f35]">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t(lang, "generatingReport")}
                </p>
              )}

              {reportError && (
                <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-base text-red-700">
                  {t(lang, "reportFailed")} {reportError}
                </p>
              )}

              {report && (
                <ReportView
                  report={report.report}
                  model={report.model}
                  generatedAt={report.generatedAt}
                />
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
