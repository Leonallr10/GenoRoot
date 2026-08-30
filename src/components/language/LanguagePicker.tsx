"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, ChevronDown, Loader2, RotateCcw, Search } from "lucide-react";
import {
  detectLocaleHints,
  getLanguage,
  getSuggestedLanguages,
  hasStaticTranslations,
  isBrowserRecommended,
  isIntakeLanguage,
  type Language,
} from "@/lib/i18n/languages";
import { getWhisperLanguage } from "@/lib/i18n/whisper-languages";
import type { WhisperLanguage } from "@/lib/i18n/whisper-languages";
import { t } from "@/lib/i18n/translations";
import { useIntakeStore } from "@/hooks/use-intake-store";
import {
  getIntakeContinuePath,
  getIntakeContinueStepIndex,
  hasIntakeProgress,
} from "@/lib/engine/intake-navigation";
import { getResumeStepIndex, getVisibleSteps } from "@/lib/engine/question-flow";
import { prefetchIntakeTranslations } from "@/lib/i18n/prefetch-intake-translations";

type LanguageOption = Language | WhisperLanguage;

type PrefetchStatus = "idle" | "loading" | "ready" | "failed";

function formatLanguageLabel(lang: LanguageOption): string {
  if (lang.nativeName !== lang.name) {
    return `${lang.nativeName} (${lang.name})`;
  }
  return lang.nativeName;
}

export function LanguagePicker() {
  const router = useRouter();
  const setLanguage = useIntakeStore((s) => s.setLanguage);
  const setCurrentStep = useIntakeStore((s) => s.setCurrentStep);
  const resetIntake = useIntakeStore((s) => s.resetIntake);
  const answers = useIntakeStore((s) => s.answers);
  const submitted = useIntakeStore((s) => s.submitted);
  const storedLang = useIntakeStore((s) => s.preferredLanguage);
  const sessionLang = useIntakeStore((s) => s.intakeLanguage) ?? storedLang;

  const [localeHints, setLocaleHints] = useState(() => detectLocaleHints());
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedCode, setSelectedCode] = useState<string | null>(storedLang || null);
  const [searchResults, setSearchResults] = useState<WhisperLanguage[]>([]);
  const [searching, setSearching] = useState(false);
  const [prefetchStatus, setPrefetchStatus] = useState<PrefetchStatus>("idle");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setLocaleHints(detectLocaleHints());
  }, []);

  const suggestions = useMemo(
    () => getSuggestedLanguages(localeHints),
    [localeHints]
  );

  const selectedLang = useMemo(() => {
    if (!selectedCode) return null;
    return getLanguage(selectedCode) ?? getWhisperLanguage(selectedCode) ?? null;
  }, [selectedCode]);

  const savedProgress = hasIntakeProgress(answers, Boolean(submitted));
  const visibleStepCount = useMemo(() => getVisibleSteps(answers).length, [answers]);
  const resumeStep = useMemo(() => getResumeStepIndex(answers), [answers]);
  const sessionLanguageName =
    getLanguage(sessionLang)?.nativeName ?? sessionLang;

  const isSearching = query.trim().length > 0;
  const listItems: LanguageOption[] = isSearching ? searchResults : suggestions;

  const fetchSearchResults = useCallback(async (q: string) => {
    searchAbortRef.current?.abort();
    if (!q.trim()) {
      setSearchResults([]);
      setSearching(false);
      return;
    }

    const controller = new AbortController();
    searchAbortRef.current = controller;
    setSearching(true);

    try {
      const res = await fetch(`/api/languages/search?q=${encodeURIComponent(q)}`, {
        signal: controller.signal,
      });
      if (!res.ok) throw new Error("Search failed");
      const data = (await res.json()) as { languages: WhisperLanguage[] };
      setSearchResults(data.languages);
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setSearchResults([]);
      }
    } finally {
      if (!controller.signal.aborted) {
        setSearching(false);
      }
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchSearchResults(query);
    }, 200);
    return () => window.clearTimeout(timer);
  }, [query, fetchSearchResults]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const startPrefetch = useCallback(async (code: string, cancelled?: () => boolean) => {
    if (!isIntakeLanguage(code)) {
      if (!cancelled?.()) setPrefetchStatus("idle");
      return;
    }

    if (hasStaticTranslations(code)) {
      if (!cancelled?.()) setPrefetchStatus("ready");
      return;
    }

    if (!cancelled?.()) setPrefetchStatus("loading");
    const ready = await prefetchIntakeTranslations(code);
    if (!cancelled?.()) setPrefetchStatus(ready ? "ready" : "failed");
  }, []);

  useEffect(() => {
    if (!selectedCode) {
      setPrefetchStatus("idle");
      return;
    }

    let cancelled = false;
    void startPrefetch(selectedCode, () => cancelled);
    return () => {
      cancelled = true;
    };
  }, [selectedCode, startPrefetch]);

  const handleSelect = (code: string) => {
    if (!isIntakeLanguage(code)) return;
    setSelectedCode(code);
    setOpen(false);
    setQuery("");
    setSearchResults([]);
  };

  const navigateAfterLanguage = (mode: "continue" | "restart") => {
    if (!selectedCode || !isIntakeLanguage(selectedCode)) return;
    if (prefetchStatus !== "ready") return;

    if (mode === "restart") {
      resetIntake(selectedCode);
      setCurrentStep(0);
      router.push("/intake/0");
      return;
    }

    if (mode === "continue") {
      if (submitted) {
        setLanguage(selectedCode);
      } else {
        useIntakeStore.setState({
          preferredLanguage: selectedCode,
          intakeLanguage: selectedCode,
        });
      }
    }

    const stepIndex = getIntakeContinueStepIndex(answers, Boolean(submitted));
    setCurrentStep(stepIndex);
    router.push(getIntakeContinuePath(answers, Boolean(submitted)));
  };

  const continueDisabled =
    prefetchStatus === "loading" ||
    (prefetchStatus === "idle" && !hasStaticTranslations(selectedCode ?? "en"));

  return (
    <div className="mx-auto flex min-h-dvh w-full flex-1 flex-col items-center justify-center px-5 py-10 safe-top safe-bottom">
      <div className="flex w-full max-w-xl flex-col items-center text-center">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-slate-900 sm:text-5xl">{t("en", "appTitle")}</h1>
          <p className="mt-3 text-xl text-[#c96f35] sm:text-2xl">{t("en", "appSubtitle")}</p>
        </div>

        <p className="mb-2 text-lg font-semibold text-slate-700">{t("en", "chooseLanguage")}</p>
        <p className="mb-4 text-sm text-[#d4845c]">{t("en", "suggestedLanguages")}</p>

        <div ref={containerRef} className="relative w-full">
          <button
            type="button"
            aria-expanded={open}
            aria-haspopup="listbox"
            onClick={() => setOpen((prev) => !prev)}
            className="genoroot-option relative justify-center text-center"
          >
            <span className={selectedLang ? "text-slate-900" : "text-slate-500"}>
              {selectedLang
                ? formatLanguageLabel(selectedLang)
                : t("en", "selectLanguagePlaceholder")}
            </span>
            <ChevronDown
              className={`absolute right-6 top-1/2 h-6 w-6 shrink-0 -translate-y-1/2 text-[#c96f35] transition ${open ? "rotate-180" : ""}`}
            />
          </button>

        {open ? (
          <div className="absolute left-0 right-0 z-30 mt-2 overflow-hidden rounded-2xl border border-white/70 bg-white/95 shadow-xl backdrop-blur-md">
            <div className="border-b border-[#f5dcc8] p-3">
              <div className="flex items-center gap-2 rounded-xl border border-[#e8894a]/25 bg-white px-3 py-2">
                <Search className="h-4 w-4 shrink-0 text-[#c96f35]" />
                <input
                  type="search"
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("en", "searchLanguages")}
                  className="w-full bg-transparent text-base text-slate-800 outline-none placeholder:text-slate-400"
                />
              </div>
              {isSearching ? (
                <p className="mt-2 px-1 text-xs text-[#d4845c]">{t("en", "whisperSearchHint")}</p>
              ) : null}
            </div>

            <ul
              role="listbox"
              className="max-h-64 overflow-y-auto p-2"
              aria-label={t("en", "chooseLanguage")}
            >
              {searching && isSearching ? (
                <li className="px-3 py-4 text-center text-sm text-slate-500">
                  {t("en", "searchingLanguages")}
                </li>
              ) : listItems.length === 0 ? (
                <li className="px-3 py-4 text-center text-sm text-slate-500">
                  {isSearching ? t("en", "noLanguagesFound") : t("en", "selectLanguagePlaceholder")}
                </li>
              ) : (
                listItems.map((lang) => {
                  const recommended =
                    !isSearching && isBrowserRecommended(lang.code, localeHints);
                  const showAutoTranslated =
                    !isSearching && !hasStaticTranslations(lang.code);

                  return (
                    <li key={lang.code}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={selectedCode === lang.code}
                        onClick={() => handleSelect(lang.code)}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-base transition hover:bg-[#fdf8f4] ${
                          selectedCode === lang.code ? "bg-[#fdf8f4] font-semibold" : ""
                        }`}
                      >
                        <span>
                          {formatLanguageLabel(lang)}
                          {recommended ? (
                            <span className="ml-2 text-sm font-normal text-[#c96f35]">
                              ({t("en", "recommended")})
                            </span>
                          ) : null}
                          {showAutoTranslated ? (
                            <span className="ml-2 text-sm font-normal text-slate-500">
                              ({t("en", "autoTranslated")})
                            </span>
                          ) : null}
                        </span>
                        {selectedCode === lang.code ? (
                          <Check className="h-4 w-4 shrink-0 text-[#c96f35]" />
                        ) : null}
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        ) : null}
      </div>

        {selectedCode && isIntakeLanguage(selectedCode) ? (
          <div className="mt-8 w-full space-y-3">
            {savedProgress ? (
              <div className="rounded-2xl border border-[#f5dcc8] bg-white/70 px-4 py-4 text-left">
                <p className="text-lg font-semibold text-slate-900">
                  {t("en", "welcomeBack")}
                </p>
                <p className="mt-2 text-base text-slate-600">
                  {submitted
                    ? t("en", "completedIntakeHint", {
                        language: sessionLanguageName,
                      })
                    : t("en", "savedProgress", {
                        current: Math.min(resumeStep + 1, visibleStepCount),
                        total: visibleStepCount,
                      })}
                </p>
              </div>
            ) : null}

            <button
              type="button"
              className="genoroot-btn-continue inline-flex w-full items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={continueDisabled}
              onClick={() => {
                if (prefetchStatus === "failed") {
                  void startPrefetch(selectedCode);
                  return;
                }
                navigateAfterLanguage("continue");
              }}
            >
              {prefetchStatus === "loading" ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {t("en", "translatingContent")}
                </>
              ) : prefetchStatus === "failed" ? (
                t("en", "translationLoadFailed")
              ) : (
                <>
                  {submitted ? t("en", "continueToReport") : t("en", "continue")}
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>

            {savedProgress ? (
              <button
                type="button"
                className="genoroot-btn-back inline-flex w-full items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={continueDisabled}
                onClick={() => {
                  if (prefetchStatus === "failed") {
                    void startPrefetch(selectedCode);
                    return;
                  }
                  navigateAfterLanguage("restart");
                }}
              >
                <RotateCcw className="h-5 w-5" />
                {t("en", "startFromBeginning")}
              </button>
            ) : null}

            {prefetchStatus === "loading" ? (
              <p className="text-sm text-[#c96f35]">{t("en", "translatingContentHint")}</p>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function LanguageSwitcher() {
  const langCode = useIntakeStore((s) => s.preferredLanguage);
  const setLanguage = useIntakeStore((s) => s.setLanguage);
  const lang = getLanguage(langCode);

  return (
    <details className="relative">
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-xl border-2 border-white/70 bg-white/95 px-4 py-2.5 text-base font-semibold text-slate-800 shadow-sm">
        {lang?.nativeName ?? langCode}
        <ChevronDown className="h-4 w-4 opacity-70" />
      </summary>
      <div className="absolute right-0 z-20 mt-2 min-w-[180px] rounded-xl border-2 border-slate-200 bg-white p-2 shadow-lg">
        {["en", "ta", "hi"].map((code) => {
          const l = getLanguage(code);
          return (
            <button
              key={code}
              type="button"
              className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-base hover:bg-slate-50"
              onClick={() => setLanguage(code)}
            >
              <span>{l?.nativeName}</span>
              {code === langCode ? <Check className="h-4 w-4" /> : null}
            </button>
          );
        })}
      </div>
    </details>
  );
}
