import { collectIntakeSourceStrings } from "@/lib/i18n/intake-strings";
import { hasStaticTranslations } from "@/lib/i18n/static-languages";
import {
  getCachedTranslation,
  translateManyToLanguage,
  translateToLanguage,
} from "@/lib/i18n/translation-runtime";

const BATCH_SIZE = 40;
const PARALLEL_BATCHES = 2;

const inflight = new Map<string, Promise<boolean>>();

export function areIntakeTranslationsReady(lang: string): boolean {
  if (lang === "en" || hasStaticTranslations(lang)) return true;
  return collectIntakeSourceStrings().every((text) =>
    Boolean(getCachedTranslation(lang, text))
  );
}

function getPendingIntakeStrings(lang: string): string[] {
  if (lang === "en" || hasStaticTranslations(lang)) return [];
  return collectIntakeSourceStrings().filter(
    (text) => !getCachedTranslation(lang, text)
  );
}

async function translateBatchWithRetry(
  batch: string[],
  lang: string
): Promise<void> {
  try {
    await translateManyToLanguage(batch, lang);
  } catch {
    await Promise.allSettled(
      batch.map((text) => translateToLanguage(text, lang))
    );
  }
}

/** Warm the in-memory translation cache for all intake strings. Returns true when complete. */
export async function prefetchIntakeTranslations(lang: string): Promise<boolean> {
  if (lang === "en" || hasStaticTranslations(lang)) return true;

  const existing = inflight.get(lang);
  if (existing) return existing;

  const job = (async () => {
    let pending = getPendingIntakeStrings(lang);
    if (pending.length === 0) return true;

    const batches: string[][] = [];
    for (let i = 0; i < pending.length; i += BATCH_SIZE) {
      batches.push(pending.slice(i, i + BATCH_SIZE));
    }

    for (let i = 0; i < batches.length; i += PARALLEL_BATCHES) {
      const slice = batches.slice(i, i + PARALLEL_BATCHES);
      await Promise.allSettled(
        slice.map((batch) => translateBatchWithRetry(batch, lang))
      );
    }

    pending = getPendingIntakeStrings(lang);
    if (pending.length > 0) {
      await Promise.allSettled(
        pending.map((text) => translateToLanguage(text, lang))
      );
    }

    return areIntakeTranslationsReady(lang);
  })();

  inflight.set(lang, job);
  try {
    return await job;
  } finally {
    inflight.delete(lang);
  }
}

export function isPrefetching(lang: string): boolean {
  return inflight.has(lang);
}
