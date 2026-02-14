export type Lang = "fr" | "en";

export const L = (lang: Lang, fr: string, en: string) => (lang === "fr" ? fr : en);

type Translations = Record<string, { fr: string; en: string }>;

const ui: Translations = {
  // Welcome
  badge: { fr: "Analyse Capillaire IA", en: "AI-Powered Hair Analysis" },
  title1: { fr: "Pourquoi Mes", en: "Why Is My" },
  titleHighlight: { fr: "Cheveux Sont Secs", en: "Hair Dry" },
  subtitle: { fr: "Arrête de deviner. Diagnostique la vraie cause en 60 secondes.", en: "Stop guessing. Diagnose the real reason in 60 seconds." },
  cta: { fr: "Commencer Mon Analyse", en: "Start My Analysis" },
  trust1: { fr: "Basé sur la science capillaire", en: "Based on natural hair science" },
  trust2: { fr: "100% cheveux naturels", en: "Natural-hair-safe only" },
  trust3: { fr: "Confidentialité protégée", en: "Privacy protected" },

  // Quiz
  of: { fr: "sur", en: "of" },
  continueBtn: { fr: "Continuer", en: "Continue" },
  seeResults: { fr: "Voir Mes Résultats", en: "See My Results" },

  // Preview
  analysisComplete: { fr: "Analyse Terminée", en: "Analysis Complete" },
  yourSnapshot: { fr: "Ton Aperçu Capillaire", en: "Your Hair Snapshot" },
  previewSubtitle: { fr: "Voici un aperçu de ce qu'on a trouvé", en: "Here's a preview of what we found" },
  drynessSeverity: { fr: "Sévérité de la Sécheresse", en: "Dryness Severity" },
  primaryRootCause: { fr: "Cause Principale", en: "Primary Root Cause" },
  quickTip: { fr: "Conseil rapide", en: "Quick tip" },
  hairIdentityProfile: { fr: "Profil d'Identité Capillaire", en: "Hair Identity Profile" },
  recoveryPlan7Day: { fr: "Plan de Récupération 7 Jours", en: "7-Day Recovery Plan" },
  smartMaskRec: { fr: "Recommandation Masque", en: "Smart Mask Recommendation" },
  ingredientLists: { fr: "Listes d'Ingrédients", en: "Ingredient Lists" },
  personalizedRoutine: { fr: "Routine Personnalisée", en: "Personalized Routine" },
  unlockFull: { fr: "Payer $7 — Débloquer Mon Diagnostic", en: "Pay $7 — Unlock My Diagnosis" },
  getFullDiagnosis: { fr: "Obtenir Mon Diagnostic Complet — $7", en: "Get My Full Diagnosis — $7" },
  emailPlaceholder: { fr: "Entre ton email pour continuer", en: "Enter your email to continue" },
  fullDiagnosisAwaits: { fr: "Ta routine personnalisée, ton plan de récupération et les recommandations de ton experte t'attendent — pour seulement $7.", en: "Your personalized routine, recovery plan, and expert recommendations await — for only $7." },
  processing: { fr: "Redirection vers le paiement...", en: "Redirecting to payment..." },
  contactForMore: { fr: "Pour aller plus loin, contacte-moi directement :", en: "To go further, contact me directly:" },
  contactDesc: { fr: "Je crée des routines complètes et personnalisées adaptées à ton profil capillaire, tes produits et tes objectifs.", en: "I create complete, personalized routines tailored to your hair profile, products, and goals." },
  contactMe: { fr: "Me Contacter", en: "Contact Me" },

  // Results
  fullDiagnosis: { fr: "Diagnostic Complet", en: "Full Diagnosis" },
  completeAnalysis: { fr: "Ton Analyse Capillaire Complète", en: "Your Complete Hair Analysis" },
  yourHairIdentity: { fr: "Ton Identité Capillaire", en: "Your Hair Identity" },
  rootCauses: { fr: "Causes Profondes", en: "Root Causes" },
  contributingFactors: { fr: "Facteurs Contributifs", en: "Contributing Factors" },
  biggestMistake: { fr: "Plus Grande Erreur Détectée", en: "Biggest Mistake Detected" },
  maskRecommendation: { fr: "Masque Recommandé", en: "Smart Mask Recommendation" },
  minimumRoutine: { fr: "Routine Minimum", en: "Minimum Routine" },
  minRoutineDesc: { fr: "L'essentiel — simple et efficace", en: "The essentials — simple and effective" },
  idealRoutine: { fr: "Routine Idéale", en: "Ideal Routine" },
  idealRoutineDesc: { fr: "Ta routine optimisée pour les meilleurs résultats", en: "Your optimized routine for best results" },
  recoveryPlan: { fr: "Plan de Récupération 7 Jours", en: "7-Day Recovery Plan" },
  ingredientsAvoid: { fr: "Ingrédients à Éviter", en: "Ingredients to Avoid" },
  ingredientsSeek: { fr: "Ingrédients à Rechercher", en: "Ingredients to Look For" },
  improvementTimeline: { fr: "Calendrier d'Amélioration", en: "Improvement Timeline" },
  longTermStrategy: { fr: "Stratégie Long Terme", en: "Long-Term Strategy" },
  coachNoteTitle: { fr: "Un Message de Ta Coach Capillaire", en: "A Message From Your Hair Coach" },
  nextLevel: { fr: "Prête pour l'étape suivante ?", en: "Ready for the Next Level?" },
  nextLevelDesc: { fr: "Obtiens une routine complète construite exactement pour ton profil capillaire, tes produits et tes objectifs.", en: "Get a fully personalized routine built around your exact hair profile, products, and goals." },
  buildFullRoutine: { fr: "Construire Ma Routine Complète", en: "Build My Full Personalized Routine" },
  startNewAnalysis: { fr: "Commencer une nouvelle analyse", en: "Start a new analysis" },
  surprisingInsightLabel: { fr: "💡 Le savais-tu ?", en: "💡 Did you know?" },
  empoweringLabel: { fr: "✨ Rappelle-toi", en: "✨ Remember" },
  immediateActionLabel: { fr: "🎯 Action immédiate", en: "🎯 Immediate action" },

  // Severity
  low: { fr: "Faible", en: "Low" },
  moderate: { fr: "Modéré", en: "Moderate" },
  severe: { fr: "Sévère", en: "Severe" },

  // Language selector
  selectLanguage: { fr: "Choisis ta langue", en: "Choose your language" },
};

export function t(lang: Lang, key: string): string {
  const entry = ui[key];
  if (!entry) return key;
  return entry[lang];
}
