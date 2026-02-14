import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) throw new Error("RESEND_API_KEY is not configured");

    const { email, results, lang } = await req.json();
    if (!email || !results) throw new Error("Missing email or results");

    const isFr = lang === "fr";

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#FAF8F5;font-family:Georgia,serif;">
<div style="max-width:600px;margin:0 auto;padding:32px 24px;">
  <div style="text-align:center;margin-bottom:32px;">
    <h1 style="font-size:28px;color:#1a1a1a;margin:0 0 8px;">✨ ${isFr ? "Ton Diagnostic Capillaire Complet" : "Your Complete Hair Diagnosis"}</h1>
    <p style="color:#888;font-size:14px;margin:0;">${isFr ? "Résultats personnalisés de ton analyse" : "Personalized results from your analysis"}</p>
  </div>

  <!-- Hair Identity -->
  <div style="background:#fff;border-radius:16px;padding:24px;margin-bottom:16px;border:1px solid #eee;">
    <h2 style="font-size:18px;color:#1a1a1a;margin:0 0 8px;">🪞 ${isFr ? "Ton Identité Capillaire" : "Your Hair Identity"}</h2>
    <h3 style="font-size:20px;color:#B8860B;margin:0 0 4px;">${results.archetype.name}</h3>
    <p style="font-size:14px;color:#555;margin:0;">${results.archetype.description}</p>
  </div>

  <!-- Severity -->
  <div style="background:#fff;border-radius:16px;padding:24px;margin-bottom:16px;border:1px solid #eee;">
    <h2 style="font-size:18px;color:#1a1a1a;margin:0 0 8px;">⚠️ ${isFr ? "Sévérité" : "Severity"}: ${results.severityScore}/100 — ${results.severityLabel}</h2>
  </div>

  <!-- Root Causes -->
  <div style="background:#fff;border-radius:16px;padding:24px;margin-bottom:16px;border:1px solid #eee;">
    <h2 style="font-size:18px;color:#1a1a1a;margin:0 0 12px;">💡 ${isFr ? "Causes Profondes" : "Root Causes"}</h2>
    ${results.primaryCauses.map((c: any) => `
      <div style="margin-bottom:12px;">
        <h4 style="font-size:15px;color:#1a1a1a;margin:0 0 4px;">${c.cause}</h4>
        <p style="font-size:13px;color:#666;margin:0;">${c.explanation}</p>
      </div>
    `).join("")}
  </div>

  <!-- Biggest Mistake -->
  <div style="background:#fff5f5;border-radius:16px;padding:24px;margin-bottom:16px;border:1px solid #fecaca;">
    <h2 style="font-size:18px;color:#dc2626;margin:0 0 8px;">🚫 ${isFr ? "Plus Grande Erreur" : "Biggest Mistake"}</h2>
    <p style="font-size:14px;color:#555;margin:0;">${results.biggestMistake}</p>
  </div>

  <!-- Mask Recommendation -->
  <div style="background:#fff;border-radius:16px;padding:24px;margin-bottom:16px;border:1px solid #eee;">
    <h2 style="font-size:18px;color:#1a1a1a;margin:0 0 8px;">🧴 ${isFr ? "Masque Recommandé" : "Mask Recommendation"}</h2>
    <h3 style="font-size:16px;color:#B8860B;margin:0 0 4px;">${results.maskRecommendation.type}</h3>
    <p style="font-size:13px;color:#555;margin:0 0 8px;">${results.maskRecommendation.description}</p>
    <p style="font-size:13px;color:#B8860B;margin:0 0 4px;">📅 ${results.maskRecommendation.frequency}</p>
    <p style="font-size:12px;color:#888;margin:0;">⚠️ ${results.maskRecommendation.warning}</p>
  </div>

  <!-- Minimum Routine -->
  <div style="background:#fff;border-radius:16px;padding:24px;margin-bottom:16px;border:1px solid #eee;">
    <h2 style="font-size:18px;color:#1a1a1a;margin:0 0 12px;">✅ ${isFr ? "Routine Minimum" : "Minimum Routine"}</h2>
    ${results.minimumRoutine.map((s: any) => `
      <div style="margin-bottom:10px;">
        <strong style="color:#B8860B;">${isFr ? "Étape" : "Step"} ${s.step}:</strong> <span style="font-size:14px;color:#1a1a1a;">${s.action}</span>
        <p style="font-size:12px;color:#888;margin:4px 0 0;">${s.detail}</p>
      </div>
    `).join("")}
  </div>

  <!-- Ideal Routine -->
  <div style="background:#fff;border-radius:16px;padding:24px;margin-bottom:16px;border:1px solid #eee;">
    <h2 style="font-size:18px;color:#1a1a1a;margin:0 0 12px;">✨ ${isFr ? "Routine Idéale" : "Ideal Routine"}</h2>
    ${results.idealRoutine.map((s: any) => `
      <div style="margin-bottom:10px;">
        <strong style="color:#B8860B;">${isFr ? "Étape" : "Step"} ${s.step}:</strong> <span style="font-size:14px;color:#1a1a1a;">${s.action}</span> <em style="font-size:12px;color:#B8860B;">(${s.frequency})</em>
        <p style="font-size:12px;color:#888;margin:4px 0 0;">${s.detail}</p>
      </div>
    `).join("")}
  </div>

  <!-- 7-Day Recovery -->
  <div style="background:#fff;border-radius:16px;padding:24px;margin-bottom:16px;border:1px solid #eee;">
    <h2 style="font-size:18px;color:#1a1a1a;margin:0 0 12px;">📆 ${isFr ? "Plan 7 Jours" : "7-Day Plan"}</h2>
    ${results.recoveryPlan.map((d: any) => `
      <div style="margin-bottom:8px;">
        <strong style="color:#B8860B;">${d.day}:</strong> <span style="font-size:13px;color:#555;">${d.action}</span>
      </div>
    `).join("")}
  </div>

  <!-- Ingredients -->
  <div style="background:#fff;border-radius:16px;padding:24px;margin-bottom:16px;border:1px solid #eee;">
    <h2 style="font-size:18px;color:#dc2626;margin:0 0 12px;">❌ ${isFr ? "Ingrédients à Éviter" : "Ingredients to Avoid"}</h2>
    ${results.ingredientsAvoid.map((i: any) => `<p style="font-size:13px;color:#555;margin:0 0 6px;"><strong>${i.name}</strong> — ${i.reason}</p>`).join("")}
  </div>

  <div style="background:#fff;border-radius:16px;padding:24px;margin-bottom:16px;border:1px solid #eee;">
    <h2 style="font-size:18px;color:#16a34a;margin:0 0 12px;">✅ ${isFr ? "Ingrédients à Rechercher" : "Ingredients to Look For"}</h2>
    ${results.ingredientsSeek.map((i: any) => `<p style="font-size:13px;color:#555;margin:0 0 6px;"><strong>${i.name}</strong> — ${i.reason}</p>`).join("")}
  </div>

  <!-- Timeline -->
  <div style="background:#fff;border-radius:16px;padding:24px;margin-bottom:16px;border:1px solid #eee;">
    <h2 style="font-size:18px;color:#1a1a1a;margin:0 0 12px;">📈 ${isFr ? "Calendrier d'Amélioration" : "Timeline"}</h2>
    ${results.timeline.map((tl: any) => `
      <div style="margin-bottom:8px;border-left:3px solid #B8860B;padding-left:12px;">
        <strong style="color:#B8860B;">${tl.period}</strong>
        <p style="font-size:13px;color:#555;margin:4px 0 0;">${tl.expectation}</p>
      </div>
    `).join("")}
  </div>

  <!-- Coach Note -->
  <div style="background:#FFF8E7;border-radius:16px;padding:24px;margin-bottom:16px;border:1px solid #B8860B33;">
    <h2 style="font-size:18px;color:#1a1a1a;margin:0 0 8px;">💌 ${isFr ? "Message de ta Coach" : "Coach's Message"}</h2>
    <p style="font-size:14px;color:#555;margin:0;white-space:pre-line;">${results.coachNote}</p>
  </div>

  <div style="text-align:center;padding:24px 0;color:#aaa;font-size:12px;">
    ${isFr ? "Merci pour ta confiance ✨" : "Thank you for your trust ✨"}
  </div>
</div>
</body>
</html>`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Hair Diagnosis <onboarding@resend.dev>",
        to: [email],
        subject: isFr
          ? "✨ Ton Diagnostic Capillaire Complet"
          : "✨ Your Complete Hair Diagnosis",
        html,
      }),
    });

    if (!res.ok) {
      const errorBody = await res.text();
      throw new Error(`Resend API error [${res.status}]: ${errorBody}`);
    }

    const data = await res.json();
    return new Response(JSON.stringify({ success: true, id: data.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("send-results error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
