"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getLanguage, getSpeechLocale } from "@/lib/i18n/languages";

export function useTts(languageCode: string) {
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const stop = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setIsPaused(false);
  }, []);

  const pause = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis && isSpeaking) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, [isSpeaking]);

  const resume = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis && isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  }, [isPaused]);

  const speak = useCallback(
    (text: string) => {
      if (typeof window === "undefined" || !window.speechSynthesis) return;

      stop();
      const lang = getLanguage(languageCode);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang?.speechLocale ?? getSpeechLocale(languageCode);
      utterance.rate = 0.95;

      const voices = window.speechSynthesis.getVoices();
      const match = voices.find(
        (v) =>
          v.lang.startsWith(languageCode) ||
          v.lang.startsWith(lang?.speechLocale ?? "")
      );
      if (match) utterance.voice = match;

      utterance.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        setIsPaused(false);
      };

      utteranceRef.current = utterance;
      setIsSpeaking(true);
      setIsPaused(false);
      window.speechSynthesis.speak(utterance);
    },
    [languageCode, stop]
  );

  useEffect(() => stop, [stop]);

  return { speak, stop, pause, resume, isSpeaking, isPaused };
}
