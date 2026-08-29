"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  createInitialState,
  STORAGE_KEY,
  type IntakeAnswers,
  type IntakeState,
} from "@/lib/schema/intake";
import { getVisibleSteps } from "@/lib/engine/question-flow";

interface IntakeStore extends IntakeState {
  setLanguage: (code: string) => void;
  setAnswer: (updater: (answers: IntakeAnswers) => IntakeAnswers) => void;
  setTranscript: (stepId: string, text: string) => void;
  setCurrentStep: (step: number) => void;
  markSubmitted: () => void;
  reset: () => void;
  getVisibleStepCount: () => number;
}

export const useIntakeStore = create<IntakeStore>()(
  persist(
    (set, get) => ({
      ...createInitialState(),
      setLanguage: (code) => set({ preferredLanguage: code }),
      setAnswer: (updater) =>
        set((state) => ({ answers: updater(state.answers) })),
      setTranscript: (stepId, text) =>
        set((state) => ({
          transcripts: { ...state.transcripts, [stepId]: text },
        })),
      setCurrentStep: (step) => set({ currentStep: step }),
      markSubmitted: () => set({ submitted: true }),
      reset: () => set(createInitialState(get().preferredLanguage)),
      getVisibleStepCount: () => getVisibleSteps(get().answers).length,
    }),
    { name: STORAGE_KEY }
  )
);
