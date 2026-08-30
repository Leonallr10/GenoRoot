import { collectIntakeSourceStrings } from "@/lib/i18n/intake-strings";
import {
  getCachedTranslation,
  translateManyToLanguage,
} from "@/lib/i18n/translation-runtime";

const BATCH_SIZE = 40;
const PARALLEL_BATCHES = 2;

const inflight = new Map<string, Promise<void>>();

/** Warm the in-memory translation cache for all intake strings. */
export async function prefetchIntakeTranslations(lang: string): Promise<void> {
  if (lang === "en") return;

  const existing = inflight.get(lang);
  if (existing) return existing;

  const job = (async () => {
    const sources = collectIntakeSourceStrings();
    const pending = sources.filter((text) => !getCachedTranslation(lang, text));
    if (pending.length === 0) return;

    const batches: string[][] = [];
    for (let i = 0; i < pending.length; i += BATCH_SIZE) {
      batches.push(pending.slice(i, i + BATCH_SIZE));
    }

    for (let i = 0; i < batches.length; i += PARALLEL_BATCHES) {
      const slice = batches.slice(i, i + PARALLEL_BATCHES);
      await Promise.all(slice.map((batch) => translateManyToLanguage(batch, lang)));
    }
  })();

  inflight.set(lang, job);
  try {
    await job;
  } finally {
    inflight.delete(lang);
  }
}

export function isPrefetching(lang: string): boolean {
  return inflight.has(lang);
}
