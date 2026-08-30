"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown, Download, FileDown, FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { t } from "@/lib/i18n/translations";
import { cn } from "@/lib/utils";

export type ExportFormat = "csv" | "xlsx" | "pdf";
export type ExportLocale = "en" | "local";

interface DownloadMenuProps {
  lang: string;
  languageName: string;
  isEnglishSession: boolean;
  busy: boolean;
  disabled?: boolean;
  onSelect: (format: ExportFormat, locale: ExportLocale) => void;
}

const FORMATS: { id: ExportFormat; labelKey: "downloadCsv" | "downloadExcel" | "downloadPdf"; icon: typeof FileText }[] =
  [
    { id: "csv", labelKey: "downloadCsv", icon: FileText },
    { id: "xlsx", labelKey: "downloadExcel", icon: FileSpreadsheet },
    { id: "pdf", labelKey: "downloadPdf", icon: FileDown },
  ];

export function DownloadMenu({
  lang,
  languageName,
  isEnglishSession,
  busy,
  disabled,
  onSelect,
}: DownloadMenuProps) {
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

  const handleSelect = (format: ExportFormat, locale: ExportLocale) => {
    setOpen(false);
    onSelect(format, locale);
  };

  return (
    <div ref={rootRef} className="relative w-full">
      <button
        type="button"
        className="genoroot-btn-back inline-flex w-full items-center justify-center gap-2"
        disabled={disabled || busy}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        {busy ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Download className="h-5 w-5" />
        )}
        {busy ? t(lang, "preparingDownload") : t(lang, "download")}
        <ChevronDown className={cn("h-4 w-4 transition", open && "rotate-180")} />
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl border border-white/70 bg-white/95 p-2 shadow-xl backdrop-blur-md"
        >
          {isEnglishSession ? (
            <FormatList lang={lang} onSelect={(format) => handleSelect(format, "en")} />
          ) : (
            <>
              <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-[#d4845c]">
                {t(lang, "downloadInEnglish")}
              </p>
              <FormatList lang={lang} onSelect={(format) => handleSelect(format, "en")} />
              <div className="my-2 h-px bg-[#f5dcc8]" />
              <p className="px-3 pb-1 pt-1 text-xs font-semibold uppercase tracking-wide text-[#d4845c]">
                {t(lang, "downloadInLanguage", { language: languageName })}
              </p>
              <FormatList lang={lang} onSelect={(format) => handleSelect(format, "local")} />
            </>
          )}
        </div>
      )}
    </div>
  );
}

function FormatList({
  lang,
  onSelect,
}: {
  lang: string;
  onSelect: (format: ExportFormat) => void;
}) {
  return (
    <div className="flex flex-col">
      {FORMATS.map(({ id, labelKey, icon: Icon }) => (
        <button
          key={id}
          type="button"
          role="menuitem"
          className="inline-flex items-center gap-3 rounded-xl px-3 py-3 text-left text-base font-semibold text-slate-800 transition hover:bg-[#fff4ea]"
          onClick={() => onSelect(id)}
        >
          <Icon className="h-5 w-5 text-[#c96f35]" />
          {t(lang, labelKey)}
        </button>
      ))}
    </div>
  );
}
