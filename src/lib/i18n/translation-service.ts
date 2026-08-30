import { toMbartCode } from "./mbart-codes";

/** Current Hugging Face serverless inference base (legacy api-inference.huggingface.co is deprecated). */
export const HF_INFERENCE_BASE =
  process.env.HF_INFERENCE_BASE ?? "https://router.huggingface.co/hf-inference/models";

const MBART_MODEL = "facebook/mbart-large-50-many-to-many-mmt";

const OPUS_TO_ENGLISH: Record<string, string> = {
  ta: "Helsinki-NLP/opus-mt-ta-en",
  hi: "Helsinki-NLP/opus-mt-hi-en",
  de: "Helsinki-NLP/opus-mt-de-en",
};

const OPUS_FROM_ENGLISH: Record<string, string> = {
  ta: "Helsinki-NLP/opus-mt-en-ta",
  hi: "Helsinki-NLP/opus-mt-en-hi",
  de: "Helsinki-NLP/opus-mt-en-de",
};

const PLACEHOLDER_RE = /\{(\w+)\}/g;

export function protectPlaceholders(text: string): { text: string; tokens: Map<string, string> } {
  const tokens = new Map<string, string>();
  let index = 0;
  const protectedText = text.replace(PLACEHOLDER_RE, (match) => {
    const token = `__PH${index}__`;
    tokens.set(token, match);
    index += 1;
    return token;
  });
  return { text: protectedText, tokens };
}

export function restorePlaceholders(text: string, tokens: Map<string, string>): string {
  let restored = text;
  for (const [token, value] of tokens) {
    restored = restored.replaceAll(token, value);
  }
  return restored;
}

function modelUrl(model: string): string {
  return `${HF_INFERENCE_BASE}/${model}`;
}

async function parseTranslationResponse(response: Response): Promise<string | null> {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("json")) {
    return null;
  }

  const result = await response.json();
  if (Array.isArray(result) && typeof result[0]?.translation_text === "string") {
    return result[0].translation_text;
  }
  if (typeof result === "string") return result;
  if (typeof result?.translation_text === "string") return result.translation_text;
  if (typeof result?.generated_text === "string") return result.generated_text;
  if (typeof result?.error === "string") {
    throw new Error(result.error);
  }
  return null;
}

async function callHfModel(
  token: string,
  model: string,
  inputs: string,
  parameters?: Record<string, string>
): Promise<string | null> {
  const response = await fetch(modelUrl(model), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(
      parameters ? { inputs, parameters } : { inputs }
    ),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`HF ${model} failed (${response.status}): ${errText.slice(0, 200)}`);
  }

  return parseTranslationResponse(response);
}

async function translateWithMbart(
  token: string,
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<string | null> {
  const src = toMbartCode(sourceLang);
  const tgt = toMbartCode(targetLang);
  if (!src || !tgt || src === tgt) return text;

  return callHfModel(token, MBART_MODEL, text, {
    src_lang: src,
    tgt_lang: tgt,
  });
}

export async function translateText(
  text: string,
  sourceLang: string,
  targetLang: string,
  token: string | undefined
): Promise<string> {
  if (!text.trim() || sourceLang === targetLang) return text;
  if (!token) return text;

  const { text: protectedText, tokens } = protectPlaceholders(text);

  let translated: string | null = null;

  try {
    if (sourceLang === "en" && OPUS_FROM_ENGLISH[targetLang]) {
      translated = await callHfModel(token, OPUS_FROM_ENGLISH[targetLang], protectedText);
    } else if (targetLang === "en" && OPUS_TO_ENGLISH[sourceLang]) {
      translated = await callHfModel(token, OPUS_TO_ENGLISH[sourceLang], protectedText);
    }
  } catch {
    translated = null;
  }

  if (!translated) {
    try {
      translated = await translateWithMbart(token, protectedText, sourceLang, targetLang);
    } catch {
      translated = null;
    }
  }

  if (!translated) return text;

  return restorePlaceholders(translated, tokens);
}

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await mapper(items[index], index);
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () =>
    worker()
  );
  await Promise.all(workers);
  return results;
}

export async function translateBatch(
  texts: string[],
  sourceLang: string,
  targetLang: string,
  token: string | undefined
): Promise<string[]> {
  if (sourceLang === targetLang || !token) return texts;

  return mapWithConcurrency(texts, 4, (text) =>
    translateText(text, sourceLang, targetLang, token)
  );
}
