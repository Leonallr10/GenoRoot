import { z } from "zod";

const productProcedureEntrySchema = z.object({
  used: z.boolean().optional(),
  done: z.boolean().optional(),
  duration: z.string().optional(),
  helped: z.boolean().optional(),
  side_effects: z.boolean().optional(),
  sessions: z.string().optional(),
});

export const intakeAnswersSchema = z.object({
  age_hair_loss_began: z.number().optional(),
  duration: z.string().optional(),
  family_history: z.array(z.string()).optional(),
  other_family_history_note: z.string().optional(),
  pattern: z.array(z.string()).optional(),
  diagnosed_conditions: z.array(z.string()).optional(),
  menstrual_cycle: z.string().optional(),
  pregnancy_related: z.string().optional(),
  adult_acne_oily_skin: z.boolean().optional(),
  excess_body_facial_hair: z.boolean().optional(),
  past_6_months: z.array(z.string()).optional(),
  habits: z
    .object({
      smoking: z.boolean().optional(),
      smoking_severity: z.string().optional(),
      alcohol: z.boolean().optional(),
      hard_water: z.boolean().optional(),
      hair_wash_frequency: z.string().optional(),
      heating_tools_styling_chemicals: z.boolean().optional(),
      salon_treatments: z.boolean().optional(),
      salon_treatment_detail: z.string().optional(),
    })
    .optional(),
  products: z.record(z.string(), productProcedureEntrySchema).optional(),
  procedures: z.record(z.string(), productProcedureEntrySchema).optional(),
  past_treatment_side_effects: z.boolean().optional(),
  describe: z.string().optional(),
  sample_type: z.string().optional(),
  consent: z.boolean().optional(),
});

export const intakeStateSchema = z.object({
  preferredLanguage: z.string(),
  answers: intakeAnswersSchema,
  transcripts: z.record(z.string(), z.string()).optional(),
  currentStep: z.number(),
  submitted: z.boolean().optional(),
});

export type IntakeAnswers = z.infer<typeof intakeAnswersSchema>;
export type IntakeState = z.infer<typeof intakeStateSchema>;

export const STORAGE_KEY = "genoroot-intake-v1";

export function createInitialState(language = "en"): IntakeState {
  return {
    preferredLanguage: language,
    answers: {},
    transcripts: {},
    currentStep: 0,
    submitted: false,
  };
}
