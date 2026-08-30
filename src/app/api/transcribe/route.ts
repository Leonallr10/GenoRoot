import { NextRequest, NextResponse } from "next/server";
import { HF_INFERENCE_BASE } from "@/lib/i18n/translation-service";
import {
  normalizeTranscriptionLanguage,
  transcribeWithGroqWhisper,
  transcribeWithHfWhisper,
} from "@/lib/transcribe/whisper";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audio = formData.get("audio") as Blob | null;
    const language = normalizeTranscriptionLanguage(
      (formData.get("language") as string) || "en"
    );

    if (!audio) {
      return NextResponse.json({ error: "No audio provided" }, { status: 400 });
    }

    const audioBuffer = await audio.arrayBuffer();
    const contentType = audio.type || "audio/webm";

    let transcript = "";
    let provider: "groq" | "huggingface" = "groq";

    try {
      transcript = await transcribeWithGroqWhisper(
        audioBuffer,
        contentType,
        language
      );
    } catch (groqError) {
      const token = process.env.HF_TOKEN;
      const model = process.env.WHISPER_MODEL || "openai/whisper-large-v3";
      const endpoint =
        process.env.WHISPER_ENDPOINT ||
        `${HF_INFERENCE_BASE}/${model}`;

      if (!token) {
        const message =
          groqError instanceof Error ? groqError.message : String(groqError);
        return NextResponse.json(
          {
            error: "Transcription unavailable",
            details: `${message}. HF_TOKEN is also not configured for fallback.`,
          },
          { status: 503 }
        );
      }

      provider = "huggingface";
      transcript = await transcribeWithHfWhisper(
        audioBuffer,
        contentType,
        endpoint,
        token
      );
    }

    if (!transcript) {
      return NextResponse.json(
        { error: "No speech detected in recording" },
        { status: 422 }
      );
    }

    return NextResponse.json({ transcript, language, provider });
  } catch (error) {
    return NextResponse.json(
      { error: "Transcription error", details: String(error) },
      { status: 500 }
    );
  }
}
