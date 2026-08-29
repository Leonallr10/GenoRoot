# GenoRoot — Multilingual Smart Hair & Scalp Intake

A mobile-first, voice-enabled patient intake application built with Next.js. Patients can read, listen, tap, speak, review, and submit in English, Tamil, or Hindi — while underlying medical data stays clean, structured, and deterministic.

## Features

- **Multilingual UI** (English, Tamil, Hindi) with browser-locale suggestions
- **Voice input** via Whisper large-v3 (Hugging Face) with Web Speech API fallback
- **Text-to-speech** for question prompts and review
- **Smart branching** for habits, products, procedures, and follow-ups
- **Local persistence** — resume intake after refresh
- **Structured JSON output** with optional English view for free-form transcripts

## Tech Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS + shadcn-style components
- Zod validation
- Zustand + localStorage persistence
- Hugging Face Inference API (Whisper + translation)

## Getting Started

```bash
npm install
cp .env.example .env.local
# Add your HF_TOKEN to .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Description |
|----------|-------------|
| `HF_TOKEN` | Hugging Face API token for Whisper/transcription |
| `WHISPER_MODEL` | Default: `openai/whisper-large-v3` |
| `WHISPER_ENDPOINT` | Optional dedicated inference endpoint URL |

## Deploy (Vercel)

1. Push to GitHub
2. Import project in Vercel
3. Add `HF_TOKEN` environment variable
4. Deploy

## Architecture

```
Language selection → Question engine → Tap or Voice → Canonical JSON
                              ↓
                    Whisper STT (with Web Speech fallback)
                              ↓
                    localStorage auto-save → Review → Submit
```

Voice is an **interaction layer**, not the source of truth. All predefined answers map to canonical English values regardless of UI language.

## Question Schema

The intake form is driven by [`src/data/questions.json`](src/data/questions.json) — 16 questions across 5 sections (A–E).

## License

Take-home project for Haiku Studio / GenoRoot.
