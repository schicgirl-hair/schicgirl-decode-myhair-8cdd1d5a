import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Shield, Leaf, Lock } from "lucide-react";
import { useHair } from "@/context/HairContext";
import { t, Lang } from "@/lib/i18n";
import heroImage from "@/assets/hero-hair.jpg";

const Index = () => {
  const navigate = useNavigate();
  const { lang, setLang } = useHair();

  const trustItems = [
    { icon: Leaf, text: t(lang, "trust1") },
    { icon: Shield, text: t(lang, "trust2") },
    { icon: Lock, text: t(lang, "trust3") },
  ];

  return (
    <main className="min-h-screen bg-background flex flex-col">
      {/* Language Selector */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-center gap-3 pt-6 px-6"
      >
        {([["fr", "🇫🇷 Français"], ["en", "🇬🇧 English"]] as [Lang, string][]).map(([code, label]) => (
          <button
            key={code}
            onClick={() => setLang(code)}
            className={`px-5 py-2.5 rounded-full text-sm font-body font-medium transition-all duration-200 ${
              lang === code
                ? "gradient-gold text-accent-foreground shadow-gold"
                : "bg-secondary text-muted-foreground hover:bg-secondary/80"
            }`}
          >
            {label}
          </button>
        ))}
      </motion.div>

      {/* Hero */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-6 py-12 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={heroImage} alt="Natural hair texture" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 max-w-lg mx-auto text-center"
        >

          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-foreground leading-tight mb-4">
            {t(lang, "title1")}{" "}
            <span className="text-gradient-gold">{t(lang, "titleHighlight")}</span>?
          </h1>

          <p className="font-body text-lg sm:text-xl text-muted-foreground mb-10 max-w-md mx-auto leading-relaxed">
            {t(lang, "subtitle")}
          </p>

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
              {t(lang, "cta")}
            </Button>
          </motion.div>
        </motion.div>

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
