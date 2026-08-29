import questionsData from "@/data/questions.json";

export type QuestionType =
  | "number"
  | "single"
  | "multi"
  | "yesno"
  | "table"
  | "text"
  | "bool";

export interface FollowupQuestion {
  key: string;
  type: QuestionType;
  options?: string[];
}

export interface HabitRow {
  key: string;
  type: QuestionType;
  options?: string[];
  followup?: FollowupQuestion;
}

export interface TableColumn {
  key: string;
  type: QuestionType;
  options?: string[];
}

export interface Question {
  n: number;
  key: string;
  type: QuestionType;
  options?: string[];
  femaleOnly?: boolean;
  rows?: HabitRow[] | string[];
  columns?: TableColumn[];
  followup?: FollowupQuestion;
}

export interface Section {
  id: string;
  title: string;
  questions: Question[];
}

export interface IntakeFormSchema {
  form: string;
  sections: Section[];
}

export const intakeSchema = questionsData as IntakeFormSchema;

export const TOTAL_QUESTIONS = 16;
