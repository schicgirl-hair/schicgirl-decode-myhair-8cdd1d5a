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
  const sc = r.severityLabel === "Low" ? "#16a34a" : r.severityLabel === "Moderate" ? "#b8944a" : "#dc2626";

  // Use <style> block to reduce inline style repetition — Gmail supports <style> in <head>
  const css = `<style>
body,td,p,li{font-family:Arial,sans-serif;color:#2d2319;font-size:14px;line-height:1.6}
.c{background:#fff;border-radius:12px;padding:20px;border:1px solid #e8e0d8;margin-bottom:14px}
.ct{font-size:15px;font-weight:700;margin:0 0 10px}
.hl{background:#fef7ec;border:1px solid #f0dbb8;border-radius:10px;padding:14px;margin-bottom:14px}
.wr{background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:14px;margin-bottom:14px}
.g{color:#8a7a6d;font-size:12px}
.b{font-weight:700}
.gd{color:#b8944a;font-weight:700}
.sr{margin:0 0 8px}
</style>`;

  const sec = (title: string, body: string) => `<div class="c"><p class="ct">${title}</p>${body}</div>`;

  const causes = (r.primaryCauses || []).map((c: any) =>
    `<p class="b sr">${e(c.cause)}</p><p style="margin:0 0 12px">${e(c.explanation)}</p>`).join("");

  const factors = (r.contributingFactors || []).map((f: string) =>
    `<li>${e(f)}</li>`).join("");

  const minR = (r.minimumRoutine || []).map((s: any) =>
    `<p class="sr"><span class="gd">${e(s.step)}.</span> <b>${e(s.action)}</b><br><span class="g">${e(s.detail)}</span></p>`).join("");

  const idealR = (r.idealRoutine || []).map((s: any) =>
    `<p class="sr"><span class="gd">${e(s.step)}.</span> <b>${e(s.action)}</b> <span class="gd" style="font-size:11px">${e(s.frequency)}</span><br><span class="g">${e(s.detail)}</span></p>`).join("");

  const recov = (r.recoveryPlan || []).map((d: any) =>
    `<p class="sr"><span class="gd">${e(d.day)}</span> — ${e(d.action)}</p>`).join("");

  const avoid = (r.ingredientsAvoid || []).map((i: any) =>
    `<p class="sr"><span style="color:#dc2626" class="b">✗ ${e(i.name)}</span><br><span class="g">${e(i.reason)}</span></p>`).join("");

  const seek = (r.ingredientsSeek || []).map((i: any) =>
    `<p class="sr"><span style="color:#16a34a" class="b">✓ ${e(i.name)}</span><br><span class="g">${e(i.reason)}</span></p>`).join("");

  const tl = (r.timeline || []).map((t: any) =>
    `<p class="sr" style="border-left:3px solid #c9a96e;padding-left:12px"><span class="gd">${e(t.period)}</span><br>${e(t.expectation)}</p>`).join("");

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${css}</head>
<body style="background:#faf8f5;margin:0;padding:0">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:20px 12px">
<table width="600" style="max-width:600px" cellpadding="0" cellspacing="0">
<tr><td align="center" style="padding:24px 0">
<span style="background:#b8944a;color:#fff;padding:3px 12px;border-radius:16px;font-size:11px;font-weight:600">✨ ${isFr ? "Diagnostic Complet" : "Full Diagnosis"}</span>
<h1 style="font-size:22px;margin:10px 0 2px">${isFr ? "Ton Analyse Capillaire" : "Your Hair Analysis"}</h1>
<p class="g">${isFr ? "Résultats personnalisés par SchicGirl" : "Personalized results by SchicGirl"}</p>
</td></tr>
<tr><td>
${sec("⭐ " + (isFr ? "Ton Identité Capillaire" : "Your Hair Identity"),
  `<div class="hl"><p class="gd" style="font-size:16px;margin:0 0 6px">${e(r.archetype?.name)}</p><p style="margin:0">${e(r.archetype?.description)}</p></div>`)}
${sec("⚠️ " + (isFr ? "Sévérité" : "Severity"),
  `<p style="font-size:40px;font-weight:800;margin:0;color:${sc}">${e(r.severityScore)}<span style="font-size:14px;color:#8a7a6d;font-weight:400">/100 — ${e(severityLabel)}</span></p>`)}
<div class="hl"><p class="b">💡 ${isFr ? "Le savais-tu ?" : "Did you know?"}</p><p style="margin:0">${e(r.surprisingInsight)}</p></div>
${sec("💡 " + (isFr ? "Causes Profondes" : "Root Causes"), causes)}
${sec("🔬 " + (isFr ? "Facteurs Contributifs" : "Contributing Factors"), `<ul style="padding-left:16px;margin:0">${factors}</ul>`)}
<div class="wr"><p class="b">⚠️ ${isFr ? "Plus Grande Erreur" : "Biggest Mistake"}</p><p style="margin:0">${e(r.biggestMistake)}</p></div>
<div class="hl"><p class="b">✨ ${isFr ? "Rappelle-toi" : "Remember"}</p><p style="margin:0 0 8px;font-style:italic">${e(r.empoweringSentence)}</p><hr style="border:none;border-top:1px solid #e8e0d8;margin:8px 0"><p class="gd">🎯 ${isFr ? "Action immédiate" : "Immediate action"}</p><p style="margin:0">${e(r.immediateAction)}</p></div>
${sec("💧 " + (isFr ? "Masque Recommandé" : "Mask Recommendation"),
  `<p class="b" style="margin:0 0 6px">${e(r.maskRecommendation?.type)}</p><p style="margin:0 0 6px">${e(r.maskRecommendation?.description)}</p><p class="gd" style="margin:0 0 6px">📅 ${e(r.maskRecommendation?.frequency)}</p><p class="g" style="background:#f5f0eb;padding:8px;border-radius:6px;margin:0">⚠️ ${e(r.maskRecommendation?.warning)}</p>`)}
${sec("✅ " + (isFr ? "Routine Minimum" : "Minimum Routine"), minR)}
${sec("✨ " + (isFr ? "Routine Idéale" : "Ideal Routine"), idealR)}
${sec("📅 " + (isFr ? "Plan 7 Jours" : "7-Day Plan"), recov)}
${sec("❌ " + (isFr ? "Ingrédients à Éviter" : "Avoid"), avoid)}
${sec("🌿 " + (isFr ? "Ingrédients à Rechercher" : "Look For"), seek)}
${sec("🔄 " + (isFr ? "Calendrier" : "Timeline"), tl)}
${sec("🛡️ " + (isFr ? "Stratégie Long Terme" : "Long-Term Strategy"), `<p style="margin:0">${e(r.longTermStrategy)}</p>`)}
<div class="hl" style="text-align:center"><p style="margin:0 0 4px">❤️</p><p style="margin:0">${e(r.confidenceMessage)}</p></div>
${sec("✂️ " + (isFr ? "Message de Ta Coach" : "Coach Note"), `<p style="margin:0;white-space:pre-line">${e(r.coachNote)}</p>`)}
<div style="text-align:center;padding:20px 0">
<p class="b" style="font-size:15px;margin:0 0 6px">${isFr ? "Prête pour la suite ?" : "Ready for more?"}</p>
<p class="g" style="margin:0 0 12px">${isFr ? "Routines personnalisées adaptées à ton profil." : "Personalized routines for your profile."}</p>
<a href="https://www.facebook.com/schicgirl" style="background:#b8944a;color:#fff;padding:12px 28px;border-radius:24px;text-decoration:none;font-weight:600;font-size:13px">${isFr ? "Me Contacter" : "Contact Me"}</a>
</div>
<p class="g" style="text-align:center;padding:16px 0">© ${new Date().getFullYear()} SchicGirl</p>
</td></tr>
</table>
</td></tr></table>
</body></html>`;
}
