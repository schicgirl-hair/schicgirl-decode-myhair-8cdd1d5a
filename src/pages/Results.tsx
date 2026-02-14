import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useHair } from "@/context/HairContext";
import { t } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import {
  Sparkles, AlertTriangle, Lightbulb, Droplets, Shield, Calendar,
  CheckCircle2, XCircle, Heart, Star, ArrowRight, RotateCcw,
  Scissors, FlaskConical, Leaf, Loader2, Lock
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const f = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.5 },
});

function Section({ title, icon: Icon, children, delay = 0 }: {
  title: string; icon: React.ElementType; children: React.ReactNode; delay?: number;
}) {
  return (
    <motion.section {...f(delay)} className="bg-card rounded-2xl p-6 shadow-warm border border-border">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-9 w-9 rounded-xl gradient-gold flex items-center justify-center">
          <Icon className="h-4 w-4 text-accent-foreground" />
        </div>
        <h3 className="font-display text-lg font-semibold text-foreground">{title}</h3>
      </div>
      {children}
    </motion.section>
  );
}

const Results = () => {
  const navigate = useNavigate();
  const { lang, results, isPaid, reset, setPaid } = useHair();
  const [verifying, setVerifying] = useState(false);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [password, setPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  // Server-side payment verification + auto-login
  useEffect(() => {
    const verifyPayment = async () => {
      const params = new URLSearchParams(window.location.search);
      const sessionId = params.get("session_id");

      if (isPaid) return; // Already verified

      if (!sessionId) {
        // No session_id — check if user is logged in and has a payment
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate("/preview");
          return;
        }
        const { data: payment } = await supabase
          .from("payments")
          .select("id")
          .eq("user_id", session.user.id)
          .eq("status", "paid")
          .maybeSingle();
        if (payment) {
          setPaid(true);
        } else {
          navigate("/preview");
        }
        return;
      }

      // Verify with server
      setVerifying(true);
      try {
        const { data, error } = await supabase.functions.invoke("verify-payment", {
          body: { session_id: sessionId },
        });
        if (error) throw error;

        if (data?.paid) {
          setPaid(true);
          setUserEmail(data.email || "");
          window.history.replaceState({}, "", "/results");

          // Auto-login with magic link token
          if (data.token_hash) {
            const { error: otpError } = await supabase.auth.verifyOtp({
              token_hash: data.token_hash,
              type: "magiclink",
            });
            if (otpError) {
              console.error("Auto-login failed:", otpError);
            }

            // Prompt to set password if new user
            if (data.needs_password) {
              setShowPasswordPrompt(true);
            }
          }
        } else {
          navigate("/preview");
        }
      } catch (err) {
        console.error("Verification error:", err);
        navigate("/preview");
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [isPaid, setPaid, navigate]);

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success(lang === "fr" ? "Mot de passe enregistré ! Vous pourrez vous reconnecter." : "Password saved! You can log back in anytime.");
      setShowPasswordPrompt(false);
    } catch (err: any) {
      toast.error(err.message || "Error saving password");
    } finally {
      setSavingPassword(false);
    }
  };

  if (verifying) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-gold mx-auto" />
          <p className="font-body text-muted-foreground">
            {lang === "fr" ? "Vérification du paiement..." : "Verifying payment..."}
          </p>
        </div>
      </main>
    );
  }

  if (!results || !isPaid) {
    return null;
  }

  const r = results;
  const severityColor =
    r.severityLabel === "Low" ? "text-green-600" :
    r.severityLabel === "Moderate" ? "text-gold-dark" : "text-destructive";
  const localizedSeverity = t(lang, r.severityLabel.toLowerCase());

  return (
    <main className="min-h-screen bg-background px-6 py-10 pb-24">
      <div className="max-w-lg mx-auto space-y-5 overflow-hidden break-words">

        {/* Password setup prompt */}
        {showPasswordPrompt && (
          <motion.div {...f(0)} className="bg-gold/10 rounded-2xl p-6 border border-gold/20">
            <div className="flex items-center gap-3 mb-3">
              <Lock className="h-5 w-5 text-gold" />
              <h3 className="font-display text-lg font-semibold text-foreground">
                {lang === "fr" ? "Sauvegardez vos résultats" : "Save your results"}
              </h3>
            </div>
            <p className="text-sm font-body text-muted-foreground mb-4">
              {lang === "fr"
                ? `Créez un mot de passe pour ${userEmail} afin de pouvoir consulter vos résultats à tout moment.`
                : `Set a password for ${userEmail} so you can access your results anytime.`}
            </p>
            <form onSubmit={handleSetPassword} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm">{lang === "fr" ? "Mot de passe" : "Password"}</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder={lang === "fr" ? "6 caractères minimum" : "Min 6 characters"}
                />
              </div>
              <Button type="submit" variant="hero" className="w-full rounded-full" disabled={savingPassword}>
                {savingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : (lang === "fr" ? "Enregistrer" : "Save")}
              </Button>
            </form>
          </motion.div>
        )}

        {/* Header */}
        <motion.div {...f(0)} className="text-center mb-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-gold/15 px-4 py-1.5 mb-4">
            <Sparkles className="h-4 w-4 text-gold" />
            <span className="text-sm font-body font-semibold text-gold-dark">{t(lang, "fullDiagnosis")}</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground leading-tight">
            {t(lang, "completeAnalysis")}
          </h1>
        </motion.div>

        {/* 1. Hair Identity */}
        <Section title={t(lang, "yourHairIdentity")} icon={Star} delay={0.1}>
          <div className="bg-gold/10 rounded-xl p-4 border border-gold/20">
            <h4 className="font-display text-xl font-bold text-gradient-gold mb-1">{r.archetype.name}</h4>
            <p className="text-sm font-body text-foreground/80">{r.archetype.description}</p>
          </div>
        </Section>

        {/* 2. Severity Score */}
        <Section title={t(lang, "drynessSeverity")} icon={AlertTriangle} delay={0.15}>
          <div className="flex items-baseline gap-3 mb-3">
            <span className={`text-5xl font-display font-bold ${severityColor}`}>{r.severityScore}</span>
            <span className="text-muted-foreground font-body">/100 — {localizedSeverity}</span>
          </div>
          <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
            <motion.div className="h-full gradient-gold rounded-full" initial={{ width: 0 }} animate={{ width: `${r.severityScore}%` }} transition={{ delay: 0.5, duration: 1 }} />
          </div>
        </Section>

        {/* Surprising Insight */}
        <motion.section {...f(0.17)} className="bg-gold/10 rounded-2xl p-5 border border-gold/20">
          <p className="text-sm font-body font-semibold text-gold-dark mb-1">{t(lang, "surprisingInsightLabel")}</p>
          <p className="text-sm font-body text-foreground/90 leading-relaxed">{r.surprisingInsight}</p>
        </motion.section>

        {/* 3. Root Causes */}
        <Section title={t(lang, "rootCauses")} icon={Lightbulb} delay={0.2}>
          <div className="space-y-4">
            {r.primaryCauses.map((c, i) => (
              <div key={i}>
                <h4 className="font-body font-semibold text-foreground mb-1">{c.cause}</h4>
                <p className="text-sm text-muted-foreground font-body leading-relaxed">{c.explanation}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* 4. Contributing Factors */}
        <Section title={t(lang, "contributingFactors")} icon={FlaskConical} delay={0.22}>
          <ul className="space-y-2">
            {r.contributingFactors.map((fct, i) => (
              <li key={i} className="flex items-start gap-2 text-sm font-body text-foreground/80">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-gold shrink-0" />
                {fct}
              </li>
            ))}
          </ul>
        </Section>

        {/* 5. Biggest Mistake */}
        <motion.section {...f(0.25)} className="bg-destructive/8 rounded-2xl p-6 border border-destructive/20">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <h3 className="font-display text-lg font-semibold text-foreground">{t(lang, "biggestMistake")}</h3>
          </div>
          <p className="text-sm font-body text-foreground/90 leading-relaxed">{r.biggestMistake}</p>
        </motion.section>

        {/* Empowering + Immediate Action */}
        <motion.section {...f(0.26)} className="bg-secondary/50 rounded-2xl p-5 space-y-3">
          <div>
            <p className="text-sm font-body font-semibold text-foreground mb-1">{t(lang, "empoweringLabel")}</p>
            <p className="text-sm font-body text-foreground/85 italic leading-relaxed">{r.empoweringSentence}</p>
          </div>
          <div className="border-t border-border pt-3">
            <p className="text-sm font-body font-semibold text-gold-dark mb-1">{t(lang, "immediateActionLabel")}</p>
            <p className="text-sm font-body text-foreground/85 leading-relaxed">{r.immediateAction}</p>
          </div>
        </motion.section>

        {/* 6. Mask Recommendation */}
        <Section title={t(lang, "maskRecommendation")} icon={Droplets} delay={0.28}>
          <div className="space-y-3">
            <h4 className="font-body font-bold text-foreground text-lg">{r.maskRecommendation.type}</h4>
            <p className="text-sm text-foreground/80 font-body leading-relaxed">{r.maskRecommendation.description}</p>
            <div className="flex items-center gap-2 text-sm text-gold-dark font-body font-medium">
              <Calendar className="h-4 w-4" /> {r.maskRecommendation.frequency}
            </div>
            <p className="text-xs text-muted-foreground font-body bg-secondary/50 rounded-lg p-3">⚠️ {r.maskRecommendation.warning}</p>
          </div>
        </Section>

        {/* 7. Minimum Routine */}
        <Section title={t(lang, "minimumRoutine")} icon={CheckCircle2} delay={0.3}>
          <p className="text-xs text-muted-foreground font-body mb-4">{t(lang, "minRoutineDesc")}</p>
          <div className="space-y-3">
            {r.minimumRoutine.map((s) => (
              <div key={s.step} className="flex gap-3">
                <div className="h-7 w-7 rounded-full gradient-gold flex items-center justify-center text-xs font-bold text-accent-foreground shrink-0">{s.step}</div>
                <div>
                  <h5 className="font-body font-semibold text-foreground text-sm">{s.action}</h5>
                  <p className="text-xs text-muted-foreground font-body">{s.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* 8. Ideal Routine */}
        <Section title={t(lang, "idealRoutine")} icon={Sparkles} delay={0.32}>
          <p className="text-xs text-muted-foreground font-body mb-4">{t(lang, "idealRoutineDesc")}</p>
          <div className="space-y-3">
            {r.idealRoutine.map((s) => (
            <div key={s.step} className="flex gap-3">
                <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground shrink-0">{s.step}</div>
                <div className="flex-1 min-w-0">
                  <h5 className="font-body font-semibold text-foreground text-sm">{s.action}</h5>
                  <span className="inline-block text-xs text-gold-dark font-body bg-gold/10 px-2 py-0.5 rounded-full mt-1">{s.frequency}</span>
                  <p className="text-xs text-muted-foreground font-body mt-1">{s.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* 9. 7-Day Recovery Plan */}
        <Section title={t(lang, "recoveryPlan")} icon={Calendar} delay={0.34}>
          <div className="space-y-3">
            {r.recoveryPlan.map((d) => (
              <div key={d.day} className="flex gap-3 items-start">
                <span className="text-xs font-body font-bold text-gold-dark bg-gold/10 px-2.5 py-1 rounded-lg shrink-0 w-16 text-center">{d.day}</span>
                <p className="text-sm font-body text-foreground/80 leading-relaxed">{d.action}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* 10. Ingredients Avoid */}
        <Section title={t(lang, "ingredientsAvoid")} icon={XCircle} delay={0.36}>
          <div className="space-y-2">
            {r.ingredientsAvoid.map((ing) => (
              <div key={ing.name} className="flex items-start gap-2">
                <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                <div>
                  <span className="text-sm font-body font-semibold text-foreground">{ing.name}</span>
                  <p className="text-xs text-muted-foreground font-body">{ing.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* 11. Ingredients Seek */}
        <Section title={t(lang, "ingredientsSeek")} icon={Leaf} delay={0.38}>
          <div className="space-y-2">
            {r.ingredientsSeek.map((ing) => (
              <div key={ing.name} className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-sm font-body font-semibold text-foreground">{ing.name}</span>
                  <p className="text-xs text-muted-foreground font-body">{ing.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* 12. Timeline */}
        <Section title={t(lang, "improvementTimeline")} icon={RotateCcw} delay={0.4}>
          <div className="space-y-4">
            {r.timeline.map((tl) => (
              <div key={tl.period} className="border-l-2 border-gold pl-4">
                <h5 className="font-body font-bold text-gold-dark text-sm">{tl.period}</h5>
                <p className="text-sm font-body text-foreground/80">{tl.expectation}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* 13. Long-term */}
        <Section title={t(lang, "longTermStrategy")} icon={Shield} delay={0.42}>
          <p className="text-sm font-body text-foreground/80 leading-relaxed">{r.longTermStrategy}</p>
        </Section>

        {/* 14. Confidence */}
        <motion.section {...f(0.44)} className="bg-gold/10 rounded-2xl p-6 border border-gold/20 text-center">
          <Heart className="h-8 w-8 text-gold mx-auto mb-3" />
          <p className="font-body text-foreground/90 leading-relaxed text-sm">{r.confidenceMessage}</p>
        </motion.section>

        {/* 15. Coach Note */}
        <motion.section {...f(0.46)} className="bg-card rounded-2xl p-6 shadow-warm border border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-full gradient-warm flex items-center justify-center">
              <Scissors className="h-4 w-4 text-primary-foreground" />
            </div>
            <h4 className="font-display text-base font-semibold text-foreground">{t(lang, "coachNoteTitle")}</h4>
          </div>
          <p className="text-sm font-body text-foreground/80 leading-relaxed whitespace-pre-line">{r.coachNote}</p>
        </motion.section>

        {/* 16. Contact CTA */}
        <motion.section {...f(0.5)} className="text-center py-8">
          <h3 className="font-display text-2xl font-bold text-foreground mb-2">{t(lang, "nextLevel")}</h3>
          <p className="text-muted-foreground font-body text-sm mb-6 max-w-sm mx-auto">{t(lang, "contactDesc")}</p>
          <a href="https://wa.me/YOUR_NUMBER" target="_blank" rel="noopener noreferrer">
            <Button variant="hero" size="lg" className="rounded-full text-base px-10 py-6">
              {t(lang, "contactMe")} <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </a>
        </motion.section>

        <div className="text-center pb-6">
          <button onClick={() => { reset(); navigate("/"); }} className="text-sm text-muted-foreground font-body hover:text-foreground transition-colors underline">
            {t(lang, "startNewAnalysis")}
          </button>
        </div>
      </div>
    </main>
  );
};

export default Results;
