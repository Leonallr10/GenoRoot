# GenoRoot — Multilingual Smart Hair & Scalp Intake

A mobile-first, voice-enabled patient intake application built with Next.js. Patients can read, listen, tap, type, or speak their answers in many languages — while underlying medical data stays clean, structured, and stored in canonical English. After submit, clinicians get structured exports and an AI-generated clinical intake summary.

## Features

### Intake form

- **16 questions** across **5 sections** (A–E), driven by [`src/data/questions.json`](src/data/questions.json)
- Question types: number, single, multi, yes/no, text, and table (habits, products, procedures)
- **Smart branching** — conditional follow-ups (smoking severity, salon details, side effects, product/procedure columns)
- **Manual “Other” input** — free-text on option questions when preset choices do not fit
- **Female-only** questions (menstrual cycle, pregnancy-related)
- **Progress bar**, step navigation, and **resume after refresh** (Zustand + `localStorage`)

### Voice and speech

- **Whisper STT** via Hugging Face (`openai/whisper-large-v3`)
- **Web Speech API** fallback when Whisper is unavailable
- Record, pause, resume, and edit transcript before confirming
- **Browser TTS** to read question prompts aloud

### Multilingual UI

- **English** — static UI strings (hand-written)
- **Other languages** — live translation via Hugging Face (OPUS-MT + mBART fallback)
- **12+ Indian languages** preconfigured (Tamil, Hindi, Telugu, Bengali, Gujarati, Kannada, Malayalam, Marathi, Punjabi, Urdu, Odia, Assamese)
- **Whisper language search** for additional speech-supported languages
- Browser locale / timezone **language suggestions**
- **Prefetch** all intake strings when a language is selected
- Answers stored in **canonical English** regardless of UI language

### Review and complete

- **Review page** — sectioned answers, edit any step, re-intake, submit
- **Complete page** — view **original language** vs **English**
- Answer tables and free-form **transcript table** for voice/typed notes

### Clinical report (Groq LLM)

- AI-generated intake summary using **`openai/gpt-oss-20b`** on Groq
- **Manual typed** and **spoken/voice** answers treated as first-class evidence
- Each answer tagged by source: `selected`, `manual`, `voice`, or `mixed`
- Structured sections: overview, timeline, pattern, family history, health/hormones, lifestyle, products/procedures, patient notes, clinical considerations, discussion points, sample/consent, confidence notes
- Generate / regenerate from the complete page
- **Download report PDF** — English or translated (non-English sessions)

### Export and download

- **Download dropdown** on the complete page: **CSV**, **Excel (.xlsx)**, **PDF**
- **Non-English sessions** — export in **English** and in the **selected language**
- Bundles include intake answers, transcripts, and clinical report (when generated)
- Unicode PDF fonts for non-Latin scripts (Tamil, Hindi, Devanagari, etc.)

## Tech stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| UI | Tailwind CSS 4, shadcn-style components, Lucide icons |
| State | Zustand + `localStorage` persistence |
| Validation | Zod |
| Speech | Hugging Face Whisper, Web Speech API, browser TTS |
| Translation | Hugging Face OPUS-MT, mBART |
| Clinical report | Groq API (`openai/gpt-oss-20b`) |
| Export | ExcelJS (Excel), pdf-lib + fontkit (PDF) |

## Getting started

```bash
npm install
cp .env.example .env
# Add HF_TOKEN and GROQ_API_KEY to .env
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Run production server |
| `npm run lint` | ESLint |
| `npm run test:translate` | Translation smoke test |
| `npm run test:translate:local` | Local translation test |

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `HF_TOKEN` | Yes (voice/translate) | Hugging Face API token |
| `WHISPER_MODEL` | No | Default: `openai/whisper-large-v3` |
| `WHISPER_ENDPOINT` | No | Optional dedicated Whisper inference URL |
| `HF_INFERENCE_BASE` | No | HF router base URL (default: `https://router.huggingface.co/hf-inference/models`) |
| `GROQ_API_KEY` | Yes (reports) | Groq API key for clinical report generation |
| `GROQ_MODEL` | No | Default: `openai/gpt-oss-20b` |

Copy [`.env.example`](.env.example) to `.env` (or `.env.local`) and fill in your keys.

## Architecture

```
Language select → Prefetch translations
       ↓
Intake steps (tap / type / voice) → Canonical JSON + transcripts
       ↓
localStorage auto-save → Review → Submit
       ↓
Complete page
  ├─ View: Original language | English
  ├─ Download: CSV | Excel | PDF (per language)
  └─ Clinical report: Groq LLM → view → report PDF
```

Voice and manual text are **interaction layers**, not the source of truth. Predefined options map to canonical English values; free-form input is preserved in transcripts and passed through to the clinical report.

### Clinical report pipeline

Four stages in `src/lib/report/pipeline.ts`:

1. **Validate** — Zod schema for answers, language, and transcripts
2. **Compose** — flatten visible steps; tag manual/voice/selected sources (`src/lib/report/payload.ts`)
3. **Generate** — Groq chat completion with structured JSON output (`src/lib/report/groq.ts`)
4. **Parse** — validate and coerce response into `ClinicalReport` schema

## API routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/transcribe` | POST | Audio blob → Whisper transcript |
| `/api/translate` | POST | Single text to/from English |
| `/api/translate/batch` | POST | Batch translation (prefetch, report localization) |
| `/api/languages/search` | GET | Search Whisper-supported languages (`?q=`) |
| `/api/report` | POST | Generate clinical report (Groq) |
| `/api/report/pdf` | POST | Clinical report → PDF (English) |
| `/api/export` | POST | Intake and/or report → Excel or PDF |

## Key modules

| Path | Role |
|------|------|
| `src/lib/engine/question-flow.ts` | Build visible intake steps |
| `src/lib/engine/branching.ts` | Conditional question visibility |
| `src/lib/engine/normalize.ts` | Map voice/text → canonical answers |
| `src/lib/engine/answers.ts` | Get/set step answers |
| `src/lib/report/pipeline.ts` | Report generation orchestrator |
| `src/lib/report/payload.ts` | Compose LLM input from intake |
| `src/lib/report/groq.ts` | Groq API client |
| `src/lib/engine/csv-export.ts` | CSV export |
| `src/lib/engine/excel-export.ts` | Excel export |
| `src/lib/report/pdf.ts` | PDF generation |
| `src/hooks/use-intake-store.ts` | Intake state + persistence |
| `src/hooks/use-clinical-report.ts` | Report fetch hook |

## Question schema

The intake form is defined in [`src/data/questions.json`](src/data/questions.json) (mirrored at repo root as `questions.json`). Sections:

| Section | Topic |
|---------|-------|
| A | Personal & family hair loss history |
| B | Hormonal & health influences |
| C | Lifestyle & environmental triggers |
| D | Current hair care & treatments |
| E | Sample collection & consent |

## Deploy (Vercel)

1. Push to GitHub
2. Import the project in Vercel
3. Set environment variables: `HF_TOKEN`, `GROQ_API_KEY`, and optionally `WHISPER_MODEL`, `GROQ_MODEL`
4. Deploy

## License

Take-home project for Haiku Studio / GenoRoot.
