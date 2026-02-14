import { useNavigate } from "react-router-dom";
import { useHair } from "@/context/HairContext";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Sparkles, AlertTriangle, Lightbulb, Droplets, Shield, Calendar,
  CheckCircle2, XCircle, Heart, Star, ArrowRight, RotateCcw,
  Scissors, FlaskConical, Leaf
} from "lucide-react";

const fadeIn = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.5 },
});

function Section({ title, icon: Icon, children, delay = 0 }: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.section {...fadeIn(delay)} className="bg-card rounded-2xl p-6 shadow-warm border border-border">
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
  const { results, isPaid, reset } = useHair();

  if (!results || !isPaid) {
    navigate("/");
    return null;
  }

  const r = results;
  const severityColor =
    r.severityLabel === "Low" ? "text-green-600" :
    r.severityLabel === "Moderate" ? "text-gold-dark" : "text-destructive";

  return (
    <main className="min-h-screen bg-background px-6 py-10 pb-24">
      <div className="max-w-lg mx-auto space-y-5">
        {/* Header */}
        <motion.div {...fadeIn(0)} className="text-center mb-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-gold/15 px-4 py-1.5 mb-4">
            <Sparkles className="h-4 w-4 text-gold" />
            <span className="text-sm font-body font-semibold text-gold-dark">Full Diagnosis</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground leading-tight">
            Your Complete Hair Analysis
          </h1>
        </motion.div>

        {/* 1. Hair Identity */}
        <Section title="Your Hair Identity" icon={Star} delay={0.1}>
          <div className="bg-gold/10 rounded-xl p-4 border border-gold/20">
            <h4 className="font-display text-xl font-bold text-gradient-gold mb-1">{r.archetype.name}</h4>
            <p className="text-sm font-body text-foreground/80">{r.archetype.description}</p>
          </div>
        </Section>

        {/* 2. Severity Score */}
        <Section title="Dryness Severity" icon={AlertTriangle} delay={0.15}>
          <div className="flex items-baseline gap-3 mb-3">
            <span className={`text-5xl font-display font-bold ${severityColor}`}>{r.severityScore}</span>
            <span className="text-muted-foreground font-body">/100 — {r.severityLabel}</span>
          </div>
          <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full gradient-gold rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${r.severityScore}%` }}
              transition={{ delay: 0.5, duration: 1 }}
            />
          </div>
        </Section>

        {/* 3. Root Causes */}
        <Section title="Root Causes" icon={Lightbulb} delay={0.2}>
          <div className="space-y-4">
            {r.primaryCauses.map((c, i) => (
              <div key={i}>
                <h4 className="font-body font-semibold text-foreground mb-1">{c.cause}</h4>
                <p className="text-sm text-muted-foreground font-body">{c.explanation}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* 4. Contributing Factors */}
        <Section title="Contributing Factors" icon={FlaskConical} delay={0.22}>
          <ul className="space-y-2">
            {r.contributingFactors.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm font-body text-foreground/80">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-gold shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </Section>

        {/* 5. Biggest Mistake */}
        <motion.section {...fadeIn(0.25)} className="bg-destructive/8 rounded-2xl p-6 border border-destructive/20">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <h3 className="font-display text-lg font-semibold text-foreground">Biggest Mistake Detected</h3>
          </div>
          <p className="text-sm font-body text-foreground/90 leading-relaxed">{r.biggestMistake}</p>
        </motion.section>

        {/* 6. Mask Recommendation */}
        <Section title="Smart Mask Recommendation" icon={Droplets} delay={0.28}>
          <div className="space-y-3">
            <h4 className="font-body font-bold text-foreground text-lg">{r.maskRecommendation.type}</h4>
            <p className="text-sm text-foreground/80 font-body">{r.maskRecommendation.description}</p>
            <div className="flex items-center gap-2 text-sm text-gold-dark font-body font-medium">
              <Calendar className="h-4 w-4" /> {r.maskRecommendation.frequency}
            </div>
            <p className="text-xs text-muted-foreground font-body bg-secondary/50 rounded-lg p-3">
              ⚠️ {r.maskRecommendation.warning}
            </p>
          </div>
        </Section>

        {/* 7. Minimum Routine */}
        <Section title="Minimum Routine" icon={CheckCircle2} delay={0.3}>
          <p className="text-xs text-muted-foreground font-body mb-4">The essentials — simple and effective</p>
          <div className="space-y-3">
            {r.minimumRoutine.map((s) => (
              <div key={s.step} className="flex gap-3">
                <div className="h-7 w-7 rounded-full gradient-gold flex items-center justify-center text-xs font-bold text-accent-foreground shrink-0">
                  {s.step}
                </div>
                <div>
                  <h5 className="font-body font-semibold text-foreground text-sm">{s.action}</h5>
                  <p className="text-xs text-muted-foreground font-body">{s.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* 8. Ideal Routine */}
        <Section title="Ideal Routine" icon={Sparkles} delay={0.32}>
          <p className="text-xs text-muted-foreground font-body mb-4">Your optimized routine for best results</p>
          <div className="space-y-3">
            {r.idealRoutine.map((s) => (
              <div key={s.step} className="flex gap-3">
                <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground shrink-0">
                  {s.step}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h5 className="font-body font-semibold text-foreground text-sm">{s.action}</h5>
                    <span className="text-xs text-gold-dark font-body bg-gold/10 px-2 py-0.5 rounded-full">{s.frequency}</span>
                  </div>
                  <p className="text-xs text-muted-foreground font-body mt-0.5">{s.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* 9. 7-Day Recovery Plan */}
        <Section title="7-Day Recovery Plan" icon={Calendar} delay={0.34}>
          <div className="space-y-3">
            {r.recoveryPlan.map((d) => (
              <div key={d.day} className="flex gap-3 items-start">
                <span className="text-xs font-body font-bold text-gold-dark bg-gold/10 px-2.5 py-1 rounded-lg shrink-0 w-14 text-center">
                  {d.day}
                </span>
                <p className="text-sm font-body text-foreground/80">{d.action}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* 10. Ingredients Avoid */}
        <Section title="Ingredients to Avoid" icon={XCircle} delay={0.36}>
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
        <Section title="Ingredients to Look For" icon={Leaf} delay={0.38}>
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
        <Section title="Improvement Timeline" icon={RotateCcw} delay={0.4}>
          <div className="space-y-4">
            {r.timeline.map((t) => (
              <div key={t.period} className="border-l-2 border-gold pl-4">
                <h5 className="font-body font-bold text-gold-dark text-sm">{t.period}</h5>
                <p className="text-sm font-body text-foreground/80">{t.expectation}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* 13. Long-term */}
        <Section title="Long-Term Strategy" icon={Shield} delay={0.42}>
          <p className="text-sm font-body text-foreground/80 leading-relaxed">{r.longTermStrategy}</p>
        </Section>

        {/* 14. Confidence */}
        <motion.section {...fadeIn(0.44)} className="bg-gold/10 rounded-2xl p-6 border border-gold/20 text-center">
          <Heart className="h-8 w-8 text-gold mx-auto mb-3" />
          <p className="font-body text-foreground/90 leading-relaxed text-sm">{r.confidenceMessage}</p>
        </motion.section>

        {/* 15. Coach Note */}
        <motion.section {...fadeIn(0.46)} className="bg-card rounded-2xl p-6 shadow-warm border border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-full gradient-warm flex items-center justify-center">
              <Scissors className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h4 className="font-display text-base font-semibold text-foreground">A Note From Your Hair Coach</h4>
            </div>
          </div>
          <p className="text-sm font-body text-foreground/80 leading-relaxed italic">{r.coachNote}</p>
        </motion.section>

        {/* 16. Upgrade Funnel */}
        <motion.section {...fadeIn(0.5)} className="text-center py-8">
          <h3 className="font-display text-2xl font-bold text-foreground mb-2">Ready for the Next Level?</h3>
          <p className="text-muted-foreground font-body text-sm mb-6 max-w-sm mx-auto">
            Get a fully personalized routine built around your exact hair profile, products, and goals.
          </p>
          <Button variant="hero" size="lg" className="rounded-full text-base px-10 py-6">
            Build My Full Personalized Routine <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </motion.section>

        {/* Restart */}
        <div className="text-center pb-6">
          <button
            onClick={() => { reset(); navigate("/"); }}
            className="text-sm text-muted-foreground font-body hover:text-foreground transition-colors underline"
          >
            Start a new analysis
          </button>
        </div>
      </div>
    </main>
  );
};

export default Results;
