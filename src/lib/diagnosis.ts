import { DiagnosisResult } from "./types";
import { Lang } from "./i18n";

type Answers = Record<string, string | string[]>;
const g = (a: Answers, k: string): string => { const v = a[k]; return Array.isArray(v) ? v[0] || "" : v || ""; };

export function generateDiagnosis(answers: Answers, lang: Lang): DiagnosisResult {
  const L = (fr: string, en: string) => (lang === "fr" ? fr : en);

  const porosity = g(answers, "porosity");
  const thickness = g(answers, "thickness");
  const washFreq = g(answers, "washFrequency");
  const detangling = g(answers, "detangling");
  const hydration = g(answers, "hydration");
  const sealing = g(answers, "sealing");
  const protein = g(answers, "protein");
  const heat = g(answers, "heat");
  const protStyle = g(answers, "protectiveStyle");
  const nightProt = g(answers, "nightProtection");
  const scalp = g(answers, "scalp");

  // === SEVERITY ===
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

  // === ROOT CAUSES (adaptive combinations) ===
  const causes: DiagnosisResult["primaryCauses"] = [];

  // Combination: dryness + no hydration between washes
  if (hydration === "none" && sealing === "none") {
    causes.push({
      cause: L("Évaporation de l'Hydratation", "Moisture Evaporation"),
      explanation: L(
        "Tes cheveux ne reçoivent aucune hydratation entre les lavages et rien ne vient sceller l'eau. C'est comme arroser une plante sans pot : tout s'évapore. Tes cheveux ont besoin d'une stratégie d'hydratation en couches — eau, soin sans rinçage, puis un scellant.",
        "Your hair gets zero hydration between washes and nothing seals in water. It's like watering a plant without a pot — everything evaporates. Your hair needs a layered moisture strategy — water, leave-in, then a sealant."
      ),
    });
  } else if (sealing === "none" && porosity === "high") {
    causes.push({
      cause: L("Évaporation de l'Hydratation", "Moisture Evaporation"),
      explanation: L(
        "Avec ta porosité élevée, tes cuticules sont grandes ouvertes. Sans scellant, l'eau entre et ressort aussitôt. C'est pour ça que tes cheveux semblent hydratés au lavage puis secs quelques heures après.",
        "With your high porosity, your cuticles are wide open. Without a sealant, water enters and exits just as fast. That's why your hair feels moisturized at wash time then dry hours later."
      ),
    });
  } else if (sealing === "none") {
    causes.push({
      cause: L("Hydratation Non Scellée", "Unsealed Hydration"),
      explanation: L(
        "Tu hydrates, mais sans sceller. C'est comme mettre de la crème sur ta peau et ne rien appliquer par-dessus — tout s'évapore. Un simple beurre ou huile en finition changerait tout.",
        "You moisturize, but don't seal. It's like applying lotion to your skin and leaving it exposed — everything evaporates. A simple butter or oil as a final step would change everything."
      ),
    });
  }

  // Combination: buildup + heavy oils
  if ((scalp === "buildup" || (thickness === "fine" && sealing === "both"))) {
    causes.push({
      cause: L("Accumulation de Produits", "Product Buildup"),
      explanation: L(
        "Tes produits sont trop lourds ou s'accumulent sur la fibre. Résultat : tes soins hydratants ne peuvent plus pénétrer. Tes cheveux paraissent secs en surface alors qu'ils sont surchargés en dessous. Un lavage clarifiant va tout remettre à zéro.",
        "Your products are too heavy or building up on the strand. Result: your moisturizing products can't penetrate anymore. Your hair looks dry on the surface while being overloaded underneath. A clarifying wash will reset everything."
      ),
    });
  }

  // Combination: breakage + fine strands
  if (protein === "often" && (thickness === "fine" || thickness === "medium")) {
    causes.push({
      cause: L("Surcharge en Protéines", "Protein Overload"),
      explanation: L(
        "Tes mèches fines reçoivent trop de protéines. Elles deviennent rigides comme de la paille et cassent au moindre contact. Ce qu'il te faut maintenant, c'est de la douceur et de l'hydratation profonde — pas plus de renforcement.",
        "Your fine strands are getting too much protein. They become stiff like straw and snap at the slightest touch. What you need right now is softness and deep moisture — not more strengthening."
      ),
    });
  }

  // Combination: dry detangling
  if (detangling === "dry") {
    causes.push({
      cause: L("Friction au Démêlage", "Detangling Friction"),
      explanation: L(
        "Démêler sur cheveux secs crée des micro-déchirures le long de la fibre capillaire. Chaque séance accumule les dégâts — frisottis, pointes fourchues, casse. C'est l'habitude la plus dommageable et pourtant la plus facile à corriger.",
        "Detangling on dry hair creates micro-tears along the hair shaft. Each session accumulates damage — frizz, split ends, breakage. It's the most damaging habit yet the easiest to fix."
      ),
    });
  }

  // Combination: tight styles + edge tension
  if (protStyle === "tightBuns") {
    causes.push({
      cause: L("Dommages par Tension", "Tension Damage"),
      explanation: L(
        "Les coiffures serrées tirent constamment sur tes contours et fragilisent ta ligne capillaire. Combiné avec la sécheresse, cela accélère la casse dans les zones les plus visibles. Tes edges méritent une attention particulière.",
        "Tight styles constantly pull on your edges and weaken your hairline. Combined with dryness, this accelerates breakage in the most visible areas. Your edges deserve special attention."
      ),
    });
  }

  // Combination: itchy scalp + buildup
  if ((scalp === "dandruff" || scalp === "itching") && washFreq === "monthly") {
    causes.push({
      cause: L("Cuir Chevelu en Détresse", "Scalp in Distress"),
      explanation: L(
        "Ton cuir chevelu est irrité et congestionné. Les démangeaisons et les pellicules signalent un déséquilibre. Un cuir chevelu sain est la fondation de cheveux forts — il faut commencer par là avec un reset du cuir chevelu.",
        "Your scalp is irritated and congested. The itching and flaking signal an imbalance. A healthy scalp is the foundation of strong hair — we need to start there with a scalp reset."
      ),
    });
  } else if (scalp === "dandruff" || scalp === "itching") {
    causes.push({
      cause: L("Déshydratation du Cuir Chevelu", "Scalp Dehydration"),
      explanation: L(
        "Un cuir chevelu sec et irrité ne peut pas nourrir correctement les nouvelles pousses. La santé de tes cheveux commence à la racine — ton cuir chevelu a besoin d'attention.",
        "A dry, irritated scalp can't properly nourish new growth. Your hair health starts at the root — your scalp needs attention."
      ),
    });
  }

  // Combination: heat usage often
  if (heat === "often") {
    causes.push({
      cause: L("Dommages Thermiques", "Heat Damage"),
      explanation: L(
        "L'utilisation fréquente de la chaleur détruit progressivement la barrière d'hydratation naturelle de tes cheveux. Les dégâts sont cumulatifs — chaque passage fragilise un peu plus la fibre. Même réduire à une fois par mois fera une différence visible.",
        "Frequent heat use progressively destroys your hair's natural moisture barrier. The damage is cumulative — each pass weakens the fiber a little more. Even reducing to once a month will make a visible difference."
      ),
    });
  }

  // Low porosity specific
  if (porosity === "low" && hydration === "none") {
    causes.push({
      cause: L("Incompatibilité de Porosité", "Porosity Mismatch"),
      explanation: L(
        "Tes cheveux à faible porosité résistent naturellement à l'absorption de l'eau. Sans la bonne technique (chaleur douce, produits légers), l'hydratation reste en surface sans jamais pénétrer.",
        "Your low-porosity hair naturally resists water absorption. Without the right technique (gentle heat, lightweight products), hydration sits on top without ever penetrating."
      ),
    });
  }

  if (causes.length === 0) {
    causes.push({
      cause: L("Superposition Inadéquate", "Improper Layering"),
      explanation: L(
        "Tes produits ne sont probablement pas appliqués dans le bon ordre. La règle d'or : eau → soin sans rinçage → crème → scellant. Changer cet ordre peut transformer ta rétention d'hydratation.",
        "Your products may not be applied in the right order. The golden rule: water → leave-in → cream → sealant. Changing this order can transform your moisture retention."
      ),
    });
  }

  // === ARCHETYPE ===
  const primaryCause = causes[0].cause;
  let archetype: DiagnosisResult["archetype"];

  const archetypes: Record<string, { fr: [string, string]; en: [string, string] }> = {
    moisture: {
      fr: ["La Protectrice d'Hydratation", "Tes cheveux sont constamment en quête d'eau mais n'arrivent pas à la retenir. Tu as besoin d'une stratégie de scellage adaptée à ta porosité. Avec la bonne approche, tes boucles retrouveront leur souplesse naturelle."],
      en: ["The Moisture-Seeking Protector", "Your hair is constantly reaching for water but can't hold onto it. You need a sealing strategy that matches your porosity. With the right approach, your curls will regain their natural bounce."],
    },
    buildup: {
      fr: ["La Récupératrice Surchargée", "Tu as donné trop d'amour à tes cheveux de la mauvaise façon. Des produits plus légers et un nettoyage clarifiant régulier vont transformer ta texture. Moins, c'est plus pour toi."],
      en: ["The Overlayered Recoverer", "You've been giving your hair too much love in the wrong way. Lighter products and regular clarifying will transform your texture. Less is more for you."],
    },
    protein: {
      fr: ["La Bâtisseuse en Douceur", "Tes cheveux ont soif de douceur et de souplesse. Un reset hydratant va ramener le rebond et l'élasticité que tu mérites."],
      en: ["The Gentle Growth Builder", "Your hair craves softness and flexibility. A moisture-focused reset will bring back the bounce and elasticity you deserve."],
    },
    friction: {
      fr: ["La Guérisseuse au Toucher Délicat", "Tes cheveux sont forts mais ont été manipulés trop brusquement. Des méthodes douces et de la patience révéleront leur vraie beauté."],
      en: ["The Tender-Touch Healer", "Your hair is strong but has been handled too roughly. Gentle methods and patience will reveal its true beauty."],
    },
    heat: {
      fr: ["La Résiliente en Reconstruction", "Tes cheveux ont traversé beaucoup mais ils sont prêts à se régénérer. Un soin doux et constant va restaurer leur pattern naturel et leur éclat."],
      en: ["The Resilient Rebuilder", "Your hair has been through a lot but it's ready to recover. Consistent gentle care will restore its natural pattern and shine."],
    },
    default: {
      fr: ["La Chercheuse d'Hydratation Légère", "Tes cheveux s'épanouissent dans la simplicité. Les bons produits légers dans le bon ordre vont débloquer des boucles douces et définies."],
      en: ["The Lightweight Hydration Seeker", "Your hair thrives on simplicity. The right lightweight products in the right order will unlock soft, defined curls."],
    },
  };

  const key = primaryCause.includes("Évaporation") || primaryCause.includes("Evaporation") || primaryCause.includes("Unsealed") || primaryCause.includes("Non Scellée") ? "moisture"
    : primaryCause.includes("Accumulation") || primaryCause.includes("Buildup") ? "buildup"
    : primaryCause.includes("Protéine") || primaryCause.includes("Protein") ? "protein"
    : primaryCause.includes("Friction") || primaryCause.includes("Tension") || primaryCause.includes("Démêlage") ? "friction"
    : primaryCause.includes("Thermique") || primaryCause.includes("Heat") ? "heat"
    : "default";

  const a = archetypes[key][lang];
  archetype = { name: a[0], description: a[1] };

  // === CONTRIBUTING FACTORS ===
  const factors: string[] = [];
  if (nightProt === "none") factors.push(L(
    "Aucune protection nocturne — le coton absorbe ton hydratation pendant que tu dors",
    "No nighttime protection — cotton absorbs your moisture while you sleep"
  ));
  if (hydration === "none") factors.push(L(
    "Pas d'hydratation en milieu de semaine — tes cheveux restent trop longtemps sans eau",
    "No mid-week hydration — your hair goes too long without moisture"
  ));
  if (washFreq === "monthly") factors.push(L(
    "Lavage trop espacé — l'accumulation de produits bloque l'absorption de l'hydratation",
    "Infrequent washing allows buildup to block moisture absorption"
  ));
  if (heat === "sometimes" || heat === "often") factors.push(L(
    "L'utilisation de chaleur fragilise ta barrière d'hydratation naturelle",
    "Heat usage weakens your hair's natural moisture barrier"
  ));
  if (protein === "never") factors.push(L(
    "L'absence totale de protéine peut laisser tes cheveux trop mous et sujets à l'étirement",
    "Skipping protein entirely may leave hair too soft and prone to stretching"
  ));
  if (scalp !== "normal") factors.push(L(
    "Les problèmes de cuir chevelu affectent la qualité des nouvelles pousses",
    "Scalp issues can affect new growth quality and overall hair health"
  ));
  while (factors.length < 3) {
    if (factors.length === 0) factors.push(L("Un léger déséquilibre dans la superposition des produits réduit la rétention d'hydratation", "Minor layering or product mismatch reducing moisture retention"));
    else if (factors.length === 1) factors.push(L("La régularité dans la routine est clé — un soin irrégulier amplifie la sécheresse", "Consistency in routine is key — irregular care compounds dryness"));
    else factors.push(L("Les facteurs environnementaux (climat, qualité de l'eau) peuvent nécessiter des ajustements", "Environmental factors (climate, water quality) may need addressing"));
  }

  // === BIGGEST MISTAKE (adaptive) ===
  let biggestMistake: string;
  if (detangling === "dry") {
    biggestMistake = L(
      "Démêler sur cheveux secs est ce qui cause le plus de dégâts. Ce seul changement — passer au démêlage sur cheveux mouillés et imprégnés d'après-shampoing — peut réduire ta casse de 70%. Tes cheveux te remercieront dès la première fois.",
      "Detangling on dry hair is causing the most damage. This single change — switching to wet detangling with conditioner — can reduce your breakage by up to 70%. Your hair will thank you from the very first time."
    );
  } else if (sealing === "none" && porosity === "high") {
    biggestMistake = L(
      "Ne pas sceller tes cheveux à haute porosité est ta plus grande faille. Toute l'hydratation que tu apportes s'évapore littéralement en quelques heures. Un bon scellant à base d'huile ou de beurre change absolument tout.",
      "Not sealing your high-porosity hair is your biggest gap. All the moisture you add literally evaporates within hours. A good oil or butter sealant changes absolutely everything."
    );
  } else if (protein === "often" && thickness === "fine") {
    biggestMistake = L(
      "Tu surcharges tes mèches fines en protéines. Elles deviennent raides et cassent facilement. Réduis la protéine à une fois par mois et concentre-toi sur des soins hydratants profonds.",
      "You're overloading fine strands with protein. They become stiff and snap easily. Cut protein to once a month and focus on deep moisture treatments."
    );
  } else if (nightProt === "none") {
    biggestMistake = L(
      "Dormir sur du coton sans protection assèche silencieusement tes cheveux chaque nuit. Un bonnet en satin seul peut transformer ta rétention d'hydratation. C'est le geste le plus simple et le plus impactant.",
      "Sleeping on cotton without protection is silently drying your hair every single night. A satin bonnet alone can dramatically improve moisture retention. It's the simplest yet most impactful change."
    );
  } else if (heat === "often") {
    biggestMistake = L(
      "L'utilisation fréquente de la chaleur est le premier coupable. Chaque passage retire un peu plus d'hydratation et fragilise tes mèches. Même réduire à une fois par mois montrera une amélioration visible.",
      "Frequent heat usage is the primary culprit. Each session strips more moisture and weakens your strands. Even reducing to once a month will show visible improvement."
    );
  } else if (hydration === "none" && sealing === "none") {
    biggestMistake = L(
      "Tes cheveux ne reçoivent aucun soin entre les lavages. C'est comme ne jamais hydrater sa peau — tout se dessèche. Un simple spray d'eau + soin sans rinçage en milieu de semaine transformerait ta texture.",
      "Your hair receives zero care between washes. It's like never moisturizing your skin — everything dries out. A simple water spray + leave-in mid-week would transform your texture."
    );
  } else {
    biggestMistake = L(
      "Tes produits sont probablement trop lourds pour ton type de cheveux. Ils créent un film qui donne l'impression d'hydratation mais qui bloque en réalité la vraie pénétration de l'eau dans la fibre.",
      "Your products are likely too heavy for your hair type, creating a coating that feels moisturized but actually blocks true hydration from penetrating the strand."
    );
  }

  // === SURPRISING INSIGHT ===
  let surprisingInsight: string;
  if (porosity === "high" && sealing === "none") {
    surprisingInsight = L(
      "Les cheveux à haute porosité peuvent perdre jusqu'à 80% de leur hydratation en seulement 4 heures sans scellant. C'est comme essayer de garder de l'eau dans un verre percé.",
      "High-porosity hair can lose up to 80% of its moisture in just 4 hours without a sealant. It's like trying to keep water in a glass with holes."
    );
  } else if (nightProt === "none") {
    surprisingInsight = L(
      "Une taie d'oreiller en coton peut absorber jusqu'à 30% de l'hydratation de tes cheveux en une seule nuit. En un mois, c'est comme si tu n'avais jamais hydraté.",
      "A cotton pillowcase can absorb up to 30% of your hair's moisture in a single night. Over a month, it's as if you never moisturized at all."
    );
  } else if (detangling === "dry") {
    surprisingInsight = L(
      "Démêler sur cheveux secs peut causer 5 fois plus de casse que sur cheveux mouillés et conditionnés. Chaque session endommage des centaines de mèches sans que tu le voies.",
      "Detangling on dry hair can cause 5 times more breakage than on wet, conditioned hair. Each session damages hundreds of strands without you even seeing it."
    );
  } else if (heat === "often") {
    surprisingInsight = L(
      "Un lisseur à 200°C peut faire bouillir l'eau à l'intérieur de ta fibre capillaire, créant des petites bulles de vapeur qui brisent la structure interne du cheveu. C'est irréversible à chaque passage.",
      "A flat iron at 400°F can boil the water inside your hair fiber, creating tiny steam bubbles that break the internal structure. It's irreversible with each pass."
    );
  } else {
    surprisingInsight = L(
      "Tes cheveux sont composés à 10-15% d'eau. Quand ce niveau descend en dessous de 8%, la sécheresse visible commence. La bonne nouvelle : avec la stratégie adaptée, tu peux rétablir l'équilibre en moins de 2 semaines.",
      "Your hair is made of 10-15% water. When this level drops below 8%, visible dryness begins. The good news: with the right strategy, you can restore balance in under 2 weeks."
    );
  }

  // === EMPOWERING SENTENCE ===
  let empoweringSentence: string;
  if (score > 65) {
    empoweringSentence = L(
      "Tes cheveux ne sont pas « difficiles ». Ils communiquent simplement un besoin que personne ne t'a appris à écouter. Maintenant tu sais — et c'est le début de tout.",
      "Your hair isn't 'difficult.' It's simply communicating a need that no one taught you to listen to. Now you know — and that's the beginning of everything."
    );
  } else if (score > 35) {
    empoweringSentence = L(
      "Tu es plus proche d'une routine qui fonctionne que tu ne le penses. Quelques ajustements stratégiques et tes cheveux vont te montrer de quoi ils sont capables.",
      "You're closer to a routine that works than you think. A few strategic adjustments and your hair will show you what it's truly capable of."
    );
  } else {
    empoweringSentence = L(
      "Tu fais déjà beaucoup de choses bien. Avec quelques optimisations ciblées, tu vas passer de 'ça va' à 'incroyable'.",
      "You're already doing a lot of things right. With a few targeted optimizations, you'll go from 'okay' to 'incredible.'"
    );
  }

  // === IMMEDIATE ACTION ===
  let immediateAction: string;
  if (detangling === "dry") {
    immediateAction = L(
      "Ce soir, applique un soin sans rinçage sur tes pointes et démêle doucement avec un peigne à dents larges. Sens la différence immédiatement.",
      "Tonight, apply a leave-in to your ends and gently detangle with a wide-tooth comb. Feel the difference immediately."
    );
  } else if (sealing === "none") {
    immediateAction = L(
      "Après ta prochaine hydratation, applique quelques gouttes d'huile de jojoba ou de beurre de karité sur tes pointes. Tu verras la différence dès demain matin.",
      "After your next moisturizing, apply a few drops of jojoba oil or shea butter to your ends. You'll see the difference by tomorrow morning."
    );
  } else if (nightProt === "none") {
    immediateAction = L(
      "Ce soir, enveloppe tes cheveux dans un foulard en satin ou utilise une taie en satin. Demain matin, touche tes cheveux — tu sentiras qu'ils ont gardé leur hydratation.",
      "Tonight, wrap your hair in a satin scarf or use a satin pillowcase. Tomorrow morning, touch your hair — you'll feel that it kept its moisture."
    );
  } else {
    immediateAction = L(
      "Aujourd'hui, vaporise un peu d'eau sur tes cheveux, applique un soin léger et scelle avec une huile. Observe comment tes boucles réagissent à ce simple geste.",
      "Today, spritz some water on your hair, apply a light leave-in and seal with an oil. Watch how your curls respond to this simple act."
    );
  }

  // === MASK RECOMMENDATION ===
  let maskRec: DiagnosisResult["maskRecommendation"];
  if (scalp === "buildup" || (thickness === "fine" && sealing === "both")) {
    maskRec = {
      type: L("Masque Purifiant à l'Argile", "Purifying Clay Mask"),
      description: L(
        "Un masque à l'argile de bentonite ou rhassoul pour éliminer l'accumulation, détoxifier le cuir chevelu et redonner à tes cheveux la capacité d'absorber l'hydratation. Tes boucles vont respirer à nouveau.",
        "A bentonite or rhassoul clay mask to remove buildup, detox the scalp, and restore your hair's ability to absorb moisture. Your curls will breathe again."
      ),
      frequency: L("Toutes les 2–3 semaines", "Every 2–3 weeks"),
      warning: L("N'abuse pas des masques à l'argile — ils peuvent dessécher. Applique toujours un soin profond après.", "Don't overdo clay masks — they can be drying. Always follow with a deep conditioner."),
    };
  } else if (protein === "often" || (thickness === "fine" && porosity === "high")) {
    maskRec = {
      type: L("Masque Hydratant Profond Sans Protéine", "Deep Moisture Mask (Protein-Free)"),
      description: L(
        "Un soin profond sans protéine, riche en humectants (miel, aloe) et émollients (karité, avocat) pour restaurer la souplesse et la douceur de tes mèches fatiguées.",
        "A protein-free deep conditioner packed with humectants (honey, aloe) and emollients (shea, avocado) to restore flexibility and softness to your tired strands."
      ),
      frequency: L("Chaque semaine pendant 4 semaines, puis toutes les 2 semaines", "Weekly for 4 weeks, then biweekly"),
      warning: L("Évite tout masque contenant protéine, kératine ou acides aminés de soie pendant ta phase de récupération.", "Avoid any mask with protein, keratin, or silk amino acids during your recovery phase."),
    };
  } else if (thickness === "coarse" || (porosity === "high" && hydration === "none")) {
    maskRec = {
      type: L("Masque Nourrissant au Beurre", "Nourishing Butter Mask"),
      description: L(
        "Un masque riche et crémeux au beurre de karité, beurre de mangue et huiles pour nourrir en profondeur et envelopper chaque mèche d'une hydratation durable.",
        "A rich, creamy mask with shea butter, mango butter, and oils to deeply nourish and coat each strand with lasting moisture."
      ),
      frequency: L("Chaque semaine", "Weekly"),
      warning: L("Utilise la chaleur (serviette chaude ou vapeur) pour une meilleure pénétration. Rince bien pour éviter les résidus.", "Use heat (warm towel or steam) for better penetration. Rinse thoroughly to avoid residue."),
    };
  } else {
    maskRec = {
      type: L("Masque Hydratant Léger", "Hydrating Moisture Mask"),
      description: L(
        "Un masque léger à base d'aloe vera, glycérine et humectants naturels pour booster le taux d'hydratation sans alourdir tes cheveux. Parfait pour ton type de cheveux.",
        "A lightweight hydrating mask with aloe vera, glycerin, and natural humectants to boost water content without weighing hair down. Perfect for your hair type."
      ),
      frequency: L("Chaque semaine pendant 3 semaines, puis toutes les 2 semaines", "Weekly for 3 weeks, then biweekly"),
      warning: L("Ne laisse pas poser plus longtemps que recommandé — les résultats diminuent après 30 minutes.", "Don't leave on longer than recommended — diminishing returns after 30 minutes."),
    };
  }

  // === MINIMUM ROUTINE ===
  const minRoutine: DiagnosisResult["minimumRoutine"] = [
    {
      step: 1,
      action: L("Nettoyage Doux", "Gentle Cleanse"),
      detail: porosity === "low"
        ? L("Utilise un shampoing doux sans sulfate avec de l'eau tiède pour ouvrir les cuticules", "Use a lightweight sulfate-free shampoo with warm water to open cuticles")
        : L("Utilise un shampoing hydratant sans sulfate ou un co-wash", "Use a moisturizing sulfate-free shampoo or co-wash"),
    },
    {
      step: 2,
      action: L("Soin Profond", "Deep Condition"),
      detail: L(`Applique ton ${maskRec.type.toLowerCase()} pendant 15–30 min sous une serviette chaude`, `Apply ${maskRec.type.toLowerCase()} for 15–30 min under a warm towel`),
    },
    {
      step: 3,
      action: L("Soin Sans Rinçage + Scellage", "Leave-in + Seal"),
      detail: sealing === "none"
        ? L("Applique un soin sans rinçage, puis scelle avec une huile légère (jojoba ou amande douce)", "Apply leave-in conditioner, then seal with a lightweight oil (jojoba or sweet almond)")
        : L("Applique un soin sans rinçage, puis scelle avec ta méthode préférée", "Apply leave-in conditioner, then seal with your preferred method"),
    },
  ];
  if (nightProt === "none") minRoutine.push({ step: 4, action: L("Protection Nocturne", "Night Protection"), detail: L("Dors avec un bonnet en satin ou sur une taie en satin — chaque nuit sans exception", "Sleep with a satin bonnet or on a satin pillowcase — every single night") });
  if (detangling === "dry") minRoutine.push({ step: minRoutine.length + 1, action: L("Démêlage Doux", "Gentle Detangle"), detail: L("Démêle uniquement sur cheveux mouillés et imprégnés d'après-shampoing, avec un peigne à dents larges, des pointes vers les racines", "Only detangle on wet, conditioned hair with a wide-tooth comb, working from ends to roots") });

  // === IDEAL ROUTINE ===
  const idealRoutine: DiagnosisResult["idealRoutine"] = [
    { step: 1, action: L("Pré-poo à l'Huile", "Pre-poo Oil Treatment"), detail: L("Applique de l'huile de coco ou d'olive 30 min avant le lavage pour protéger tes mèches", "Apply coconut or olive oil 30 min before washing to protect strands"), frequency: L("Chaque lavage", "Every wash day") },
    { step: 2, action: L("Lavage Clarifiant", "Clarifying Wash"), detail: L("Utilise un shampoing clarifiant pour éliminer l'accumulation et repartir de zéro", "Use a clarifying shampoo to remove buildup and reset"), frequency: L("Toutes les 3–4 semaines", "Every 3–4 weeks") },
    { step: 3, action: L("Nettoyage Doux", "Gentle Cleanse"), detail: L("Shampoing sans sulfate concentré sur le cuir chevelu, laisse la mousse couler sur les longueurs", "Sulfate-free shampoo on scalp, let suds run down lengths"), frequency: L("Hebdomadaire ou bimensuel", "Weekly or biweekly") },
    { step: 4, action: L("Soin Profond", "Deep Conditioning"), detail: L(`${maskRec.type} sous un bonnet plastique + serviette chaude pendant 20–30 min`, `${maskRec.type} under plastic cap + warm towel for 20–30 min`), frequency: maskRec.frequency },
    { step: 5, action: L("Méthode LOC/LCO", "LOC/LCO Method"), detail: porosity === "high" ? L("Liquide → Huile → Crème (LOC) pour enfermer l'hydratation dans les cheveux à haute porosité", "Liquid → Oil → Cream (LOC) to lock moisture into high-porosity hair") : L("Liquide → Crème → Huile (LCO) pour une meilleure absorption sur ton type de cheveux", "Liquid → Cream → Oil (LCO) for better absorption on your hair type"), frequency: L("Chaque lavage", "Every wash day") },
    { step: 6, action: L("Massage du Cuir Chevelu", "Scalp Massage"), detail: L("Massage de 2 minutes avec une huile légère pour booster la circulation et la croissance", "2-minute scalp massage with lightweight oil to boost circulation and growth"), frequency: L("3x par semaine", "3x per week") },
    { step: 7, action: L("Coiffure Protectrice", "Protective Styling"), detail: protStyle === "tightBuns" ? L("Coiffures à faible tension — vanilles lâches, ananas, ou perruques doublées satin. Évite les styles serrés sur les contours.", "Low-tension styles — loose twists, pineapple, or satin-lined wigs. Avoid tight styles on edges.") : L("Coiffures protectrices à faible tension selon ta préférence", "Low-tension protective styles based on your preference"), frequency: L("Selon besoin", "As needed") },
    { step: 8, action: L("Routine du Soir", "Night Routine"), detail: L("Rafraîchis avec un spray d'eau, applique une huile légère sur les pointes, bonnet en satin", "Refresh with water mist, apply light oil to ends, satin bonnet"), frequency: L("Chaque soir", "Nightly") },
  ];

  // Edge protection strategy if tight styles
  if (protStyle === "tightBuns") {
    idealRoutine.push({
      step: 9,
      action: L("Protection des Contours", "Edge Protection"),
      detail: L(
        "Applique du beurre de ricin sur tes contours chaque soir. Masse doucement en cercles. Évite toute traction sur cette zone fragile. Tes edges repousseront avec de la patience.",
        "Apply castor butter to your edges every evening. Massage gently in circles. Avoid any tension on this fragile area. Your edges will grow back with patience."
      ),
      frequency: L("Chaque soir", "Every evening"),
    });
  }

  // === 7-DAY RECOVERY PLAN ===
  const rp = (fr: string, en: string) => L(fr, en);
  const recoveryPlan: DiagnosisResult["recoveryPlan"] = [
    { day: L("Jour 1", "Day 1"), action: scalp === "buildup" ? rp("Lavage clarifiant + soin profond sous serviette chaude 30 min. Démêle doucement sur cheveux mouillés. Ton cuir chevelu va enfin respirer.", "Clarifying wash + deep condition with warm towel for 30 min. Detangle gently on wet hair. Your scalp will finally breathe.") : rp("Co-wash doux + masque hydratant 30 min sous serviette chaude. Démêle avec tendresse. Tes boucles vont déjà se sentir différentes.", "Gentle co-wash + moisture mask for 30 min under warm towel. Detangle with tenderness. Your curls will already feel different.") },
    { day: L("Jour 2", "Day 2"), action: rp("Rafraîchis avec un spray d'eau + soin sans rinçage. Scelle avec une huile légère. Porte une coiffure libre et douce.", "Refresh with water mist + leave-in. Seal with lightweight oil. Wear a free, gentle style.") },
    { day: L("Jour 3", "Day 3"), action: rp("Massage du cuir chevelu avec de l'huile de jojoba (2 min). Léger spray rafraîchissant si nécessaire. Bonnet en satin pour la nuit.", "Scalp massage with jojoba oil (2 min). Light refresh spray if needed. Satin bonnet for the night.") },
    { day: L("Jour 4", "Day 4"), action: rp("Vérification mi-semaine : si tes cheveux semblent secs, applique du soin sur les pointes. Évite de toucher et manipuler inutilement.", "Mid-week check: if hair feels dry, apply leave-in to ends. Avoid unnecessary touching and manipulation.") },
    { day: L("Jour 5", "Day 5"), action: rp("Rafraîchis doucement avec un spray d'eau. Re-tresse ou re-coiffe sans chaleur. Hydrate tes contours.", "Gentle refresh with water mist. Re-twist or re-style without heat. Moisturize your edges.") },
    { day: L("Jour 6", "Day 6"), action: rp("Pré-poo : applique l'huile de ton choix 1h avant le lavage de demain. Démêle aux doigts avec douceur.", "Pre-poo: apply oil of choice 1h before tomorrow's wash. Gentle finger detangle.") },
    { day: L("Jour 7", "Day 7"), action: rp("Jour de lavage : répète la routine du Jour 1. Observe comment tes cheveux réagissent déjà différemment. C'est le début. 🌱", "Wash day: repeat Day 1 routine. Notice how your hair responds differently already. This is the beginning. 🌱") },
  ];

  // === INGREDIENTS ===
  const avoid: DiagnosisResult["ingredientsAvoid"] = [];
  const seek: DiagnosisResult["ingredientsSeek"] = [];

  avoid.push({ name: L("Sulfates (SLS/SLES)", "Sulfates (SLS/SLES)"), reason: L("Éliminent les huiles naturelles et accélèrent la sécheresse", "Strip natural oils and accelerate dryness") });
  if (scalp === "buildup" || thickness === "fine") avoid.push({ name: L("Silicones lourds (diméthicone)", "Heavy silicones (dimethicone)"), reason: L("Créent une accumulation qui bloque l'absorption de l'hydratation", "Create buildup that blocks moisture absorption") });
  avoid.push({ name: L("Alcools desséchants (alcohol denat, isopropyl)", "Drying alcohols (alcohol denat, isopropyl)"), reason: L("Évaporent l'hydratation de la fibre capillaire", "Evaporate moisture from the hair shaft") });
  if (protein === "often") avoid.push({ name: L("Protéine hydrolysée / kératine", "Hydrolyzed protein / keratin"), reason: L("Tes cheveux sont en surcharge protéique — évite pendant 4–6 semaines", "Your hair is protein-overloaded — avoid for 4–6 weeks") });
  if (thickness === "fine") avoid.push({ name: L("Cires lourdes et vaseline", "Heavy waxes & petroleum"), reason: L("Trop lourds pour les mèches fines, alourdissent les cheveux", "Too heavy for fine strands, causes limp, weighed-down hair") });

  seek.push({ name: L("Glycérine", "Glycerin"), reason: L("Humectant puissant qui attire l'eau dans la fibre capillaire", "Powerful humectant that draws water into the hair shaft") });
  seek.push({ name: L("Aloe vera", "Aloe vera"), reason: L("Hydratant naturel aux propriétés apaisantes et équilibrantes", "Natural moisturizer with soothing and pH-balancing properties") });
  seek.push({ name: L("Beurre de karité", "Shea butter"), reason: L("Émollient riche qui scelle l'hydratation et ajoute de la douceur", "Rich emollient that seals moisture and adds softness") });
  if (porosity === "high") seek.push({ name: L("Huile de ricin", "Castor oil"), reason: L("Scellant lourd parfait pour les cheveux à haute porosité", "Heavy sealant perfect for high-porosity hair") });
  else seek.push({ name: L("Huile de jojoba", "Jojoba oil"), reason: L("Huile légère qui imite le sébum naturel — n'alourdit pas", "Lightweight oil that mimics natural sebum — won't weigh down") });
  seek.push({ name: L("Miel", "Honey"), reason: L("Humectant et émollient naturel — adoucit et attire l'hydratation", "Natural humectant and emollient — softens and draws in moisture") });

  // === TIMELINE ===
  const timeline: DiagnosisResult["timeline"] = [
    { period: L("Jours 1–3", "Days 1–3"), expectation: L("Cheveux plus doux au toucher. Moins de nœuds au coiffage. Cuir chevelu plus frais et apaisé.", "Hair feels softer to touch. Less tangling during styling. Scalp feels cleaner and calmer.") },
    { period: L("Semaine 2", "Week 2"), expectation: L("Rétention d'hydratation visible entre les lavages. Moins de casse au démêlage. Les boucles commencent à mieux se former.", "Noticeable moisture retention between washes. Less breakage during detangling. Curls start clumping better.") },
    { period: L("Semaine 4", "Week 4"), expectation: L("Amélioration significative de la douceur, de la brillance et de la définition. Moins de frisottis. Les coiffures tiennent plus longtemps. Tu vas sentir la différence.", "Significant improvement in softness, shine, and definition. Reduced frizz. Styles hold longer. You'll feel the difference.") },
  ];

  // === LONG-TERM STRATEGY ===
  let longTermStrategy: string;
  if (thickness === "fine") {
    longTermStrategy = L(
      "Privilégie les produits légers à base d'eau. Clarifie mensuellement. Protéine toutes les 6–8 semaines uniquement. Priorité à la manipulation douce et aux coiffures sans tension. Au fur et à mesure que tes cheveux se renforcent, tu pourras expérimenter avec des produits un peu plus riches.",
      "Focus on lightweight, water-based products. Clarify monthly. Protein every 6–8 weeks only. Prioritize gentle handling and low-tension styles. As your hair strengthens, you can experiment with slightly richer products."
    );
  } else if (porosity === "high") {
    longTermStrategy = L(
      "Construis une routine de scellage consistante. Soin profond chaque semaine. Introduis progressivement la protéine toutes les 4–6 semaines pour renforcer. Considère la méthode « effet de serre » (baggy method) pour des sessions d'hydratation intense.",
      "Build a consistent sealing routine. Deep condition weekly. Gradually introduce protein every 4–6 weeks to strengthen. Consider the greenhouse effect (baggy method) for intense hydration sessions."
    );
  } else {
    longTermStrategy = L(
      "Maintiens un rythme de lavage régulier. Alterne entre hydratation et légère protéine chaque mois. Garde les produits légers et à base d'eau. La santé du cuir chevelu est ta fondation — masse et huile régulièrement.",
      "Maintain a regular wash schedule. Alternate between moisture and light protein monthly. Keep products lightweight and water-based. Scalp health is your foundation — massage and oil regularly."
    );
  }

  // === CONFIDENCE MESSAGE ===
  const confidenceMessage = L(
    "Tes cheveux naturels sont magnifiques, résilients et uniques. La sécheresse n'est pas un défaut — c'est un signal. Maintenant que tu comprends ce que tes cheveux te demandent, tu as le pouvoir de leur donner exactement ce qu'il faut. Chaque boucle, chaque spirale, chaque coil mérite ce soin. Tu gères. 👑",
    "Your natural hair is beautiful, resilient, and uniquely yours. Dryness is not a flaw — it's a signal. Now that you understand what your hair is asking for, you have the power to give it exactly what it needs. Every coil, every kink, every curl is worth the care. You've got this. 👑"
  );

  // === COACH NOTE ===
  const coachNote = score > 50
    ? L(
      `Je vois exactement ce qui se passe avec tes cheveux. ${causes[0].cause} est le principal coupable, mais la bonne nouvelle ? C'est complètement réversible.\n\nCommence par le plan de 7 jours, sois patiente avec toi-même, et regarde la transformation se dérouler. Tes cheveux ont déjà tout ce qu'il faut pour s'épanouir — on enlève simplement les obstacles.\n\nTes cheveux ne sont pas difficiles. Ils répondent simplement mieux à la constance et à l'équilibre hydratation-protéine. Avec la bonne stratégie, tu verras des progrès. 💛`,
      `I can see exactly what's happening with your hair. ${causes[0].cause} is the main culprit, but the good news? It's completely reversible.\n\nStart with the 7-day plan, be patient with yourself, and watch the transformation unfold. Your hair already has everything it needs to thrive — we're just removing the obstacles.\n\nYour hair isn't difficult. It simply responds best to consistency and moisture-protein balance. With the right strategy, you will see progress. 💛`
    )
    : L(
      `Ton parcours capillaire est unique, et ta voie aussi. Ne compare pas ton chemin à celui des autres. Le fait que tu sois ici, en quête de réponses, montre que tu es prête pour le changement.\n\nFais confiance au processus, sois constante, et rappelle-toi : des cheveux sains sont un marathon, pas un sprint. Je crois en tes cheveux.\n\nTes cheveux ne sont pas difficiles. Ils répondent simplement mieux à la constance et à l'équilibre. Avec la bonne stratégie, tu verras des progrès. 💛`,
      `Your hair story is unique, and so is your path forward. Don't compare your journey to anyone else's. The fact that you're here, seeking answers, shows you're ready for change.\n\nTrust the process, be consistent, and remember: healthy hair is a marathon, not a sprint. I believe in your hair.\n\nYour hair isn't difficult. It simply responds best to consistency and balance. With the right strategy, you will see progress. 💛`
    );

  return {
    archetype,
    severityScore: score,
    severityLabel,
    primaryCauses: causes.slice(0, 2),
    contributingFactors: factors.slice(0, 3),
    biggestMistake,
    surprisingInsight,
    empoweringSentence,
    immediateAction,
    maskRecommendation: maskRec,
    minimumRoutine: minRoutine,
    idealRoutine,
    recoveryPlan,
    ingredientsAvoid: avoid,
    ingredientsSeek: seek,
    timeline,
    longTermStrategy,
    confidenceMessage,
    coachNote,
  };
}
