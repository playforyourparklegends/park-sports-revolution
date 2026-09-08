import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  ssr: false,
  component: Splash,
});

function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      navigate({ to: data.session ? "/home" : "/auth", replace: true });
    });
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-8 text-center">
      <h1 className="font-display text-3xl leading-tight tracking-wide text-gold">
        Legends of the Park
      </h1>
      <div className="mt-5 h-[1px] w-24 bg-gold/50" />
    </main>
  );
}
