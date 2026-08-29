"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Download, FileJson, FileText, Globe, Loader2 } from "lucide-react";
import { AnswerTable, TranscriptTable } from "@/components/intake/AnswerTable";
import { useIntakeStore } from "@/hooks/use-intake-store";
import {
  buildAnswerTableRows,
  buildEnglishAnswerTableRows,
  buildEnglishTranscriptRows,
} from "@/lib/engine/answer-table";
import {
  answerRowsToCsv,
  combineCsvSections,
  downloadCsvFile,
  transcriptRowsToCsv,
} from "@/lib/engine/csv-export";
import {
  buildEnglishIntakeJson,
  buildOriginalIntakeJson,
  downloadJsonFile,
} from "@/lib/engine/data-export";
import { t } from "@/lib/i18n/translations";
import { getLanguage } from "@/lib/i18n/languages";
import { cn } from "@/lib/utils";

type ViewMode = "original" | "english";

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

export default function CompletePage() {
  const lang = useIntakeStore((s) => s.preferredLanguage);
  const answers = useIntakeStore((s) => s.answers);
  const transcripts = useIntakeStore((s) => s.transcripts);
  const isEnglishSession = lang === "en";
  const [view, setView] = useState<ViewMode>(isEnglishSession ? "english" : "original");
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [loadingEnglish, setLoadingEnglish] = useState(false);

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

  const ensureEnglishTranslations = async (): Promise<Record<string, string>> => {
    if (Object.keys(translations).length > 0) return translations;
    if (!transcripts || Object.keys(transcripts).length === 0) return {};
    const next = await fetchTranslations(lang, transcripts);
    setTranslations(next);
    return next;
  };

  const loadEnglishView = async () => {
    setView("english");
    if (isEnglishSession) return;
    setLoadingEnglish(true);
    const next = await ensureEnglishTranslations();
    setTranslations(next);
    setLoadingEnglish(false);
  };

  const downloadOriginalCsv = () => {
    const csv = answerRowsToCsv(originalRows, "Answer");
    downloadCsvFile(`genoroot-intake-original-${lang}.csv`, csv);
  };

  const downloadEnglishCsv = async () => {
    const translated =
      isEnglishSession || Object.keys(translations).length > 0
        ? translations
        : await ensureEnglishTranslations();

    const transcriptsForCsv = buildEnglishTranscriptRows(transcripts, translated);
    const csv = combineCsvSections(
      answerRowsToCsv(englishRows, "English"),
      transcriptsForCsv.length > 0
        ? transcriptRowsToCsv(transcriptsForCsv)
        : ""
    );
    downloadCsvFile("genoroot-intake-english.csv", csv);
  };

  const downloadOriginalJson = () => {
    downloadJsonFile(
      `genoroot-intake-original-${lang}.json`,
      buildOriginalIntakeJson(lang, answers, transcripts)
    );
  };

  const downloadEnglishJson = async () => {
    const translated =
      isEnglishSession || Object.keys(translations).length > 0
        ? translations
        : await ensureEnglishTranslations();

    downloadJsonFile(
      "genoroot-intake-english.json",
      buildEnglishIntakeJson(lang, answers, transcripts, translated)
    );
  };

  const tabClass = (active: boolean) =>
    cn(
      "inline-flex flex-1 items-center justify-center gap-2 rounded-2xl px-4 py-3 text-base font-semibold transition sm:text-lg",
      active
        ? "bg-gradient-to-r from-[#e8894a] to-[#d96938] text-white shadow-md"
        : "genoroot-glass text-[#c96f35]"
    );

  const downloadBtnClass =
    "inline-flex h-[55px] w-[55px] shrink-0 items-center justify-center rounded-2xl genoroot-glass text-[#c96f35] transition hover:bg-white/60";

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
              <button
                type="button"
                className={downloadBtnClass}
                aria-label={t(lang, "downloadCsv")}
                title={t(lang, "downloadCsv")}
                onClick={() => void downloadEnglishCsv()}
              >
                <Download className="h-5 w-5" />
              </button>
              <button
                type="button"
                className={downloadBtnClass}
                aria-label={t(lang, "downloadJson")}
                title={t(lang, "downloadJson")}
                onClick={() => void downloadEnglishJson()}
              >
                <FileJson className="h-5 w-5" />
              </button>
            </div>

            {!isEnglishSession && (
              <div className="flex gap-3">
                <button
                  type="button"
                  className={tabClass(view === "original")}
                  onClick={() => setView("original")}
                >
                  <FileText className="h-5 w-5" />
                  {t(lang, "viewOriginal")}
                </button>
                <button
                  type="button"
                  className={downloadBtnClass}
                  aria-label={t(lang, "downloadCsv")}
                  title={t(lang, "downloadCsv")}
                  onClick={downloadOriginalCsv}
                >
                  <Download className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  className={downloadBtnClass}
                  aria-label={t(lang, "downloadJson")}
                  title={t(lang, "downloadJson")}
                  onClick={downloadOriginalJson}
                >
                  <FileJson className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto pb-4">
            {view === "original" && !isEnglishSession && (
              <AnswerTable rows={originalRows} valueHeader="Answer" />
            )}

            {view === "english" && (
              <>
                <AnswerTable rows={englishRows} valueHeader="English" />
                <TranscriptTable rows={transcriptRows} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
