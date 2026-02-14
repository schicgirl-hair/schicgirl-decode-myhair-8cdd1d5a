import { DiagnosisResult } from "./types";

type Answers = Record<string, string | string[]>;

function getVal(answers: Answers, key: string): string {
  const v = answers[key];
  return Array.isArray(v) ? v[0] || "" : v || "";
}

export function generateDiagnosis(answers: Answers): DiagnosisResult {
  const porosity = getVal(answers, "porosity");
  const thickness = getVal(answers, "thickness");
  const density = getVal(answers, "density");
  const washFreq = getVal(answers, "washFrequency");
  const detangling = getVal(answers, "detangling");
  const hydration = getVal(answers, "hydration");
  const sealing = getVal(answers, "sealing");
  const protein = getVal(answers, "protein");
  const heat = getVal(answers, "heat");
  const protStyle = getVal(answers, "protectiveStyle");
  const nightProt = getVal(answers, "nightProtection");
  const scalp = getVal(answers, "scalp");

  // === SEVERITY SCORE ===
  let score = 25;
  if (porosity === "high") score += 12;
  if (sealing === "none") score += 12;
  if (detangling === "dry") score += 14;
  if (detangling === "rarely") score += 8;
  if (nightProt === "none") score += 10;
  if (hydration === "none") score += 10;
  if (heat === "often") score += 14;
  if (heat === "sometimes") score += 6;
  if (protein === "often" && thickness === "fine") score += 10;
  if (scalp === "buildup") score += 8;
  if (scalp === "dandruff" || scalp === "itching") score += 5;
  if (protStyle === "tightBuns") score += 8;
  if (washFreq === "monthly") score += 5;
  if (thickness === "fine" && sealing === "both") score += 6;
  score = Math.min(100, Math.max(0, score));

  const severityLabel: DiagnosisResult["severityLabel"] =
    score <= 35 ? "Low" : score <= 65 ? "Moderate" : "Severe";

  // === ROOT CAUSES ===
  const causes: { cause: string; explanation: string }[] = [];

  if (sealing === "none" && porosity === "high") {
    causes.push({ cause: "Moisture Evaporation", explanation: "Your high-porosity hair loses moisture rapidly, and without sealing, hydration evaporates within hours. Your hair is literally drying out between washes." });
  } else if (sealing === "none") {
    causes.push({ cause: "Moisture Evaporation", explanation: "Without sealing your moisture, even good hydration products evaporate too quickly. Your hair needs a protective layer to hold water in." });
  }

  if ((scalp === "buildup" || (thickness === "fine" && sealing === "both"))) {
    causes.push({ cause: "Product Buildup", explanation: "Heavy products are coating your strands and blocking moisture from penetrating. Your hair feels dry on top but can't absorb what it needs." });
  }

  if (protein === "often" && (thickness === "fine" || thickness === "medium")) {
    causes.push({ cause: "Protein Overload", explanation: "Too much protein is making your strands rigid and brittle. Your hair needs more moisture and less strengthening right now." });
  }

  if (detangling === "dry") {
    causes.push({ cause: "Detangling Friction", explanation: "Dry detangling creates micro-tears along your hair shaft, leading to breakage, split ends, and rough texture. This is one of the most damaging habits." });
  }

  if (porosity === "low" && hydration === "none") {
    causes.push({ cause: "Porosity Mismatch", explanation: "Your low-porosity hair resists absorbing moisture. Without the right technique (warmth, lightweight products), hydration just sits on top." });
  }

  if (protStyle === "tightBuns") {
    causes.push({ cause: "Tension Damage", explanation: "Tight styles pull on your edges and weaken your hairline. Combined with dryness, this accelerates breakage in the most visible areas." });
  }

  if (scalp === "dandruff" || scalp === "itching") {
    causes.push({ cause: "Scalp Dehydration", explanation: "A dry, irritated scalp can't properly nourish new growth. Healthy hair starts at the root, and your scalp needs attention." });
  }

  if (heat === "often") {
    causes.push({ cause: "Heat Damage", explanation: "Frequent heat use strips your hair's natural moisture barrier and weakens the protein structure. This damage is cumulative and compounds over time." });
  }

  if (causes.length === 0) {
    causes.push({ cause: "Improper Layering", explanation: "Your products may not be layered in the right order (water → leave-in → cream → sealant), reducing their effectiveness." });
  }

  // === ARCHETYPE ===
  const primaryCause = causes[0].cause;
  let archetype: DiagnosisResult["archetype"];

  if (primaryCause === "Moisture Evaporation") {
    archetype = { name: "The Moisture-Seeking Protector", description: "Your hair is constantly reaching for hydration but can't hold onto it. You need a sealing strategy that matches your porosity." };
  } else if (primaryCause === "Product Buildup") {
    archetype = { name: "The Overlayered Recoverer", description: "You've been giving your hair too much love in the wrong way. Lighter products and regular clarifying will transform your texture." };
  } else if (primaryCause === "Protein Overload") {
    archetype = { name: "The Gentle Growth Builder", description: "Your hair craves softness and flexibility. A moisture-focused reset will bring back bounce and elasticity." };
  } else if (primaryCause === "Detangling Friction" || primaryCause === "Tension Damage") {
    archetype = { name: "The Tender-Touch Healer", description: "Your hair is strong but has been handled too roughly. Gentle methods and patience will reveal its true beauty." };
  } else if (primaryCause === "Heat Damage") {
    archetype = { name: "The Resilient Rebuilder", description: "Your hair has been through a lot but it's ready to recover. Consistent gentle care will restore its natural pattern and shine." };
  } else {
    archetype = { name: "The Lightweight Hydration Seeker", description: "Your hair thrives on simplicity. The right lightweight products in the right order will unlock soft, defined curls." };
  }

  // === CONTRIBUTING FACTORS ===
  const factors: string[] = [];
  if (nightProt === "none") factors.push("No nighttime protection — cotton absorbs your moisture while you sleep");
  if (hydration === "none") factors.push("No mid-week hydration — your hair goes too long without moisture");
  if (washFreq === "monthly") factors.push("Infrequent washing allows buildup to block moisture absorption");
  if (heat === "sometimes" || heat === "often") factors.push("Heat usage weakens your hair's natural moisture barrier");
  if (protein === "never") factors.push("Skipping protein entirely may leave hair too soft and prone to stretching");
  if (scalp !== "normal") factors.push("Scalp issues can affect new growth quality and overall hair health");
  if (factors.length === 0) factors.push("Minor layering or product mismatch reducing moisture retention");
  if (factors.length < 3) factors.push("Consistency in routine is key — irregular care compounds dryness");
  if (factors.length < 3) factors.push("Environmental factors (climate, water quality) may need addressing");

  // === BIGGEST MISTAKE ===
  let biggestMistake: string;
  if (detangling === "dry") biggestMistake = "Detangling on dry hair is causing the most damage. This single habit change — switching to wet detangling with conditioner — can reduce breakage by up to 70%.";
  else if (sealing === "none" && porosity === "high") biggestMistake = "Not sealing your high-porosity hair is your biggest gap. All the moisture you add literally evaporates within hours. A good oil or butter seal changes everything.";
  else if (protein === "often" && thickness === "fine") biggestMistake = "You're overloading fine strands with protein. This makes them stiff and snap-prone. Cut protein to once a month and focus on deep moisture treatments.";
  else if (nightProt === "none") biggestMistake = "Sleeping on cotton without protection is silently drying your hair every single night. A satin bonnet alone can dramatically improve moisture retention.";
  else if (heat === "often") biggestMistake = "Frequent heat usage is the primary culprit. Each session strips more moisture and weakens your strands. Even reducing to once a month will show visible improvement.";
  else if (scalp === "buildup") biggestMistake = "Product buildup is creating a barrier that blocks all your good products from working. A clarifying wash will immediately improve how your hair feels.";
  else biggestMistake = "Your products may be too heavy for your hair type, creating a coating that feels moisturized but actually blocks true hydration from penetrating the strand.";

  // === MASK RECOMMENDATION ===
  let maskRec: DiagnosisResult["maskRecommendation"];
  if (scalp === "buildup" || (thickness === "fine" && sealing === "both")) {
    maskRec = { type: "Purifying Clay Mask", description: "A bentonite or rhassoul clay mask to remove buildup, detox the scalp, and reset your hair's ability to absorb moisture.", frequency: "Every 2–3 weeks", warning: "Don't overdo clay masks — they can be drying. Always follow with a deep conditioner." };
  } else if (protein === "often" || (thickness === "fine" && porosity === "high")) {
    maskRec = { type: "Deep Moisture Mask", description: "A protein-free deep conditioner packed with humectants (honey, aloe) and emollients (shea, avocado) to restore flexibility and softness.", frequency: "Weekly for 4 weeks, then biweekly", warning: "Avoid any mask with protein, keratin, or silk amino acids during your recovery phase." };
  } else if (thickness === "coarse" || (porosity === "high" && hydration === "none")) {
    maskRec = { type: "Nourishing Butter Mask", description: "A rich, creamy mask with shea butter, mango butter, and oils to deeply nourish and coat each strand with lasting moisture.", frequency: "Weekly", warning: "Use heat (warm towel or steam) for better penetration. Rinse thoroughly to avoid residue." };
  } else {
    maskRec = { type: "Hydrating Moisture Mask", description: "A lightweight hydrating mask with aloe vera, glycerin, and natural humectants to boost water content without weighing hair down.", frequency: "Weekly for 3 weeks, then biweekly", warning: "Don't leave on longer than recommended — diminishing returns after 30 minutes." };
  }

  // === MINIMUM ROUTINE ===
  const minRoutine: DiagnosisResult["minimumRoutine"] = [
    { step: 1, action: "Gentle Cleanse", detail: porosity === "low" ? "Use a lightweight sulfate-free shampoo with warm water to open cuticles" : "Use a moisturizing sulfate-free shampoo or co-wash" },
    { step: 2, action: "Deep Condition", detail: `Apply ${maskRec.type.toLowerCase()} for 15–30 min under a warm towel` },
    { step: 3, action: "Leave-in + Seal", detail: sealing === "none" ? "Apply leave-in conditioner, then seal with a lightweight oil (jojoba or sweet almond)" : "Apply leave-in conditioner, then seal with your preferred method" },
  ];
  if (nightProt === "none") minRoutine.push({ step: 4, action: "Night Protection", detail: "Sleep with a satin bonnet or on a satin pillowcase — every single night" });
  if (detangling === "dry") minRoutine.push({ step: minRoutine.length + 1, action: "Gentle Detangle", detail: "Only detangle on wet, conditioned hair with a wide-tooth comb, working from ends to roots" });

  // === IDEAL ROUTINE ===
  const idealRoutine: DiagnosisResult["idealRoutine"] = [
    { step: 1, action: "Pre-poo Oil Treatment", detail: "Apply coconut or olive oil 30 min before washing to protect strands during cleansing", frequency: "Every wash day" },
    { step: 2, action: "Clarifying Wash", detail: "Use a clarifying shampoo to remove buildup and reset", frequency: "Every 3–4 weeks" },
    { step: 3, action: "Gentle Cleanse", detail: "Sulfate-free shampoo focusing on scalp, let suds run down lengths", frequency: "Weekly or biweekly" },
    { step: 4, action: "Deep Conditioning", detail: `${maskRec.type} under plastic cap + warm towel for 20–30 min`, frequency: maskRec.frequency },
    { step: 5, action: "LOC/LCO Method", detail: porosity === "high" ? "Liquid → Oil → Cream (LOC) to lock moisture into high-porosity hair" : "Liquid → Cream → Oil (LCO) for better absorption on your hair type", frequency: "Every wash day" },
    { step: 6, action: "Scalp Massage", detail: "2-minute scalp massage with lightweight oil to boost circulation and growth", frequency: "3x per week" },
    { step: 7, action: "Protective Styling", detail: "Low-tension protective styles — loose twists, pineapple, or satin-lined wigs", frequency: "As needed" },
    { step: 8, action: "Night Routine", detail: "Refresh with water mist, apply light oil to ends, satin bonnet", frequency: "Nightly" },
  ];

  // === 7-DAY RECOVERY PLAN ===
  const recoveryPlan: DiagnosisResult["recoveryPlan"] = [
    { day: "Day 1", action: scalp === "buildup" ? "Clarifying wash + deep condition with warm towel for 30 min. Detangle gently on wet hair." : "Gentle co-wash + deep moisture mask for 30 min under warm towel. Detangle gently." },
    { day: "Day 2", action: "Refresh with water mist + leave-in conditioner. Seal with lightweight oil. Wear a low-tension style." },
    { day: "Day 3", action: "Scalp massage with jojoba oil (2 min). Light refresh spray if dry. Sleep with satin bonnet." },
    { day: "Day 4", action: "Mid-week check: if hair feels dry, apply leave-in to ends. Avoid touching/manipulating hair." },
    { day: "Day 5", action: "Gentle refresh with water mist. Re-twist or re-style without heat. Moisturize edges." },
    { day: "Day 6", action: "Pre-poo treatment: apply oil of choice 1 hour before tomorrow's wash. Gentle finger detangle." },
    { day: "Day 7", action: "Wash day: repeat Day 1 routine. Notice how your hair responds differently already." },
  ];

  // === INGREDIENTS ===
  const avoid: DiagnosisResult["ingredientsAvoid"] = [];
  const seek: DiagnosisResult["ingredientsSeek"] = [];

  avoid.push({ name: "Sulfates (SLS/SLES)", reason: "Strip natural oils and accelerate dryness" });
  if (scalp === "buildup" || thickness === "fine") avoid.push({ name: "Heavy silicones (dimethicone)", reason: "Create buildup that blocks moisture absorption" });
  avoid.push({ name: "Drying alcohols (alcohol denat, isopropyl)", reason: "Evaporate moisture from the hair shaft" });
  if (protein === "often") avoid.push({ name: "Hydrolyzed protein / keratin", reason: "Your hair is protein-overloaded — avoid for 4–6 weeks" });
  if (thickness === "fine") avoid.push({ name: "Heavy waxes & petroleum", reason: "Too heavy for fine strands, causes limp, weighed-down hair" });
  avoid.push({ name: "Mineral oil (petrolatum)", reason: "Coats the strand without nourishing — traps dirt and buildup" });

  seek.push({ name: "Glycerin", reason: "Powerful humectant that draws water into the hair shaft" });
  seek.push({ name: "Aloe vera", reason: "Natural moisturizer with pH-balancing and soothing properties" });
  seek.push({ name: "Shea butter", reason: "Rich emollient that seals moisture and adds softness" });
  if (porosity === "high") seek.push({ name: "Castor oil", reason: "Heavy sealant perfect for high-porosity hair that loses moisture fast" });
  else seek.push({ name: "Jojoba oil", reason: "Lightweight oil that mimics natural sebum — won't weigh hair down" });
  seek.push({ name: "Honey", reason: "Natural humectant and emollient — softens and draws in moisture" });
  if (protein === "never" || protein === "unknown") seek.push({ name: "Rice water (occasional)", reason: "Gentle natural protein source for subtle strengthening" });

  // === TIMELINE ===
  const timeline: DiagnosisResult["timeline"] = [
    { period: "Days 1–3", expectation: "Hair feels softer to touch. Less tangling during styling. Scalp feels cleaner and less itchy." },
    { period: "Week 2", expectation: "Noticeable moisture retention between washes. Less breakage during detangling. Curls start to clump better." },
    { period: "Week 4", expectation: "Significant improvement in softness, shine, and definition. Reduced frizz. Hair holds styles longer. You'll feel the difference." },
  ];

  // === LONG-TERM STRATEGY ===
  const longTermStrategy = thickness === "fine"
    ? "Focus on lightweight, water-based products. Clarify monthly. Protein treatments every 6–8 weeks only. Prioritize gentle handling and low-tension styles. As your hair strengthens, you can experiment with slightly richer products."
    : porosity === "high"
    ? "Build a consistent sealing routine. Deep condition weekly. Gradually introduce protein every 4–6 weeks to strengthen. Consider the greenhouse effect (baggy method) for intense hydration sessions."
    : "Maintain a regular wash schedule. Alternate between moisture and light protein monthly. Keep products lightweight and water-based. Scalp health is your foundation — massage and oil regularly.";

  // === CONFIDENCE MESSAGE ===
  const confidenceMessage = "Your natural hair is beautiful, resilient, and uniquely yours. Dryness is not a flaw — it's a signal. Now that you understand what your hair is asking for, you have the power to give it exactly what it needs. Every coil, kink, and curl is worth the care. You've got this. 👑";

  // === COACH NOTE ===
  const coachNotes = [
    `I can see exactly what's happening with your hair. ${causes[0].cause.toLowerCase()} is the main culprit, but the good news? This is completely fixable. Start with the 7-day plan, be patient with yourself, and watch the transformation unfold. Your hair already has everything it needs to thrive — we're just removing the obstacles. 💛`,
    `Your hair story is unique, and so is your path forward. Don't compare your journey to anyone else's. The fact that you're here, seeking answers, shows you're ready for change. Trust the process, be consistent, and remember: healthy hair is a marathon, not a sprint. I believe in your hair. 💛`,
  ];

  return {
    archetype,
    severityScore: score,
    severityLabel,
    primaryCauses: causes.slice(0, 2),
    contributingFactors: factors.slice(0, 3),
    biggestMistake,
    maskRecommendation: maskRec,
    minimumRoutine: minRoutine,
    idealRoutine,
    recoveryPlan,
    ingredientsAvoid: avoid,
    ingredientsSeek: seek,
    timeline,
    longTermStrategy,
    confidenceMessage,
    coachNote: coachNotes[score > 50 ? 0 : 1],
  };
}
