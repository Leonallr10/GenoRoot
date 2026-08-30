import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const GROQ_CHAT_URL = "https://api.groq.com/openai/v1/chat/completions";

function readEnvFileValue(name: string): string | undefined {
  for (const file of [".env.local", ".env"]) {
    try {
      const text = readFileSync(resolve(process.cwd(), file), "utf8").replace(
        /^\uFEFF/,
        ""
      );
      const line = text
        .split(/\r?\n/)
        .map((entry) => entry.trim())
        .find((entry) => entry.startsWith(`${name}=`) && !entry.startsWith("#"));
      if (!line) continue;
      return line.slice(name.length + 1).trim().replace(/^["']|["']$/g, "");
    } catch {
      // file may not exist
    }
  }
  return undefined;
}

export type GroqChatResult = {
  content: string;
  model: string;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
};

type GroqMessage = {
  role: "system" | "user" | "assistant";
  content?: string | null;
};

export function groqConfig() {
  const apiKey = process.env.GROQ_API_KEY || readEnvFileValue("GROQ_API_KEY");
  const model =
    process.env.GROQ_MODEL ||
    readEnvFileValue("GROQ_MODEL") ||
    "openai/gpt-oss-20b";
  if (apiKey && !process.env.GROQ_API_KEY) process.env.GROQ_API_KEY = apiKey;
  if (!process.env.GROQ_MODEL) process.env.GROQ_MODEL = model;
  return { apiKey, model };
}

export function extractJsonText(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) throw new Error("Model returned an empty response.");

  if (trimmed.startsWith("{") && trimmed.endsWith("}")) return trimmed;

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) return fenced[1].trim();

  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start >= 0 && end > start) return trimmed.slice(start, end + 1);

  throw new Error("Model response did not contain JSON.");
}

export async function generateWithGroq(
  messages: GroqMessage[]
): Promise<GroqChatResult> {
  const { apiKey, model } = groqConfig();
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured.");
  }

  const response = await fetch(GROQ_CHAT_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.2,
      max_completion_tokens: 2048,
      reasoning_effort: "low",
      include_reasoning: false,
      response_format: {
        type: "json_object",
      },
    }),
  });

  const bodyText = await response.text();
  if (!response.ok) {
    throw new Error(
      `Groq request failed (${response.status}): ${bodyText.slice(0, 400)}`
    );
  }

  const data = JSON.parse(bodyText) as {
    model?: string;
    choices?: Array<{ message?: GroqMessage }>;
    usage?: GroqChatResult["usage"];
  };

  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("Groq returned no report content.");
  }

  return {
    content,
    model: data.model || model,
    usage: data.usage,
  };
}
