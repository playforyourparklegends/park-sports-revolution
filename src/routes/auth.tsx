import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Member Access — Legends of Lorenzi Park" },
      {
        name: "description",
        content:
          "Sign in or create your Legends of Lorenzi Park member account to reach the Lorenzi Park Lyons team home.",
      },
      { property: "og:title", content: "Member Access — Legends of Lorenzi Park" },
      {
        property: "og:description",
        content:
          "Sign in or create your Legends of Lorenzi Park member account to reach the Lorenzi Park Lyons team home.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/home", replace: true });
    });
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);

    if (mode === "signup") {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: { display_name: displayName },
        },
      });
      if (signUpError) setError(signUpError.message);
      else if (data.session) navigate({ to: "/home", replace: true });
      else setMessage("Check your email to confirm your account, then sign in.");
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) setError(signInError.message);
      else navigate({ to: "/home", replace: true });
    }
    setBusy(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="card-metal-frame rounded-2xl p-[1px]">
          <div className="card-lacquer card-depth rounded-2xl px-6 py-8">
            <h1 className="font-display text-center text-2xl tracking-wide text-gold">
              Legends of the Park
            </h1>
            <p className="mt-2 text-center text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
              {mode === "signin" ? "Member Access" : "Claim Your Place"}
            </p>

            <form onSubmit={onSubmit} className="mt-8 space-y-4">
              {mode === "signup" && (
                <Field
                  label="Display name"
                  value={displayName}
                  onChange={setDisplayName}
                  type="text"
                  required
                />
              )}
              <Field label="Email" value={email} onChange={setEmail} type="email" required />
              <Field
                label="Password"
                value={password}
                onChange={setPassword}
                type="password"
                required
              />

              {error && <p className="text-xs text-destructive">{error}</p>}
              {message && <p className="text-xs text-gold">{message}</p>}

              <button
                type="submit"
                disabled={busy}
                className="mt-2 w-full rounded-md bg-gold px-4 py-3 font-display text-sm uppercase tracking-[0.2em] text-gold-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {busy ? "Please wait" : mode === "signin" ? "Enter" : "Create Account"}
              </button>
            </form>

            <button
              type="button"
              onClick={() => {
                setMode(mode === "signin" ? "signup" : "signin");
                setError(null);
                setMessage(null);
              }}
              className="mt-6 w-full text-center text-[11px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-gold"
            >
              {mode === "signin" ? "No account? Sign up" : "Already a member? Sign in"}
            </button>

            {import.meta.env.DEV && (
              <button
                type="button"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  setError(null);
                  setMessage(null);
                  const { error: devError } = await supabase.auth.signInWithPassword({
                    email: "dev@legendsofthepark.test",
                    password: "LegendsDev2026!",
                  });
                  if (devError) setError(devError.message);
                  else navigate({ to: "/home", replace: true });
                  setBusy(false);
                }}
                className="mt-4 w-full rounded-md border border-gold/30 px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-gold/70 transition-colors hover:border-gold hover:text-gold disabled:opacity-50"
              >
                Dev Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  type,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md border border-gold/30 bg-black px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-gold"
      />
    </label>
  );
}
