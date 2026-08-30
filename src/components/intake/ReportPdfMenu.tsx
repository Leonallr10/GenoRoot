"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown, FileDown, Loader2 } from "lucide-react";
import type { ExportLocale } from "@/components/intake/DownloadMenu";
import { t } from "@/lib/i18n/translations";
import { cn } from "@/lib/utils";

interface ReportPdfMenuProps {
  lang: string;
  languageName: string;
  isEnglishSession: boolean;
  busy: boolean;
  disabled?: boolean;
  onSelect: (locale: ExportLocale) => void;
}

export function ReportPdfMenu({
  lang,
  languageName,
  isEnglishSession,
  busy,
  disabled,
  onSelect,
}: ReportPdfMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const pick = (locale: ExportLocale) => {
    setOpen(false);
    onSelect(locale);
  };

  return (
    <div ref={rootRef} className="relative flex-1">
      <button
        type="button"
        className="genoroot-btn-back inline-flex w-full items-center justify-center gap-2 disabled:opacity-45"
        disabled={disabled || busy}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        {busy ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <FileDown className="h-5 w-5" />
        )}
        {busy ? t(lang, "preparingDownload") : t(lang, "downloadReportPdf")}
        <ChevronDown className={cn("h-4 w-4 transition", open && "rotate-180")} />
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl border border-white/70 bg-white/95 p-2 shadow-xl backdrop-blur-md"
        >
          {isEnglishSession ? (
            <PdfOption lang={lang} onClick={() => pick("en")} />
          ) : (
            <>
              <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-[#d4845c]">
                {t(lang, "downloadInEnglish")}
              </p>
              <PdfOption lang={lang} onClick={() => pick("en")} />
              <div className="my-2 h-px bg-[#f5dcc8]" />
              <p className="px-3 pb-1 pt-1 text-xs font-semibold uppercase tracking-wide text-[#d4845c]">
                {t(lang, "downloadInLanguage", { language: languageName })}
              </p>
              <PdfOption lang={lang} onClick={() => pick("local")} />
            </>
          )}
        </div>
      )}
    </div>
  );
}

function PdfOption({ lang, onClick }: { lang: string; onClick: () => void }) {
  return (
    <button
      type="button"
      role="menuitem"
      className="inline-flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-base font-semibold text-slate-800 transition hover:bg-[#fff4ea]"
      onClick={onClick}
    >
      <FileDown className="h-5 w-5 text-[#c96f35]" />
      {t(lang, "downloadPdf")}
    </button>
  );
}
