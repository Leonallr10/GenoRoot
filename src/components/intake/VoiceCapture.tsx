"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Mic, Pause, Play, Square } from "lucide-react";
import { getSpeechLocale } from "@/lib/i18n/languages";
import { t } from "@/lib/i18n/translations";

interface VoiceCaptureProps {
  language: string;
  onConfirm: (transcript: string) => void;
  onCancel: () => void;
}

type RecordState = "idle" | "recording" | "paused" | "processing";

async function transcribeWithWhisper(
  blob: Blob,
  language: string
): Promise<string> {
  const formData = new FormData();
  formData.append("audio", blob, "recording.webm");
  formData.append("language", language);

  const res = await fetch("/api/transcribe", { method: "POST", body: formData });
  if (!res.ok) throw new Error("Whisper unavailable");
  const data = await res.json();
  return data.transcript as string;
}

function getSpeechRecognitionClass():
  | (new () => SpeechRecognition)
  | undefined {
  if (typeof window === "undefined") return undefined;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition;
}

function transcribeWithWebSpeech(language: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const SpeechRecognition = getSpeechRecognitionClass();
    if (!SpeechRecognition) {
      reject(new Error("Speech recognition not supported"));
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = getSpeechLocale(language);
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      resolve(event.results[0][0].transcript);
    };
    recognition.onerror = () => reject(new Error("Speech recognition failed"));
    recognition.start();
  });
}

export function VoiceCapture({ language, onConfirm, onCancel }: VoiceCaptureProps) {
  const [recordState, setRecordState] = useState<RecordState>("idle");
  const [seconds, setSeconds] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  const clearTimer = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startTimer = () => {
    clearTimer();
    timerRef.current = window.setInterval(() => setSeconds((s) => s + 1), 1000);
  };

  const cleanupStream = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    mediaRecorderRef.current = null;
  };

  useEffect(() => {
    return () => {
      clearTimer();
      cleanupStream();
    };
  }, []);

  const transcribeBlob = async (blob: Blob) => {
    setRecordState("processing");
    try {
      const text = await transcribeWithWhisper(blob, language);
      setTranscript(text);
      setRecordState("idle");
    } catch {
      try {
        const text = await transcribeWithWebSpeech(language);
        setTranscript(text);
        setRecordState("idle");
      } catch {
        setError("Could not transcribe. Please try again or type your answer.");
        setRecordState("idle");
      }
    } finally {
      cleanupStream();
    }
  };

  const startRecording = async () => {
    setError("");
    setTranscript("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        clearTimer();
        if (chunksRef.current.length === 0) {
          setRecordState("idle");
          cleanupStream();
          return;
        }
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        await transcribeBlob(blob);
      };

      mediaRecorderRef.current = recorder;
      recorder.start(250);
      setRecordState("recording");
      setSeconds(0);
      startTimer();
    } catch {
      setError("Microphone access denied.");
      setRecordState("idle");
    }
  };

  const pauseRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state === "recording") {
      recorder.pause();
      clearTimer();
      setRecordState("paused");
    }
  };

  const resumeRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state === "paused") {
      recorder.resume();
      startTimer();
      setRecordState("recording");
    }
  };

  const stopRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    }
  };

  const resetRecording = () => {
    clearTimer();
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
    }
    cleanupStream();
    chunksRef.current = [];
    setTranscript("");
    setError("");
    setSeconds(0);
    setRecordState("idle");
  };

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div className="genoroot-glass mt-4 w-full rounded-2xl p-5">
      <div className="space-y-5">
        <p className="text-center text-xl font-semibold text-slate-800">
          {t(language, "tellUsInYourWords")}
        </p>

        <div className="flex flex-col items-center gap-4">
          {recordState === "idle" && !transcript && (
            <button
              type="button"
              aria-label="Start recording"
              onClick={startRecording}
              className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#e8894a] to-[#d96938] text-white shadow-lg"
            >
              <Mic className="h-10 w-10" />
            </button>
          )}

          {(recordState === "recording" || recordState === "paused") && (
            <div className="flex items-center gap-4">
              {recordState === "recording" ? (
                <button
                  type="button"
                  aria-label={t(language, "pauseRecording")}
                  onClick={pauseRecording}
                  className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#e8894a]/40 bg-white/70 text-[#c96f35] shadow-md"
                >
                  <Pause className="h-7 w-7" />
                </button>
              ) : (
                <button
                  type="button"
                  aria-label={t(language, "resumeRecording")}
                  onClick={resumeRecording}
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#e8894a] to-[#d96938] text-white shadow-md"
                >
                  <Play className="h-7 w-7" />
                </button>
              )}
              <button
                type="button"
                aria-label={t(language, "stopRecording")}
                onClick={stopRecording}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500 text-white shadow-md"
              >
                <Square className="h-6 w-6 fill-current" />
              </button>
            </div>
          )}

          {recordState === "processing" && (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/60">
              <Loader2 className="h-10 w-10 animate-spin text-[#c96f35]" />
            </div>
          )}

          <p className="text-lg font-medium text-[#c96f35]">
            {recordState === "processing"
              ? t(language, "transcribing")
              : recordState === "recording" || recordState === "paused"
                ? `${mm}:${ss}${recordState === "paused" ? " · Paused" : ""}`
                : t(language, "tapAndSpeak")}
          </p>
        </div>

        {transcript && (
          <p className="rounded-xl bg-white/50 p-5 text-xl leading-relaxed text-slate-800">
            &ldquo;{transcript}&rdquo;
          </p>
        )}

        {error && <p className="text-center text-base text-red-600">{error}</p>}

        <div className="flex gap-3">
          <button
            type="button"
            className="genoroot-btn-continue flex-1 disabled:opacity-40"
            disabled={!transcript}
            onClick={() => onConfirm(transcript)}
          >
            {t(language, "useThis")}
          </button>
          <button
            type="button"
            className="genoroot-btn-back flex-1"
            onClick={() => {
              resetRecording();
              onCancel();
            }}
          >
            {t(language, "tryAgain")}
          </button>
        </div>
      </div>
    </div>
  );
}
