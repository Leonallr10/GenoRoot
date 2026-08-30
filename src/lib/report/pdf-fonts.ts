import type { AnswerTableRow } from "@/lib/engine/answer-table";

const FONT_CACHE = new Map<string, Uint8Array>();

const NOTO_BASE =
  "https://cdn.jsdelivr.net/gh/notofonts/notofonts.github.io/fonts";

const LATIN_REGULAR = `${NOTO_BASE}/NotoSans/unhinted/ttf/NotoSans-Regular.ttf`;
const LATIN_BOLD = `${NOTO_BASE}/NotoSans/unhinted/ttf/NotoSans-Bold.ttf`;

const SCRIPT_FONTS: Record<string, string> = {
  ta: `${NOTO_BASE}/NotoSansTamil/unhinted/ttf/NotoSansTamil-Regular.ttf`,
  hi: `${NOTO_BASE}/NotoSansDevanagari/unhinted/ttf/NotoSansDevanagari-Regular.ttf`,
  mr: `${NOTO_BASE}/NotoSansDevanagari/unhinted/ttf/NotoSansDevanagari-Regular.ttf`,
  ne: `${NOTO_BASE}/NotoSansDevanagari/unhinted/ttf/NotoSansDevanagari-Regular.ttf`,
  te: `${NOTO_BASE}/NotoSansTelugu/unhinted/ttf/NotoSansTelugu-Regular.ttf`,
  bn: `${NOTO_BASE}/NotoSansBengali/unhinted/ttf/NotoSansBengali-Regular.ttf`,
  as: `${NOTO_BASE}/NotoSansBengali/unhinted/ttf/NotoSansBengali-Regular.ttf`,
  gu: `${NOTO_BASE}/NotoSansGujarati/unhinted/ttf/NotoSansGujarati-Regular.ttf`,
  kn: `${NOTO_BASE}/NotoSansKannada/unhinted/ttf/NotoSansKannada-Regular.ttf`,
  ml: `${NOTO_BASE}/NotoSansMalayalam/unhinted/ttf/NotoSansMalayalam-Regular.ttf`,
  pa: `${NOTO_BASE}/NotoSansGurmukhi/unhinted/ttf/NotoSansGurmukhi-Regular.ttf`,
  ur: `${NOTO_BASE}/NotoNaskhArabic/unhinted/ttf/NotoNaskhArabic-Regular.ttf`,
  ar: `${NOTO_BASE}/NotoNaskhArabic/unhinted/ttf/NotoNaskhArabic-Regular.ttf`,
  or: `${NOTO_BASE}/NotoSansOriya/unhinted/ttf/NotoSansOriya-Regular.ttf`,
  si: `${NOTO_BASE}/NotoSansSinhala/unhinted/ttf/NotoSansSinhala-Regular.ttf`,
  th: `${NOTO_BASE}/NotoSansThai/unhinted/ttf/NotoSansThai-Regular.ttf`,
};

export function needsUnicodeFont(language: string): boolean {
  return language !== "en";
}

export async function loadFontBytes(url: string): Promise<Uint8Array | null> {
  const cached = FONT_CACHE.get(url);
  if (cached) return cached;

  try {
    const response = await fetch(url, { cache: "force-cache" });
    if (!response.ok) return null;
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (bytes.byteLength < 1000) return null;
    FONT_CACHE.set(url, bytes);
    return bytes;
  } catch {
    return null;
  }
}

export async function loadPdfFontBytes(language: string): Promise<{
  latinRegular: Uint8Array | null;
  latinBold: Uint8Array | null;
  script: Uint8Array | null;
}> {
  const scriptUrl = SCRIPT_FONTS[language];
  const [latinRegular, latinBold, script] = await Promise.all([
    loadFontBytes(LATIN_REGULAR),
    loadFontBytes(LATIN_BOLD),
    scriptUrl ? loadFontBytes(scriptUrl) : Promise.resolve(null),
  ]);
  return { latinRegular, latinBold, script };
}

export type ExportTranscriptRow = {
  label: string;
  original: string;
  english?: string;
};

export type ExportDocumentInput = {
  language: string;
  languageLabel: string;
  valueHeader: string;
  rows: AnswerTableRow[];
  transcripts?: ExportTranscriptRow[];
  report?: {
    title: string;
    sections: { label: string; value: string | string[] }[];
  };
  model?: string;
  generatedAt?: string;
};
