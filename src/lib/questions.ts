import { QuizQuestion } from "./types";

export const quizQuestions: QuizQuestion[] = [
  {
    id: "porosity",
    question: "How does your hair feel right after washing?",
    subtitle: "This helps us understand your hair's porosity",
    options: [
      { value: "high", label: "Dries fast, feels rough quickly", emoji: "⚡" },
      { value: "low", label: "Takes forever to dry, feels slippery", emoji: "💧" },
      { value: "normal", label: "Dries at a normal pace, soft", emoji: "✨" },
      { value: "unknown", label: "I'm not sure", emoji: "🤷🏾‍♀️" },
    ],
  },
  {
    id: "thickness",
    question: "How would you describe your individual strands?",
    subtitle: "Take a single strand and feel it between your fingers",
    options: [
      { value: "fine", label: "Fine — barely feel it", emoji: "🪡" },
      { value: "medium", label: "Medium — can feel it", emoji: "🧵" },
      { value: "coarse", label: "Coarse — thick and strong", emoji: "💪🏾" },
      { value: "unknown", label: "I'm not sure", emoji: "🤷🏾‍♀️" },
    ],
  },
  {
    id: "density",
    question: "How much hair do you have overall?",
    subtitle: "Look at your scalp — can you see it easily?",
    options: [
      { value: "low", label: "Low — I can see my scalp easily", emoji: "🌱" },
      { value: "medium", label: "Medium — some scalp visible", emoji: "🌿" },
      { value: "high", label: "High — very full, can't see scalp", emoji: "🌳" },
      { value: "unknown", label: "I'm not sure", emoji: "🤷🏾‍♀️" },
    ],
  },
  {
    id: "washFrequency",
    question: "How often do you wash your hair?",
    options: [
      { value: "weekly", label: "Every week", emoji: "📅" },
      { value: "biweekly", label: "Every 2 weeks", emoji: "📆" },
      { value: "monthly", label: "Once a month or less", emoji: "🗓️" },
      { value: "unknown", label: "It varies a lot", emoji: "🤷🏾‍♀️" },
    ],
  },
  {
    id: "detangling",
    question: "How do you usually detangle?",
    subtitle: "Your detangling method impacts breakage significantly",
    options: [
      { value: "dry", label: "On dry hair", emoji: "🚫" },
      { value: "wet", label: "On wet hair with water only", emoji: "💦" },
      { value: "conditioner", label: "With conditioner/mask applied", emoji: "✅" },
      { value: "rarely", label: "I rarely detangle", emoji: "😬" },
    ],
  },
  {
    id: "hydration",
    question: "What do you use between washes to hydrate?",
    subtitle: "How do you refresh your hair mid-week?",
    options: [
      { value: "water", label: "Water mist / spray", emoji: "💨" },
      { value: "leavein", label: "Leave-in conditioner", emoji: "🧴" },
      { value: "cream", label: "Cream or butter", emoji: "🧈" },
      { value: "none", label: "Nothing — I wait until wash day", emoji: "⏳" },
    ],
  },
  {
    id: "sealing",
    question: "Do you seal your moisture after hydrating?",
    subtitle: "Sealing locks in hydration so it doesn't evaporate",
    options: [
      { value: "oil", label: "Yes — with an oil", emoji: "🫒" },
      { value: "butter", label: "Yes — with a butter or cream", emoji: "🧈" },
      { value: "both", label: "Both oil and butter", emoji: "✨" },
      { value: "none", label: "No — I skip this step", emoji: "❌" },
    ],
  },
  {
    id: "protein",
    question: "How often do you use protein treatments?",
    subtitle: "Protein strengthens but too much causes brittleness",
    options: [
      { value: "often", label: "Every wash or weekly", emoji: "💪🏾" },
      { value: "sometimes", label: "Occasionally (monthly)", emoji: "✨" },
      { value: "never", label: "Never / I don't know what that is", emoji: "🤷🏾‍♀️" },
    ],
  },
  {
    id: "heat",
    question: "How often do you use heat tools?",
    subtitle: "Flat irons, blow dryers, curling wands, etc.",
    options: [
      { value: "never", label: "Never or very rarely", emoji: "🚫" },
      { value: "sometimes", label: "A few times a month", emoji: "🔥" },
      { value: "often", label: "Weekly or more", emoji: "♨️" },
    ],
  },
  {
    id: "protectiveStyle",
    question: "What protective styles do you wear most?",
    subtitle: "Select the one you wear most often",
    options: [
      { value: "braids", label: "Braids / twists", emoji: "🔗" },
      { value: "wigs", label: "Wigs / weaves", emoji: "💇🏾‍♀️" },
      { value: "afro", label: "Afro / wash-and-go", emoji: "🌸" },
      { value: "tightBuns", label: "Tight buns / cornrows", emoji: "⚠️" },
    ],
  },
  {
    id: "nightProtection",
    question: "How do you protect your hair at night?",
    options: [
      { value: "bonnet", label: "Satin bonnet", emoji: "🧢" },
      { value: "pillowcase", label: "Satin pillowcase", emoji: "🛏️" },
      { value: "both", label: "Both bonnet + pillowcase", emoji: "✨" },
      { value: "none", label: "Nothing — cotton pillowcase", emoji: "😰" },
    ],
  },
  {
    id: "scalp",
    question: "How would you describe your scalp condition?",
    options: [
      { value: "normal", label: "Healthy, no issues", emoji: "✅" },
      { value: "dandruff", label: "Dandruff / flaking", emoji: "❄️" },
      { value: "itching", label: "Itchy or sensitive", emoji: "😣" },
      { value: "buildup", label: "Heavy buildup / clogged", emoji: "🧱" },
    ],
  },
];
