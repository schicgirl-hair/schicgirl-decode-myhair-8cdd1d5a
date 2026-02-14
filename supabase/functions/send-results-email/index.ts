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
  const sevColor = r.severityLabel === "Low" ? "#16a34a" : r.severityLabel === "Moderate" ? "#b8944a" : "#dc2626";

  const card = (emoji: string, title: string, content: string) =>
    `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:16px;"><tr><td style="background:#ffffff;border-radius:16px;padding:24px;border:1px solid #e8e0d8;">
      <p style="font-size:16px;font-weight:700;margin:0 0 12px;color:#2d2319;">${emoji} ${title}</p>${content}
    </td></tr></table>`;

  const highlight = (content: string) =>
    `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:16px;"><tr><td style="background:#fef7ec;border:1px solid #f0dbb8;border-radius:12px;padding:16px;">
      ${content}
    </td></tr></table>`;

  const warning = (content: string) =>
    `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:16px;"><tr><td style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:16px;">
      ${content}
    </td></tr></table>`;

  const stepRow = (num: string, text: string, sub: string, extra = "") =>
    `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:10px;"><tr>
      <td width="32" valign="top" style="padding-right:12px;"><div style="background:linear-gradient(135deg,#c9a96e,#b8944a);color:#fff;width:28px;height:28px;border-radius:50%;text-align:center;line-height:28px;font-size:12px;font-weight:700;">${e(num)}</div></td>
      <td valign="top"><p style="margin:0;font-size:14px;font-weight:700;color:#2d2319;">${e(text)}</p>${extra}<p style="margin:4px 0 0;font-size:12px;color:#8a7a6d;">${e(sub)}</p></td>
    </tr></table>`;

  // Build sections
  const causesHtml = Array.isArray(r.primaryCauses) ? r.primaryCauses.map((c: any) =>
    `<p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#2d2319;">${e(c.cause)}</p><p style="margin:0 0 14px;font-size:14px;line-height:1.6;color:#4a3f35;">${e(c.explanation)}</p>`
  ).join("") : "";

  const factorsHtml = Array.isArray(r.contributingFactors) ? `<ul style="padding-left:16px;margin:0;">${r.contributingFactors.map((f: string) =>
    `<li style="margin-bottom:6px;font-size:14px;color:#4a3f35;">${e(f)}</li>`
  ).join("")}</ul>` : "";

  const minRoutineHtml = Array.isArray(r.minimumRoutine) ? r.minimumRoutine.map((s: any) =>
    stepRow(String(s.step), s.action, s.detail)
  ).join("") : "";

  const idealRoutineHtml = Array.isArray(r.idealRoutine) ? r.idealRoutine.map((s: any) =>
    stepRow(String(s.step), s.action, s.detail, `<p style="margin:4px 0;font-size:11px;font-weight:700;color:#b8944a;background:#fef7ec;display:inline-block;padding:2px 8px;border-radius:10px;">${e(s.frequency)}</p>`)
  ).join("") : "";

  const recoveryHtml = Array.isArray(r.recoveryPlan) ? r.recoveryPlan.map((d: any) =>
    `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:10px;"><tr>
      <td width="70" valign="top"><span style="display:inline-block;background:#fef7ec;color:#b8944a;font-weight:700;padding:4px 10px;border-radius:8px;font-size:12px;">${e(d.day)}</span></td>
      <td valign="top"><p style="margin:0;font-size:14px;line-height:1.6;color:#4a3f35;">${e(d.action)}</p></td>
    </tr></table>`
  ).join("") : "";

  const avoidHtml = Array.isArray(r.ingredientsAvoid) ? r.ingredientsAvoid.map((i: any) =>
    `<p style="margin:0 0 8px;font-size:14px;"><span style="color:#dc2626;font-weight:700;">✗ ${e(i.name)}</span><br><span style="font-size:12px;color:#8a7a6d;">${e(i.reason)}</span></p>`
  ).join("") : "";

  const seekHtml = Array.isArray(r.ingredientsSeek) ? r.ingredientsSeek.map((i: any) =>
    `<p style="margin:0 0 8px;font-size:14px;"><span style="color:#16a34a;font-weight:700;">✓ ${e(i.name)}</span><br><span style="font-size:12px;color:#8a7a6d;">${e(i.reason)}</span></p>`
  ).join("") : "";

  const timelineHtml = Array.isArray(r.timeline) ? r.timeline.map((tl: any) =>
    `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:12px;"><tr>
      <td style="border-left:3px solid #c9a96e;padding-left:16px;"><p style="margin:0;font-size:14px;font-weight:700;color:#b8944a;">${e(tl.period)}</p><p style="margin:4px 0 0;font-size:14px;color:#4a3f35;">${e(tl.expectation)}</p></td>
    </tr></table>`
  ).join("") : "";

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background:#faf8f5;margin:0;padding:0;color:#2d2319;">
<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="padding:24px 16px;">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;">

  <!-- Header -->
  <tr><td align="center" style="padding:32px 0 24px;">
    <span style="display:inline-block;background:linear-gradient(135deg,#c9a96e,#b8944a);color:#fff;padding:4px 14px;border-radius:20px;font-size:12px;font-weight:600;">✨ ${isFr ? "Diagnostic Complet" : "Full Diagnosis"}</span>
    <h1 style="font-size:24px;color:#2d2319;margin:12px 0 4px;">${isFr ? "Ton Analyse Capillaire" : "Your Hair Analysis"}</h1>
    <p style="color:#8a7a6d;font-size:14px;margin:0;">${isFr ? "Résultats personnalisés par SchicGirl" : "Personalized results by SchicGirl"}</p>
  </td></tr>

  <!-- Archetype -->
  <tr><td>${card("⭐", isFr ? "Ton Identité Capillaire" : "Your Hair Identity",
    `<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="background:#fef7ec;border:1px solid #f0dbb8;border-radius:12px;padding:16px;">
      <p style="font-size:18px;font-weight:700;color:#b8944a;margin:0 0 8px;">${e(r.archetype?.name)}</p>
      <p style="margin:0;font-size:14px;line-height:1.6;color:#4a3f35;">${e(r.archetype?.description)}</p>
    </td></tr></table>`)}</td></tr>

  <!-- Severity -->
  <tr><td>${card("⚠️", isFr ? "Sévérité de la Sécheresse" : "Dryness Severity",
    `<p style="font-size:48px;font-weight:800;margin:0;color:${sevColor};">${e(r.severityScore)}<span style="font-size:16px;color:#8a7a6d;font-weight:400;">/100 — ${e(severityLabel)}</span></p>`)}</td></tr>

  <!-- Surprising Insight -->
  <tr><td>${highlight(`<p style="font-size:14px;font-weight:700;margin:0 0 8px;color:#2d2319;">💡 ${isFr ? "Le savais-tu ?" : "Did you know?"}</p><p style="margin:0;font-size:14px;line-height:1.6;color:#4a3f35;">${e(r.surprisingInsight)}</p>`)}</td></tr>

  <!-- Root Causes -->
  <tr><td>${card("💡", isFr ? "Causes Profondes" : "Root Causes", causesHtml)}</td></tr>

  <!-- Contributing Factors -->
  <tr><td>${card("🔬", isFr ? "Facteurs Contributifs" : "Contributing Factors", factorsHtml)}</td></tr>

  <!-- Biggest Mistake -->
  <tr><td>${warning(`<p style="font-size:14px;font-weight:700;margin:0 0 8px;color:#2d2319;">⚠️ ${isFr ? "Plus Grande Erreur Détectée" : "Biggest Mistake Detected"}</p><p style="margin:0;font-size:14px;line-height:1.6;color:#4a3f35;">${e(r.biggestMistake)}</p>`)}</td></tr>

  <!-- Empowering + Immediate Action -->
  <tr><td>${highlight(`<p style="font-size:14px;font-weight:700;margin:0 0 8px;color:#2d2319;">✨ ${isFr ? "Rappelle-toi" : "Remember"}</p><p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:#4a3f35;font-style:italic;">${e(r.empoweringSentence)}</p><hr style="border:none;border-top:1px solid #e8e0d8;margin:12px 0;"><p style="font-size:14px;font-weight:700;margin:0 0 8px;color:#b8944a;">🎯 ${isFr ? "Action immédiate" : "Immediate action"}</p><p style="margin:0;font-size:14px;line-height:1.6;color:#4a3f35;">${e(r.immediateAction)}</p>`)}</td></tr>

  <!-- Mask Recommendation -->
  <tr><td>${card("💧", isFr ? "Masque Recommandé" : "Smart Mask Recommendation",
    `<p style="font-size:16px;font-weight:700;margin:0 0 8px;color:#2d2319;">${e(r.maskRecommendation?.type)}</p>
     <p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:#4a3f35;">${e(r.maskRecommendation?.description)}</p>
     <p style="margin:0 0 8px;font-size:14px;color:#b8944a;font-weight:600;">📅 ${e(r.maskRecommendation?.frequency)}</p>
     <p style="margin:0;font-size:12px;color:#8a7a6d;background:#f5f0eb;padding:10px;border-radius:8px;">⚠️ ${e(r.maskRecommendation?.warning)}</p>`)}</td></tr>

  <!-- Minimum Routine -->
  <tr><td>${card("✅", isFr ? "Routine Minimum" : "Minimum Routine",
    `<p style="font-size:12px;color:#8a7a6d;margin:0 0 12px;">${isFr ? "L'essentiel — simple et efficace" : "The essentials — simple and effective"}</p>${minRoutineHtml}`)}</td></tr>

  <!-- Ideal Routine -->
  <tr><td>${card("✨", isFr ? "Routine Idéale" : "Ideal Routine", idealRoutineHtml)}</td></tr>

  <!-- Recovery Plan -->
  <tr><td>${card("📅", isFr ? "Plan de Récupération 7 Jours" : "7-Day Recovery Plan", recoveryHtml)}</td></tr>

  <!-- Ingredients Avoid -->
  <tr><td>${card("❌", isFr ? "Ingrédients à Éviter" : "Ingredients to Avoid", avoidHtml)}</td></tr>

  <!-- Ingredients Seek -->
  <tr><td>${card("🌿", isFr ? "Ingrédients à Rechercher" : "Ingredients to Look For", seekHtml)}</td></tr>

  <!-- Timeline -->
  <tr><td>${card("🔄", isFr ? "Calendrier d'Amélioration" : "Improvement Timeline", timelineHtml)}</td></tr>

  <!-- Long-term Strategy -->
  <tr><td>${card("🛡️", isFr ? "Stratégie Long Terme" : "Long-Term Strategy",
    `<p style="margin:0;font-size:14px;line-height:1.6;color:#4a3f35;">${e(r.longTermStrategy)}</p>`)}</td></tr>

  <!-- Confidence -->
  <tr><td>${highlight(`<p style="text-align:center;font-size:16px;margin:0 0 8px;">❤️</p><p style="margin:0;font-size:14px;line-height:1.6;color:#4a3f35;text-align:center;">${e(r.confidenceMessage)}</p>`)}</td></tr>

  <!-- Coach Note -->
  <tr><td>${card("✂️", isFr ? "Un Message de Ta Coach Capillaire" : "A Message From Your Hair Coach",
    `<p style="margin:0;font-size:14px;line-height:1.6;color:#4a3f35;white-space:pre-line;">${e(r.coachNote)}</p>`)}</td></tr>

  <!-- CTA -->
  <tr><td align="center" style="padding:24px 0;">
    <p style="font-weight:600;font-size:16px;margin:0 0 8px;color:#2d2319;">${isFr ? "Prête pour l'étape suivante ?" : "Ready for the Next Level?"}</p>
    <p style="font-size:13px;color:#8a7a6d;margin:0 0 16px;">${isFr ? "Je crée des routines complètes et personnalisées adaptées à ton profil." : "I create complete, personalized routines tailored to your profile."}</p>
    <a href="https://www.facebook.com/schicgirl" style="display:inline-block;background:linear-gradient(135deg,#c9a96e,#b8944a);color:#ffffff;padding:14px 32px;border-radius:30px;text-decoration:none;font-weight:600;font-size:14px;">${isFr ? "Me Contacter" : "Contact Me"}</a>
  </td></tr>

  <!-- Footer -->
  <tr><td align="center" style="padding:24px 0;"><p style="color:#8a7a6d;font-size:12px;margin:0;">© ${new Date().getFullYear()} SchicGirl — Decode My Hair</p></td></tr>

</table>
</td></tr></table>
</body></html>`;
}
