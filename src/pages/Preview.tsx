import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useHair } from "@/context/HairContext";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Lock, Sparkles, AlertTriangle, Lightbulb } from "lucide-react";

const Preview = () => {
  const navigate = useNavigate();
  const { results, email, setEmail, setPaid } = useHair();
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [emailInput, setEmailInput] = useState("");

  if (!results) {
    navigate("/");
    return null;
  }

  const handleUnlock = () => {
    if (!showEmailCapture) {
      setShowEmailCapture(true);
      return;
    }
    if (emailInput.trim() && emailInput.includes("@")) {
      setEmail(emailInput.trim());
      setPaid(true);
      navigate("/results");
    }
  };

  const severityColor =
    results.severityLabel === "Low" ? "text-green-600" :
    results.severityLabel === "Moderate" ? "text-gold-dark" : "text-destructive";

  return (
    <main className="min-h-screen bg-background px-6 py-12">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-1.5 mb-6">
            <Sparkles className="h-4 w-4 text-gold" />
            <span className="text-sm font-body font-medium text-muted-foreground">Analysis Complete</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-2">
            Your Hair Snapshot
          </h1>
          <p className="text-muted-foreground font-body">
            Here's a preview of what we found
          </p>
        </motion.div>

        {/* Severity teaser */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-card rounded-2xl p-6 shadow-warm border border-border mb-4"
        >
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className={`h-5 w-5 ${severityColor}`} />
            <h3 className="font-display text-lg font-semibold text-foreground">Dryness Severity</h3>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className={`text-4xl font-display font-bold ${severityColor}`}>
              {results.severityLabel}
            </span>
            <span className="text-muted-foreground font-body text-sm">
              ({results.severityScore}/100)
            </span>
          </div>

          {/* Score bar */}
          <div className="w-full h-2 bg-secondary rounded-full overflow-hidden mt-3">
            <motion.div
              className="h-full gradient-gold rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${results.severityScore}%` }}
              transition={{ delay: 0.5, duration: 0.8 }}
            />
          </div>
        </motion.div>

        {/* Root cause teaser */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="bg-card rounded-2xl p-6 shadow-warm border border-border mb-4"
        >
          <div className="flex items-center gap-3 mb-2">
            <Lightbulb className="h-5 w-5 text-gold" />
            <h3 className="font-display text-lg font-semibold text-foreground">Primary Root Cause</h3>
          </div>
          <p className="font-body text-foreground font-semibold">{results.primaryCauses[0].cause}</p>
          <p className="text-muted-foreground font-body text-sm mt-1 line-clamp-2">
            {results.primaryCauses[0].explanation}
          </p>
        </motion.div>

        {/* Micro tip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="bg-gold/10 rounded-2xl p-5 border border-gold/20 mb-6"
        >
          <p className="text-sm font-body text-foreground/90">
            💡 <strong>Quick tip:</strong> {results.biggestMistake.split(".")[0]}.
          </p>
        </motion.div>

        {/* Blurred sections */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="space-y-3 mb-10"
        >
          {["Hair Identity Profile", "7-Day Recovery Plan", "Smart Mask Recommendation", "Ingredient Lists", "Personalized Routine"].map((title) => (
            <div key={title} className="relative bg-card rounded-2xl p-5 border border-border overflow-hidden">
              <div className="blur-sm select-none pointer-events-none">
                <h4 className="font-display text-base font-semibold mb-1">{title}</h4>
                <p className="text-sm text-muted-foreground">
                  Detailed personalized analysis based on your unique hair profile and answers...
                </p>
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-background/40 backdrop-blur-[2px]">
                <Lock className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          ))}
        </motion.div>

        {/* Email capture + CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="text-center"
        >
          <AnimatedEmailCapture
            showEmailCapture={showEmailCapture}
            emailInput={emailInput}
            setEmailInput={setEmailInput}
          />
          <Button
            variant="hero"
            size="lg"
            className="w-full rounded-full text-base py-6"
            onClick={handleUnlock}
          >
            {showEmailCapture ? "Unlock My Full Diagnosis" : "Get My Full Diagnosis"}
          </Button>
          <p className="text-xs text-muted-foreground mt-3 font-body">
            Your personalized routine, recovery plan, and expert recommendations await.
          </p>
        </motion.div>
      </div>
    </main>
  );
};

function AnimatedEmailCapture({
  showEmailCapture,
  emailInput,
  setEmailInput,
}: {
  showEmailCapture: boolean;
  emailInput: string;
  setEmailInput: (v: string) => void;
}) {
  if (!showEmailCapture) return null;
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      transition={{ duration: 0.3 }}
      className="mb-4"
    >
      <input
        type="email"
        placeholder="Enter your email to continue"
        value={emailInput}
        onChange={(e) => setEmailInput(e.target.value)}
        className="w-full px-5 py-3.5 rounded-xl border-2 border-border bg-card text-foreground font-body text-sm focus:outline-none focus:border-gold transition-colors"
      />
    </motion.div>
  );
}

export default Preview;
