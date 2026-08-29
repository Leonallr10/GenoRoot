import { NextRequest, NextResponse } from "next/server";
import { translateText } from "@/lib/i18n/translation-service";

export async function POST(req: NextRequest) {
  try {
    const { text, language, direction } = await req.json();

    if (!text || !language) {
      return NextResponse.json({ error: "Missing text or language" }, { status: 400 });
    }

    const token = process.env.HF_TOKEN;
    const toEnglish = direction === "toEnglish" || direction === undefined;

    if (language === "en" && toEnglish) {
      return NextResponse.json({ translation: text });
    }

    if (!token) {
      return NextResponse.json(
        {
          error:
            "HF_TOKEN is not configured. Add HF_TOKEN to .env and restart the dev server.",
        },
        { status: 503 }
      );
    }

    const translation = toEnglish
      ? await translateText(text, language, "en", token)
      : await translateText(text, "en", language, token);

    if (translation === text && text.trim().length > 2 && language !== "en" && !toEnglish) {
      return NextResponse.json(
        { error: "Translation model returned the original English text." },
        { status: 502 }
      );
    }

    return NextResponse.json({ translation });
  } catch (error) {
    return NextResponse.json(
      { error: "Translation failed", details: String(error) },
      { status: 500 }
    );
  }
}
