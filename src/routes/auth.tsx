import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Waves, Mail, Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/lib/useAuth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in to Renewise — Renewal Alerts" },
      {
        name: "description",
        content:
          "Sign in to Renewise to sync your subscriptions and get email and SMS alerts before any auto-debit hits your bank account.",
      },
      { property: "og:title", content: "Sign in to Renewise" },
      {
        property: "og:description",
        content: "Sync subscriptions and enable real renewal alerts by email and SMS.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const { session } = useAuth();

  useEffect(() => {
    if (session) navigate({ to: "/settings" });
  }, [session, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success("Account created — you can enable alerts now");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Signed in");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Google sign-in failed");
      return;
    }
  };

  return (
    <main className="grid min-h-screen place-items-center px-4 py-12">
      <div className="glass w-full max-w-md rounded-3xl p-8">
        <div className="flex items-center gap-2">
          <span className="grid size-10 place-items-center rounded-xl bg-[image:var(--gradient-mint)] text-primary-foreground">
            <Waves className="size-5" />
          </span>
          <span className="font-display text-xl font-bold">Renewise</span>
        </div>
        <h1 className="mt-6 font-display text-2xl font-bold">
          {mode === "signin" ? "Welcome back" : "Create your vault"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sign in so Renewise can send real email and SMS alerts before an auto-debit hits your
          bank account.
        </p>

        <button
          type="button"
          onClick={google}
          className="mt-6 w-full rounded-2xl bg-surface-2 px-4 py-3 text-sm font-semibold transition-colors hover:bg-surface-2/70"
        >
          Continue with Google
        </button>

        <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> or email <span className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={submit} className="space-y-3">
          <label className="flex items-center gap-2 rounded-2xl bg-surface-2 px-4 py-3">
            <Mail className="size-4 text-muted-foreground" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@gmail.com"
              className="w-full bg-transparent text-sm outline-none"
            />
          </label>
          <label className="flex items-center gap-2 rounded-2xl bg-surface-2 px-4 py-3">
            <Lock className="size-4 text-muted-foreground" />
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-transparent text-sm outline-none"
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground disabled:opacity-60"
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : null}
            {mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-4 w-full text-xs text-muted-foreground hover:text-foreground"
        >
          {mode === "signin"
            ? "New here? Create an account"
            : "Already have an account? Sign in"}
        </button>
      </div>
    </main>
  );
}
