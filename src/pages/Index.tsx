import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Shield, Leaf, Lock } from "lucide-react";
import heroImage from "@/assets/hero-hair.jpg";

const trustItems = [
  { icon: Leaf, text: "Based on natural hair science" },
  { icon: Shield, text: "Natural-hair-safe only" },
  { icon: Lock, text: "Privacy protected" },
];

const Index = () => {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-background flex flex-col">
      {/* Hero Section */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-6 py-16 overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt="Natural hair texture with golden accents"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 max-w-lg mx-auto text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-1.5 mb-8"
          >
            <span className="h-2 w-2 rounded-full gradient-gold" />
            <span className="text-sm font-body font-medium text-muted-foreground">
              AI-Powered Hair Analysis
            </span>
          </motion.div>

          {/* Title */}
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-foreground leading-tight mb-4">
            Why Is My{" "}
            <span className="text-gradient-gold">Hair Dry</span>?
          </h1>

          {/* Subtitle */}
          <p className="font-body text-lg sm:text-xl text-muted-foreground mb-10 max-w-md mx-auto leading-relaxed">
            Stop guessing. Diagnose the real reason in 60 seconds.
          </p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <Button
              variant="hero"
              size="lg"
              className="text-lg px-10 py-6 rounded-full"
              onClick={() => navigate("/quiz")}
            >
              Start My Analysis
            </Button>
          </motion.div>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="relative z-10 flex flex-wrap items-center justify-center gap-6 mt-16"
        >
          {trustItems.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2 text-muted-foreground">
              <Icon className="h-4 w-4 text-gold" />
              <span className="text-sm font-body">{text}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </main>
  );
};

export default Index;
