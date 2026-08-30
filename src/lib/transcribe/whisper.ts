import { isWhisperLanguage } from "@/lib/i18n/whisper-languages";
import { groqConfig } from "@/lib/report/groq";

const GROQ_TRANSCRIBE_URL =
  "https://api.groq.com/openai/v1/audio/transcriptions";

export function normalizeTranscriptionLanguage(code: string): string {
  const base = code.trim().toLowerCase().split("-")[0];
  return isWhisperLanguage(base) ? base : "en";
}

export async function transcribeWithGroqWhisper(
  audioBuffer: ArrayBuffer,
  contentType: string,
  language: string
): Promise<string> {
  const { apiKey } = groqConfig();
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured.");
  }

  const lang = normalizeTranscriptionLanguage(language);
  const model = process.env.GROQ_WHISPER_MODEL || "whisper-large-v3-turbo";

  const formData = new FormData();
  formData.append(
    "file",
    new Blob([audioBuffer], { type: contentType || "audio/webm" }),
    "recording.webm"
  );
  formData.append("model", model);
  formData.append("language", lang);
  formData.append("response_format", "json");
  formData.append("temperature", "0");

  const response = await fetch(GROQ_TRANSCRIBE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: formData,
  });

  const bodyText = await response.text();
  if (!response.ok) {
    throw new Error(
      `Groq transcription failed (${response.status}): ${bodyText.slice(0, 400)}`
    );
  }

  const result = JSON.parse(bodyText) as { text?: string };
  return (result.text ?? "").trim();
}

export async function transcribeWithHfWhisper(
  audioBuffer: ArrayBuffer,
  contentType: string,
  endpoint: string,
  token: string
): Promise<string> {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": contentType || "audio/webm",
    },
    body: audioBuffer,
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(
      `Whisper inference failed (${response.status}): ${errText.slice(0, 400)}`
    );
  }

  const result = await response.json();
  const text =
    typeof result === "string"
      ? result
      : (result.text ?? result.generated_text ?? "");

  return text.trim();
}
