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

import type { ClinicalReport } from "@/lib/report/schema";

export type StoredClinicalReport = {
  report: ClinicalReport;
  model: string;
  generatedAt: string;
};

interface IntakeStore extends IntakeState {
  setLanguage: (code: string) => void;
  setAnswer: (updater: (answers: IntakeAnswers) => IntakeAnswers) => void;
  setTranscript: (stepId: string, text: string) => void;
  setCurrentStep: (step: number) => void;
  markSubmitted: () => void;
  setClinicalReport: (report: StoredClinicalReport | null) => void;
  resetIntake: (language?: string) => void;
  /** @deprecated Use resetIntake */
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
      markSubmitted: () =>
        set((state) => ({
          submitted: true,
          intakeLanguage: state.intakeLanguage ?? state.preferredLanguage,
        })),
      setClinicalReport: (report) => set({ clinicalReport: report }),
      resetIntake: (language) => {
        const lang = language ?? get().preferredLanguage;
        set(createInitialState(lang));
      },
      reset: () => get().resetIntake(get().preferredLanguage),
      getVisibleStepCount: () => getVisibleSteps(get().answers).length,
    }),
    { name: STORAGE_KEY }
  )
);
