import { HF_INFERENCE_BASE } from "@/lib/i18n/translation-service";
import { isWhisperLanguage } from "@/lib/i18n/whisper-languages";
import { groqConfig } from "@/lib/report/groq";

const GROQ_TRANSCRIBE_URL =
  "https://api.groq.com/openai/v1/audio/transcriptions";

/** Serverless HF models tried in order when WHISPER_MODEL fails or is unset. */
const DEFAULT_HF_WHISPER_MODELS = [
  "openai/whisper-large-v3-turbo",
  "distil-whisper/distil-large-v3",
  "openai/whisper-medium",
];

export function normalizeTranscriptionLanguage(code: string): string {
  const base = code.trim().toLowerCase().split("-")[0];
  return isWhisperLanguage(base) ? base : "en";
}

export function getHfWhisperModels(): string[] {
  const configured = process.env.WHISPER_MODEL?.trim();
  const fallbacks =
    process.env.WHISPER_FALLBACK_MODELS?.split(",")
      .map((entry) => entry.trim())
      .filter(Boolean) ?? DEFAULT_HF_WHISPER_MODELS;

  if (!configured) return fallbacks;

  const models = [configured];
  for (const model of fallbacks) {
    if (!models.includes(model)) models.push(model);
  }
  return models;
}

function hfModelUrl(model: string): string {
  return `${HF_INFERENCE_BASE}/${model}`;
}

function extractTranscript(result: unknown): string {
  if (typeof result === "string") return result.trim();
  if (!result || typeof result !== "object") return "";

  const record = result as Record<string, unknown>;
  const text = record.text ?? record.generated_text;
  return typeof text === "string" ? text.trim() : "";
}

async function requestHfWhisper(
  url: string,
  token: string,
  init: RequestInit
): Promise<string> {
  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init.headers ?? {}),
    },
  });

  const bodyText = await response.text();
  if (!response.ok) {
    throw new Error(
      `Whisper inference failed (${response.status}): ${bodyText.slice(0, 400)}`
    );
  }

  let result: unknown = bodyText;
  try {
    result = JSON.parse(bodyText);
  } catch {
    // Some endpoints return plain text.
  }

  const transcript = extractTranscript(result);
  if (!transcript) {
    throw new Error("Whisper returned an empty transcript.");
  }

  return transcript;
}

async function transcribeHfModel(
  audioBuffer: ArrayBuffer,
  contentType: string,
  language: string,
  token: string,
  model: string
): Promise<string> {
  const url = hfModelUrl(model);
  const mime = contentType || "audio/webm";

  try {
    return await requestHfWhisper(url, token, {
      method: "POST",
      headers: { "Content-Type": mime },
      body: audioBuffer,
    });
  } catch {
    // Raw bytes failed — retry with base64 JSON (allows optional language hint).
  }

  const base64 = Buffer.from(audioBuffer).toString("base64");
  return requestHfWhisper(url, token, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      inputs: base64,
      parameters: {
        language,
        task: "transcribe",
        generation_parameters: {
          do_sample: false,
          temperature: 0,
        },
      },
    }),
  });
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
  language: string,
  token: string
): Promise<string> {
  const lang = normalizeTranscriptionLanguage(language);
  const dedicatedEndpoint = process.env.WHISPER_ENDPOINT?.trim();

  if (dedicatedEndpoint) {
    try {
      return await requestHfWhisper(dedicatedEndpoint, token, {
        method: "POST",
        headers: { "Content-Type": contentType || "audio/webm" },
        body: audioBuffer,
      });
    } catch {
      const base64 = Buffer.from(audioBuffer).toString("base64");
      return requestHfWhisper(dedicatedEndpoint, token, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inputs: base64,
          parameters: {
            language: lang,
            task: "transcribe",
          },
        }),
      });
    }
  }

  const models = getHfWhisperModels();
  let lastError: Error | null = null;

  for (const model of models) {
    try {
      return await transcribeHfModel(
        audioBuffer,
        contentType,
        lang,
        token,
        model
      );
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
    }
  }

  throw lastError ?? new Error("All Hugging Face Whisper models failed.");
}
