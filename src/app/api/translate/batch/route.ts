import { NextRequest, NextResponse } from "next/server";
import { translateBatch } from "@/lib/i18n/translation-service";
import { canTranslateBetween } from "@/lib/i18n/mbart-codes";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const texts = body.texts as string[] | undefined;
    const sourceLang = (body.sourceLang as string) || "en";
    const targetLang = (body.targetLang as string) || "en";

    if (!texts || !Array.isArray(texts) || texts.length === 0) {
      return NextResponse.json({ error: "Missing texts array" }, { status: 400 });
    }

    if (texts.length > 80) {
      return NextResponse.json({ error: "Too many texts (max 80)" }, { status: 400 });
    }

    if (sourceLang === targetLang) {
      return NextResponse.json({ translations: texts });
    }

    const token = process.env.HF_TOKEN;
    if (!token) {
      return NextResponse.json(
        {
          error:
            "HF_TOKEN is not configured. Copy .env.example to .env.local and add your Hugging Face token.",
        },
        { status: 503 }
      );
    }

    if (!canTranslateBetween(sourceLang, targetLang)) {
      return NextResponse.json(
        { error: "Translation not available for this language pair" },
        { status: 400 }
      );
    }

    const translations = await translateBatch(texts, sourceLang, targetLang, token);
    const translatedCount = translations.filter((value, index) => value !== texts[index]).length;

    if (translatedCount === 0 && texts.some((text) => text.trim().length > 0)) {
      return NextResponse.json(
        { error: "Translation model returned no translated text. Check HF_TOKEN and model access." },
        { status: 502 }
      );
    }

    return NextResponse.json({ translations });
  } catch (error) {
    return NextResponse.json(
      { error: "Batch translation failed", details: String(error) },
      { status: 500 }
    );
  }
}
