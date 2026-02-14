import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useHair } from "@/context/HairContext";
import { t } from "@/lib/i18n";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const Auth = () => {
  const navigate = useNavigate();
  const { lang } = useHair();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/preview");
      }
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/preview");
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success(lang === "fr"
          ? "Vérifiez votre email pour confirmer votre compte"
          : "Check your email to confirm your account");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-6">
        <button onClick={() => navigate("/preview")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          {lang === "fr" ? "Retour" : "Back"}
        </button>

        <div className="text-center">
          <h1 className="font-display text-2xl font-bold text-foreground">
            {isLogin
              ? (lang === "fr" ? "Connexion" : "Sign In")
              : (lang === "fr" ? "Créer un compte" : "Sign Up")}
          </h1>
          <p className="text-sm text-muted-foreground font-body mt-1">
            {lang === "fr"
              ? "Connectez-vous pour débloquer votre diagnostic"
              : "Sign in to unlock your diagnosis"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{lang === "fr" ? "Mot de passe" : "Password"}</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          </div>
          <Button type="submit" variant="hero" className="w-full rounded-full" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : isLogin
              ? (lang === "fr" ? "Se connecter" : "Sign In")
              : (lang === "fr" ? "S'inscrire" : "Sign Up")}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground font-body">
          {isLogin
            ? (lang === "fr" ? "Pas de compte ? " : "No account? ")
            : (lang === "fr" ? "Déjà un compte ? " : "Already have an account? ")}
          <button onClick={() => setIsLogin(!isLogin)} className="text-primary underline hover:text-primary/80">
            {isLogin
              ? (lang === "fr" ? "S'inscrire" : "Sign Up")
              : (lang === "fr" ? "Se connecter" : "Sign In")}
          </button>
        </p>
      </div>
    </main>
  );
};

export default Auth;
