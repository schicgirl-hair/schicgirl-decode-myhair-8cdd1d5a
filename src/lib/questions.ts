import { QuizQuestion } from "./types";

export const quizQuestions: QuizQuestion[] = [
  {
    id: "porosity",
    question: {
      fr: "Comment tes cheveux se sentent-ils juste après le lavage ?",
      en: "How does your hair feel right after washing?",
    },
    subtitle: {
      fr: "Cela nous aide à comprendre la porosité de tes cheveux",
      en: "This helps us understand your hair's porosity",
    },
    options: [
      { value: "high", label: { fr: "Sèchent vite, deviennent rêches", en: "Dries fast, feels rough quickly" } },
      { value: "low", label: { fr: "Mettent très longtemps à sécher", en: "Takes forever to dry, feels slippery" } },
      { value: "normal", label: { fr: "Sèchent normalement, restent doux", en: "Dries at a normal pace, soft" } },
      { value: "unknown", label: { fr: "Je ne suis pas sûre", en: "I'm not sure" } },
    ],
  },
  {
    id: "thickness",
    question: {
      fr: "Comment décrirais-tu tes mèches individuelles ?",
      en: "How would you describe your individual strands?",
    },
    subtitle: {
      fr: "Prends une mèche et sens-la entre tes doigts",
      en: "Take a single strand and feel it between your fingers",
    },
    options: [
      { value: "fine", label: { fr: "Fines — à peine perceptibles", en: "Fine — barely feel it" } },
      { value: "medium", label: { fr: "Moyennes — je les sens", en: "Medium — can feel it" } },
      { value: "coarse", label: { fr: "Épaisses — solides et fortes", en: "Coarse — thick and strong" } },
      { value: "unknown", label: { fr: "Je ne suis pas sûre", en: "I'm not sure" } },
    ],
  },
  {
    id: "density",
    question: {
      fr: "Quelle est la densité globale de tes cheveux ?",
      en: "How much hair do you have overall?",
    },
    subtitle: {
      fr: "Regarde ton cuir chevelu — tu le vois facilement ?",
      en: "Look at your scalp — can you see it easily?",
    },
    options: [
      { value: "low", label: { fr: "Faible — je vois mon cuir chevelu", en: "Low — I can see my scalp easily" } },
      { value: "medium", label: { fr: "Moyenne — un peu visible", en: "Medium — some scalp visible" } },
      { value: "high", label: { fr: "Élevée — très fournis", en: "High — very full, can't see scalp" } },
      { value: "unknown", label: { fr: "Je ne suis pas sûre", en: "I'm not sure" } },
    ],
  },
  {
    id: "washFrequency",
    question: {
      fr: "À quelle fréquence laves-tu tes cheveux ?",
      en: "How often do you wash your hair?",
    },
    options: [
      { value: "weekly", label: { fr: "Chaque semaine", en: "Every week" } },
      { value: "biweekly", label: { fr: "Toutes les 2 semaines", en: "Every 2 weeks" } },
      { value: "monthly", label: { fr: "Une fois par mois ou moins", en: "Once a month or less" } },
      { value: "unknown", label: { fr: "Ça varie beaucoup", en: "It varies a lot" } },
    ],
  },
  {
    id: "detangling",
    question: {
      fr: "Comment démêles-tu habituellement ?",
      en: "How do you usually detangle?",
    },
    subtitle: {
      fr: "Ta méthode de démêlage impacte fortement la casse",
      en: "Your detangling method impacts breakage significantly",
    },
    options: [
      { value: "dry", label: { fr: "Sur cheveux secs", en: "On dry hair" } },
      { value: "wet", label: { fr: "Sur cheveux mouillés à l'eau seule", en: "On wet hair with water only" } },
      { value: "conditioner", label: { fr: "Avec après-shampoing/masque", en: "With conditioner/mask applied" } },
      { value: "rarely", label: { fr: "Je démêle rarement", en: "I rarely detangle" } },
    ],
  },
  {
    id: "hydration",
    question: {
      fr: "Qu'utilises-tu entre les lavages pour hydrater ?",
      en: "What do you use between washes to hydrate?",
    },
    subtitle: {
      fr: "Comment rafraîchis-tu tes cheveux en milieu de semaine ?",
      en: "How do you refresh your hair mid-week?",
    },
    options: [
      { value: "water", label: { fr: "Brumisation d'eau", en: "Water mist / spray" } },
      { value: "leavein", label: { fr: "Leave-in / soin sans rinçage", en: "Leave-in conditioner" } },
      { value: "cream", label: { fr: "Crème ou beurre", en: "Cream or butter" } },
      { value: "none", label: { fr: "Rien — j'attends le prochain lavage", en: "Nothing — I wait until wash day" } },
    ],
  },
  {
    id: "sealing",
    question: {
      fr: "Scelles-tu l'hydratation après avoir hydraté ?",
      en: "Do you seal your moisture after hydrating?",
    },
    subtitle: {
      fr: "Le scellage emprisonne l'hydratation pour qu'elle ne s'évapore pas",
      en: "Sealing locks in hydration so it doesn't evaporate",
    },
    options: [
      { value: "oil", label: { fr: "Oui — avec une huile", en: "Yes — with an oil" } },
      { value: "butter", label: { fr: "Oui — avec un beurre ou crème", en: "Yes — with a butter or cream" } },
      { value: "both", label: { fr: "Les deux : huile + beurre", en: "Both oil and butter" } },
      { value: "none", label: { fr: "Non — je saute cette étape", en: "No — I skip this step" } },
    ],
  },
  {
    id: "protein",
    question: {
      fr: "À quelle fréquence fais-tu des soins protéinés ?",
      en: "How often do you use protein treatments?",
    },
    subtitle: {
      fr: "La protéine renforce mais trop peut rendre les cheveux cassants",
      en: "Protein strengthens but too much causes brittleness",
    },
    options: [
      { value: "often", label: { fr: "Chaque lavage ou chaque semaine", en: "Every wash or weekly" } },
      { value: "sometimes", label: { fr: "De temps en temps (mensuel)", en: "Occasionally (monthly)" } },
      { value: "never", label: { fr: "Jamais / je ne sais pas ce que c'est", en: "Never / I don't know what that is" } },
    ],
  },
  {
    id: "heat",
    question: {
      fr: "À quelle fréquence utilises-tu des outils chauffants ?",
      en: "How often do you use heat tools?",
    },
    subtitle: {
      fr: "Lisseur, sèche-cheveux, fer à boucler, etc.",
      en: "Flat irons, blow dryers, curling wands, etc.",
    },
    options: [
      { value: "never", label: { fr: "Jamais ou très rarement", en: "Never or very rarely" } },
      { value: "sometimes", label: { fr: "Quelques fois par mois", en: "A few times a month" } },
      { value: "often", label: { fr: "Chaque semaine ou plus", en: "Weekly or more" } },
    ],
  },
  {
    id: "protectiveStyle",
    question: {
      fr: "Quelles coiffures protectrices portes-tu le plus ?",
      en: "What protective styles do you wear most?",
    },
    options: [
      { value: "braids", label: { fr: "Tresses / vanilles", en: "Braids / twists" } },
      { value: "wigs", label: { fr: "Perruques / tissages", en: "Wigs / weaves" } },
      { value: "afro", label: { fr: "Afro / wash-and-go", en: "Afro / wash-and-go" } },
      { value: "tightBuns", label: { fr: "Chignons serrés / cornrows", en: "Tight buns / cornrows" } },
    ],
  },
  {
    id: "nightProtection",
    question: {
      fr: "Comment protèges-tu tes cheveux la nuit ?",
      en: "How do you protect your hair at night?",
    },
    options: [
      { value: "bonnet", label: { fr: "Bonnet en satin", en: "Satin bonnet" } },
      { value: "pillowcase", label: { fr: "Taie d'oreiller en satin", en: "Satin pillowcase" } },
      { value: "both", label: { fr: "Bonnet + taie en satin", en: "Both bonnet + pillowcase" } },
      { value: "none", label: { fr: "Rien — taie en coton", en: "Nothing — cotton pillowcase" } },
    ],
  },
  {
    id: "scalp",
    question: {
      fr: "Comment décrirais-tu l'état de ton cuir chevelu ?",
      en: "How would you describe your scalp condition?",
    },
    options: [
      { value: "normal", label: { fr: "Sain, aucun problème", en: "Healthy, no issues" } },
      { value: "dandruff", label: { fr: "Pellicules / desquamation", en: "Dandruff / flaking" } },
      { value: "itching", label: { fr: "Démangeaisons ou sensibilité", en: "Itchy or sensitive" } },
      { value: "buildup", label: { fr: "Accumulation de produits", en: "Heavy buildup / clogged" } },
    ],
  },
];
