import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    throw redirect({ to: data.session ? "/home" : "/auth", replace: true });
  },
  component: Splash,
});

function Splash() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-8 text-center">
      <h1 className="font-display text-3xl leading-tight tracking-wide text-gold">
        Legends of the Park
      </h1>
      <div className="mt-5 h-[1px] w-24 bg-gold/50" />
    </main>
  );
}
