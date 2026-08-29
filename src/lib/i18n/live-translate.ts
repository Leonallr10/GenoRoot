import type { TranslationDict } from "./translations/en";
import { en } from "./translations/en";

type FlatEntry = { path: string; text: string };

function flattenStrings(value: unknown, path = ""): FlatEntry[] {
  if (typeof value === "string") {
    return [{ path, text: value }];
  }
  if (!value || typeof value !== "object") return [];

  const entries: FlatEntry[] = [];
  for (const [key, nested] of Object.entries(value)) {
    const nextPath = path ? `${path}.${key}` : key;
    entries.push(...flattenStrings(nested, nextPath));
  }
  return entries;
}

function setByPath(obj: Record<string, unknown>, path: string, value: string) {
  const parts = path.split(".");
  let current: Record<string, unknown> = obj;

  for (let i = 0; i < parts.length - 1; i += 1) {
    const part = parts[i];
    if (!current[part] || typeof current[part] !== "object") {
      current[part] = {};
    }
    current = current[part] as Record<string, unknown>;
  }

  current[parts[parts.length - 1]] = value;
}

const CHUNK_SIZE = 12;
const CACHE_PREFIX = "genoroot-live-i18n-v2-";

export function getLiveCacheKey(lang: string): string {
  return `${CACHE_PREFIX}${lang}`;
}

export function readLiveCache(lang: string): TranslationDict | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(getLiveCacheKey(lang));
    if (!raw) return null;
    return JSON.parse(raw) as TranslationDict;
  } catch {
    return null;
  }
}

function writeLiveCache(lang: string, dict: TranslationDict) {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(getLiveCacheKey(lang), JSON.stringify(dict));
  } catch {
    // Ignore quota errors
  }
}

async function translateChunk(
  texts: string[],
  targetLang: string
): Promise<string[]> {
  const res = await fetch("/api/translate/batch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      texts,
      sourceLang: "en",
      targetLang,
    }),
  });

  if (!res.ok) return texts;
  const data = (await res.json()) as { translations?: string[] };
  return data.translations ?? texts;
}

export async function buildLiveTranslationDict(
  targetLang: string
): Promise<TranslationDict> {
  const cached = readLiveCache(targetLang);
  if (cached) return cached;

  const flat = flattenStrings(en);
  const translatedTexts: string[] = [];

  for (let i = 0; i < flat.length; i += CHUNK_SIZE) {
    const chunk = flat.slice(i, i + CHUNK_SIZE);
    const chunkTexts = chunk.map((entry) => entry.text);
    const chunkTranslated = await translateChunk(chunkTexts, targetLang);
    translatedTexts.push(...chunkTranslated);
  }

  const rebuilt = structuredClone(en) as unknown as Record<string, unknown>;
  flat.forEach((entry, index) => {
    setByPath(rebuilt, entry.path, translatedTexts[index] ?? entry.text);
  });

  const dict = rebuilt as unknown as TranslationDict;
  writeLiveCache(targetLang, dict);
  return dict;
}

export function countTranslatableStrings(): number {
  return flattenStrings(en).length;
}
