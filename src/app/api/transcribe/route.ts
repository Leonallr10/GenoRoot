import { NextRequest, NextResponse } from "next/server";
import { HF_INFERENCE_BASE } from "@/lib/i18n/translation-service";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audio = formData.get("audio") as Blob | null;
    const language = (formData.get("language") as string) || "en";

    if (!audio) {
      return NextResponse.json({ error: "No audio provided" }, { status: 400 });
    }

    const token = process.env.HF_TOKEN;
    const model = process.env.WHISPER_MODEL || "openai/whisper-large-v3";
    const endpoint =
      process.env.WHISPER_ENDPOINT ||
      `${HF_INFERENCE_BASE}/${model}`;

    if (!token) {
      return NextResponse.json({ error: "HF_TOKEN not configured" }, { status: 503 });
    }

    const audioBuffer = await audio.arrayBuffer();

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": audio.type || "audio/webm",
      },
      body: audioBuffer,
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json(
        { error: "Whisper inference failed", details: errText },
        { status: response.status }
      );
    }

    const result = await response.json();
    const text =
      typeof result === "string"
        ? result
        : result.text ?? result.generated_text ?? "";

    return NextResponse.json({ transcript: text.trim(), language });
  } catch (error) {
    return NextResponse.json(
      { error: "Transcription error", details: String(error) },
      { status: 500 }
    );
  }
}
