import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { DiagnosisResult } from "@/lib/types";
import { generateDiagnosis } from "@/lib/diagnosis";
import { Lang } from "@/lib/i18n";

interface HairState {
  lang: Lang;
  answers: Record<string, string | string[]>;
  currentStep: number;
  results: DiagnosisResult | null;
  email: string;
  isPaid: boolean;
}

interface HairContextType extends HairState {
  setLang: (lang: Lang) => void;
  setAnswer: (questionId: string, value: string | string[]) => void;
  setStep: (step: number) => void;
  generateResults: () => void;
  setEmail: (email: string) => void;
  setPaid: (paid: boolean) => void;
  reset: () => void;
}

const STORAGE_KEY = "hair-diagnosis-state";

const STATE_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function loadState(): Partial<HairState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed._expiresAt && Date.now() > parsed._expiresAt) {
        localStorage.removeItem(STORAGE_KEY);
        return {};
      }
      // Never trust isPaid from localStorage — always validate server-side
      const { _expiresAt, isPaid, ...rest } = parsed;
      return rest;
    }
  } catch {}
  return {};
}

function saveState(state: HairState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      lang: state.lang,
      answers: state.answers,
      currentStep: state.currentStep,
      results: state.results,
      email: state.email,
      // isPaid intentionally excluded — must be validated server-side
      _expiresAt: Date.now() + STATE_EXPIRY_MS,
    }));
  } catch {}
}

const HairContext = createContext<HairContextType | undefined>(undefined);

export function HairProvider({ children }: { children: ReactNode }) {
  const saved = loadState();

  const [state, setState] = useState<HairState>({
    lang: (saved.lang as Lang) || "fr",
    answers: saved.answers || {},
    currentStep: saved.currentStep || 0,
    results: saved.results || null,
    email: saved.email || "",
    isPaid: saved.isPaid || false,
  });

  useEffect(() => {
    saveState(state);
  }, [state]);

  const setLang = (lang: Lang) => setState((prev) => ({ ...prev, lang }));
  const setAnswer = (questionId: string, value: string | string[]) =>
    setState((prev) => ({ ...prev, answers: { ...prev.answers, [questionId]: value } }));
  const setStep = (step: number) => setState((prev) => ({ ...prev, currentStep: step }));
  const generateResults = () => {
    const results = generateDiagnosis(state.answers, state.lang);
    setState((prev) => ({ ...prev, results }));
  };
  const setEmail = (email: string) => setState((prev) => ({ ...prev, email }));
  const setPaid = (paid: boolean) => setState((prev) => ({ ...prev, isPaid: paid }));
  const reset = () =>
    setState({ lang: state.lang, answers: {}, currentStep: 0, results: null, email: "", isPaid: false });

  return (
    <HairContext.Provider value={{ ...state, setLang, setAnswer, setStep, generateResults, setEmail, setPaid, reset }}>
      {children}
    </HairContext.Provider>
  );
}

export function useHair() {
  const ctx = useContext(HairContext);
  if (!ctx) throw new Error("useHair must be used within HairProvider");
  return ctx;
}
