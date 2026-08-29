const cache = new Map<string, string>();

export function getCachedTranslation(lang: string, sourceText: string): string | undefined {
  return cache.get(`${lang}::${sourceText}`);
}

export function setCachedTranslation(lang: string, sourceText: string, translated: string) {
  cache.set(`${lang}::${sourceText}`, translated);
}

export function primeTranslationCache(
  lang: string,
  pairs: Array<{ source: string; translated: string }>
) {
  for (const pair of pairs) {
    setCachedTranslation(lang, pair.source, pair.translated);
  }
}

export function clearTranslationCache(lang?: string) {
  if (!lang) {
    cache.clear();
    return;
  }
  for (const key of cache.keys()) {
    if (key.startsWith(`${lang}::`)) {
      cache.delete(key);
    }
  }
}
