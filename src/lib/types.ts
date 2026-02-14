import { Lang } from "./i18n";

export interface QuizQuestion {
  id: string;
  question: { fr: string; en: string };
  subtitle?: { fr: string; en: string };
  options: QuizOption[];
  multiSelect?: boolean;
}

export interface QuizOption {
  value: string;
  label: { fr: string; en: string };
  emoji?: string;
}

export interface DiagnosisResult {
  archetype: { name: string; description: string };
  severityScore: number;
  severityLabel: "Low" | "Moderate" | "Severe";
  primaryCauses: { cause: string; explanation: string }[];
  contributingFactors: string[];
  biggestMistake: string;
  surprisingInsight: string;
  empoweringSentence: string;
  immediateAction: string;
  maskRecommendation: {
    type: string;
    description: string;
    frequency: string;
    warning: string;
  };
  minimumRoutine: { step: number; action: string; detail: string }[];
  idealRoutine: { step: number; action: string; detail: string; frequency: string }[];
  recoveryPlan: { day: string; action: string }[];
  ingredientsAvoid: { name: string; reason: string }[];
  ingredientsSeek: { name: string; reason: string }[];
  timeline: { period: string; expectation: string }[];
  longTermStrategy: string;
  confidenceMessage: string;
  coachNote: string;
}
