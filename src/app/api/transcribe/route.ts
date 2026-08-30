import { NextRequest, NextResponse } from "next/server";
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
    const preferHf = process.env.WHISPER_PROVIDER?.toLowerCase() === "huggingface";
    const hfToken = process.env.HF_TOKEN;

    let transcript = "";
    let provider: "groq" | "huggingface" = preferHf ? "huggingface" : "groq";
    const errors: string[] = [];

    const tryGroq = async () => {
      transcript = await transcribeWithGroqWhisper(
        audioBuffer,
        contentType,
        language
      );
      provider = "groq";
    };

    const tryHf = async () => {
      if (!hfToken) {
        throw new Error("HF_TOKEN is not configured.");
      }
      transcript = await transcribeWithHfWhisper(
        audioBuffer,
        contentType,
        language,
        hfToken
      );
      provider = "huggingface";
    };

    if (preferHf) {
      try {
        await tryHf();
      } catch (error) {
        errors.push(error instanceof Error ? error.message : String(error));
        try {
          await tryGroq();
        } catch (groqError) {
          errors.push(
            groqError instanceof Error ? groqError.message : String(groqError)
          );
        }
      }
    } else {
      try {
        await tryGroq();
      } catch (error) {
        errors.push(error instanceof Error ? error.message : String(error));
        try {
          await tryHf();
        } catch (hfError) {
          errors.push(
            hfError instanceof Error ? hfError.message : String(hfError)
          );
        }
      }
    }

    if (!transcript) {
      return NextResponse.json(
        {
          error: "Transcription unavailable",
          details: errors.join(" | "),
        },
        { status: 503 }
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
