import { serve } from "https://deno.land/std@0.190.0/http/server.ts";


const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // --- Input validation ---
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { email, results, lang } = body as { email?: string; results?: unknown; lang?: string };

    if (!email || typeof email !== "string" || email.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ error: "Invalid email" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!results || typeof results !== "object") {
      return new Response(JSON.stringify({ error: "Missing or invalid results" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate results structure to prevent malformed payloads
    const r_check = results as Record<string, unknown>;
    const requiredStringFields = ["surprisingInsight", "biggestMistake", "empoweringSentence", "immediateAction", "longTermStrategy", "confidenceMessage", "coachNote"];
    const requiredObjectFields = ["archetype", "maskRecommendation"];
    const requiredArrayFields = ["primaryCauses", "contributingFactors", "minimumRoutine", "idealRoutine", "recoveryPlan", "ingredientsAvoid", "ingredientsSeek", "timeline"];

    for (const f of requiredStringFields) {
      if (typeof r_check[f] !== "string") {
        return new Response(JSON.stringify({ error: `Invalid results: missing ${f}` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }
    for (const f of requiredObjectFields) {
      if (!r_check[f] || typeof r_check[f] !== "object" || Array.isArray(r_check[f])) {
        return new Response(JSON.stringify({ error: `Invalid results: missing ${f}` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }
    for (const f of requiredArrayFields) {
      if (!Array.isArray(r_check[f])) {
        return new Response(JSON.stringify({ error: `Invalid results: missing ${f}` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }
    if (typeof r_check.severityScore !== "number" || r_check.severityScore < 0 || r_check.severityScore > 100) {
      return new Response(JSON.stringify({ error: "Invalid results: invalid severityScore" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!["Low", "Moderate", "Severe"].includes(r_check.severityLabel as string)) {
      return new Response(JSON.stringify({ error: "Invalid results: invalid severityLabel" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (lang && !["en", "fr"].includes(lang)) {
      return new Response(JSON.stringify({ error: "Invalid language" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Limit payload size (~100KB max)
    const payloadStr = JSON.stringify(results);
    if (payloadStr.length > 100_000) {
      return new Response(JSON.stringify({ error: "Payload too large" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const isFr = lang === "fr";
    const r = results as Record<string, any>;

    // --- Build HTML email (same as before) ---
    const severityLabel = r.severityLabel === "Low" ? (isFr ? "Faible" : "Low") :
      r.severityLabel === "Moderate" ? (isFr ? "Modéré" : "Moderate") : (isFr ? "Sévère" : "Severe");

    const html = buildEmailHtml(r, isFr, severityLabel);

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "SchicGirl <noreply@decodehair.schicgirl.me>",
        to: [email],
        subject: isFr ? "🌿 Ton Diagnostic Capillaire Complet — SchicGirl" : "🌿 Your Complete Hair Diagnosis — SchicGirl",
        html,
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error("Resend error:", errBody);
      throw new Error(`Resend API error: ${res.status}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Email send failed:", error);
    return new Response(JSON.stringify({ error: "Failed to send email" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function escapeHtml(str: unknown): string {
  if (str === null || str === undefined) return "";
  const s = String(str);
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function buildEmailHtml(r: Record<string, any>, isFr: boolean, severityLabel: string): string {
  const e = escapeHtml;
  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #faf8f5; margin: 0; padding: 0; color: #2d2319; }
  .container { max-width: 600px; margin: 0 auto; padding: 24px 16px; }
  .header { text-align: center; padding: 32px 0 24px; }
  .header h1 { font-size: 24px; color: #2d2319; margin: 0 0 4px; }
  .header p { color: #8a7a6d; font-size: 14px; margin: 0; }
  .badge { display: inline-block; background: linear-gradient(135deg, #c9a96e, #b8944a); color: white; padding: 4px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-bottom: 16px; }
  .card { background: white; border-radius: 16px; padding: 24px; margin-bottom: 16px; border: 1px solid #e8e0d8; }
  .card h3 { font-size: 16px; font-weight: 700; margin: 0 0 12px; color: #2d2319; }
  .severity-score { font-size: 48px; font-weight: 800; margin: 0; }
  .severity-low { color: #16a34a; }
  .severity-moderate { color: #b8944a; }
  .severity-severe { color: #dc2626; }
  .highlight-box { background: #fef7ec; border: 1px solid #f0dbb8; border-radius: 12px; padding: 16px; margin-bottom: 16px; }
  .warning-box { background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 16px; margin-bottom: 16px; }
  .step { display: flex; gap: 12px; margin-bottom: 12px; }
  .step-num { background: linear-gradient(135deg, #c9a96e, #b8944a); color: white; width: 28px; height: 28px; border-radius: 50%; text-align: center; line-height: 28px; font-size: 12px; font-weight: 700; flex-shrink: 0; }
  .ingredient-good { color: #16a34a; }
  .ingredient-bad { color: #dc2626; }
  .timeline-item { border-left: 3px solid #c9a96e; padding-left: 16px; margin-bottom: 12px; }
  .footer { text-align: center; padding: 24px 0; color: #8a7a6d; font-size: 12px; }
  .cta-btn { display: inline-block; background: linear-gradient(135deg, #c9a96e, #b8944a); color: white; padding: 14px 32px; border-radius: 30px; text-decoration: none; font-weight: 600; font-size: 14px; }
  ul { padding-left: 16px; }
  li { margin-bottom: 6px; font-size: 14px; color: #4a3f35; }
  p { font-size: 14px; line-height: 1.6; color: #4a3f35; }
  .day-badge { display: inline-block; background: #fef7ec; color: #b8944a; font-weight: 700; padding: 4px 10px; border-radius: 8px; font-size: 12px; margin-bottom: 4px; }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <span class="badge">✨ ${isFr ? "Diagnostic Complet" : "Full Diagnosis"}</span>
    <h1>${isFr ? "Ton Analyse Capillaire" : "Your Hair Analysis"}</h1>
    <p>${isFr ? "Résultats personnalisés par SchicGirl" : "Personalized results by SchicGirl"}</p>
  </div>

  <div class="card">
    <h3>⭐ ${isFr ? "Ton Identité Capillaire" : "Your Hair Identity"}</h3>
    <div class="highlight-box">
      <strong style="font-size:18px;color:#b8944a;">${e(r.archetype?.name)}</strong>
      <p style="margin:8px 0 0;">${e(r.archetype?.description)}</p>
    </div>
  </div>

  <div class="card">
    <h3>⚠️ ${isFr ? "Sévérité de la Sécheresse" : "Dryness Severity"}</h3>
    <p class="severity-score severity-${e(r.severityLabel?.toLowerCase())}">${e(r.severityScore)}<span style="font-size:16px;color:#8a7a6d;font-weight:400;">/100 — ${e(severityLabel)}</span></p>
  </div>

  <div class="highlight-box">
    <strong>${isFr ? "💡 Le savais-tu ?" : "💡 Did you know?"}</strong>
    <p style="margin:8px 0 0;">${e(r.surprisingInsight)}</p>
  </div>

  <div class="card">
    <h3>💡 ${isFr ? "Causes Profondes" : "Root Causes"}</h3>
    ${Array.isArray(r.primaryCauses) ? r.primaryCauses.map((c: any) => `<div style="margin-bottom:12px;"><strong>${e(c.cause)}</strong><p style="margin:4px 0 0;">${e(c.explanation)}</p></div>`).join("") : ""}
  </div>

  <div class="card">
    <h3>🔬 ${isFr ? "Facteurs Contributifs" : "Contributing Factors"}</h3>
    <ul>${Array.isArray(r.contributingFactors) ? r.contributingFactors.map((f: string) => `<li>${e(f)}</li>`).join("") : ""}</ul>
  </div>

  <div class="warning-box">
    <strong>⚠️ ${isFr ? "Plus Grande Erreur Détectée" : "Biggest Mistake Detected"}</strong>
    <p style="margin:8px 0 0;">${e(r.biggestMistake)}</p>
  </div>

  <div class="highlight-box">
    <strong>${isFr ? "✨ Rappelle-toi" : "✨ Remember"}</strong>
    <p style="margin:8px 0 0;font-style:italic;">${e(r.empoweringSentence)}</p>
    <hr style="border:none;border-top:1px solid #e8e0d8;margin:12px 0;">
    <strong style="color:#b8944a;">${isFr ? "🎯 Action immédiate" : "🎯 Immediate action"}</strong>
    <p style="margin:8px 0 0;">${e(r.immediateAction)}</p>
  </div>

  <div class="card">
    <h3>💧 ${isFr ? "Masque Recommandé" : "Smart Mask Recommendation"}</h3>
    <strong style="font-size:16px;">${e(r.maskRecommendation?.type)}</strong>
    <p>${e(r.maskRecommendation?.description)}</p>
    <p style="color:#b8944a;font-weight:600;">📅 ${e(r.maskRecommendation?.frequency)}</p>
    <p style="font-size:12px;color:#8a7a6d;background:#f5f0eb;padding:10px;border-radius:8px;">⚠️ ${e(r.maskRecommendation?.warning)}</p>
  </div>

  <div class="card">
    <h3>✅ ${isFr ? "Routine Minimum" : "Minimum Routine"}</h3>
    <p style="font-size:12px;color:#8a7a6d;margin-bottom:12px;">${isFr ? "L'essentiel — simple et efficace" : "The essentials — simple and effective"}</p>
    ${Array.isArray(r.minimumRoutine) ? r.minimumRoutine.map((s: any) => `<div class="step"><div class="step-num">${e(s.step)}</div><div><strong>${e(s.action)}</strong><br><span style="font-size:12px;color:#8a7a6d;">${e(s.detail)}</span></div></div>`).join("") : ""}
  </div>

  <div class="card">
    <h3>✨ ${isFr ? "Routine Idéale" : "Ideal Routine"}</h3>
    ${Array.isArray(r.idealRoutine) ? r.idealRoutine.map((s: any) => `<div class="step"><div class="step-num">${e(s.step)}</div><div><strong>${e(s.action)}</strong><br><span class="day-badge">${e(s.frequency)}</span><br><span style="font-size:12px;color:#8a7a6d;">${e(s.detail)}</span></div></div>`).join("") : ""}
  </div>

  <div class="card">
    <h3>📅 ${isFr ? "Plan de Récupération 7 Jours" : "7-Day Recovery Plan"}</h3>
    ${Array.isArray(r.recoveryPlan) ? r.recoveryPlan.map((d: any) => `<div class="timeline-item"><span class="day-badge">${e(d.day)}</span><p style="margin:4px 0 0;">${e(d.action)}</p></div>`).join("") : ""}
  </div>

  <div class="card">
    <h3>❌ ${isFr ? "Ingrédients à Éviter" : "Ingredients to Avoid"}</h3>
    ${Array.isArray(r.ingredientsAvoid) ? r.ingredientsAvoid.map((i: any) => `<div style="margin-bottom:8px;"><strong class="ingredient-bad">✗ ${e(i.name)}</strong><br><span style="font-size:12px;color:#8a7a6d;">${e(i.reason)}</span></div>`).join("") : ""}
  </div>

  <div class="card">
    <h3>🌿 ${isFr ? "Ingrédients à Rechercher" : "Ingredients to Look For"}</h3>
    ${Array.isArray(r.ingredientsSeek) ? r.ingredientsSeek.map((i: any) => `<div style="margin-bottom:8px;"><strong class="ingredient-good">✓ ${e(i.name)}</strong><br><span style="font-size:12px;color:#8a7a6d;">${e(i.reason)}</span></div>`).join("") : ""}
  </div>

  <div class="card">
    <h3>🔄 ${isFr ? "Calendrier d'Amélioration" : "Improvement Timeline"}</h3>
    ${Array.isArray(r.timeline) ? r.timeline.map((tl: any) => `<div class="timeline-item"><strong style="color:#b8944a;">${e(tl.period)}</strong><p style="margin:4px 0 0;">${e(tl.expectation)}</p></div>`).join("") : ""}
  </div>

  <div class="card">
    <h3>🛡️ ${isFr ? "Stratégie Long Terme" : "Long-Term Strategy"}</h3>
    <p>${e(r.longTermStrategy)}</p>
  </div>

  <div class="highlight-box" style="text-align:center;">
    <p style="font-size:16px;">❤️</p>
    <p>${e(r.confidenceMessage)}</p>
  </div>

  <div class="card">
    <h3>✂️ ${isFr ? "Un Message de Ta Coach Capillaire" : "A Message From Your Hair Coach"}</h3>
    <p style="white-space:pre-line;">${e(r.coachNote)}</p>
  </div>

  <div style="text-align:center;padding:24px 0;">
    <p style="font-weight:600;font-size:16px;margin-bottom:8px;">${isFr ? "Prête pour l'étape suivante ?" : "Ready for the Next Level?"}</p>
    <p style="font-size:13px;color:#8a7a6d;margin-bottom:16px;">${isFr ? "Je crée des routines complètes et personnalisées adaptées à ton profil." : "I create complete, personalized routines tailored to your profile."}</p>
    <a href="https://www.facebook.com/schicgirl" class="cta-btn">${isFr ? "Me Contacter" : "Contact Me"}</a>
  </div>

  <div class="footer">
    <p>© ${new Date().getFullYear()} SchicGirl — Decode My Hair</p>
  </div>
</div>
</body>
</html>`;
}
