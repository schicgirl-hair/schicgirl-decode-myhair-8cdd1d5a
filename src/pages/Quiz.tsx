import { useNavigate } from "react-router-dom";
import { useHair } from "@/context/HairContext";
import { quizQuestions } from "@/lib/questions";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";

const Quiz = () => {
  const navigate = useNavigate();
  const { answers, currentStep, setAnswer, setStep, generateResults } = useHair();
  const total = quizQuestions.length;
  const question = quizQuestions[currentStep];
  const progress = ((currentStep + 1) / total) * 100;
  const selected = answers[question.id] || "";

  const handleSelect = (value: string) => {
    setAnswer(question.id, value);
  };

  const handleNext = () => {
    if (currentStep < total - 1) {
      setStep(currentStep + 1);
    } else {
      generateResults();
      navigate("/preview");
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setStep(currentStep - 1);
    else navigate("/");
  };

  return (
    <main className="min-h-screen bg-background flex flex-col">
      {/* Progress bar */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border px-6 py-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-2">
            <button onClick={handleBack} className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <span className="text-sm font-body text-muted-foreground">
              {currentStep + 1} of {total}
            </span>
          </div>
          <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full gradient-gold rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="max-w-lg w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={question.id}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <h2 className="font-display text-2xl sm:text-3xl font-semibold text-foreground mb-2 leading-snug">
                {question.question}
              </h2>
              {question.subtitle && (
                <p className="text-muted-foreground font-body text-sm mb-8">
                  {question.subtitle}
                </p>
              )}
              {!question.subtitle && <div className="mb-8" />}

              <div className="space-y-3">
                {question.options.map((option) => {
                  const isSelected = selected === option.value;
                  return (
                    <button
                      key={option.value}
                      onClick={() => handleSelect(option.value)}
                      className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all duration-200 font-body ${
                        isSelected
                          ? "border-gold bg-gold/10 shadow-gold"
                          : "border-border bg-card hover:border-gold/40 hover:bg-card/80"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {option.emoji && <span className="text-xl">{option.emoji}</span>}
                        <span className={`text-sm sm:text-base font-medium ${isSelected ? "text-foreground" : "text-foreground/80"}`}>
                          {option.label}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Next button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: selected ? 1 : 0.4 }}
            className="mt-10"
          >
            <Button
              variant="hero"
              size="lg"
              className="w-full rounded-full text-base py-6"
              disabled={!selected}
              onClick={handleNext}
            >
              {currentStep < total - 1 ? (
                <>
                  Continue <ArrowRight className="h-4 w-4 ml-1" />
                </>
              ) : (
                "See My Results"
              )}
            </Button>
          </motion.div>
        </div>
      </div>
    </main>
  );
};

export default Quiz;
