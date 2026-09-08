import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { PlayerCarousel } from "@/components/PlayerCarousel";
import { ParkAmbassadorsTitle } from "@/components/ParkAmbassadorsTitle";
import { BottomTabs } from "@/components/BottomTabs";
import { supabase } from "@/integrations/supabase/client";
import monument from "@/assets/lorenzi-park-monument.jpg";

export const Route = createFileRoute("/_authenticated/park")({
  head: () => ({
    meta: [
      { title: "Legends of Lorenzi Park — Team Home" },
      {
        name: "description",
        content:
          "The Legends of Lorenzi Park team home: a ghostly bronze champion monument watching over Lorenzi Park from the horizon, with the black-and-gold player card showcase.",
      },
      { property: "og:title", content: "Legends of Lorenzi Park — Team Home" },
      {
        property: "og:description",
        content:
          "The Legends of Lorenzi Park team home: a ghostly bronze champion monument watching over Lorenzi Park from the horizon, with the black-and-gold player card showcase.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ParkHome,
});

function ParkHome() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <img
        src={monument}
        width={768}
        height={1376}
        alt="A distant translucent bronze-gold apparition of a Legends of Lorenzi Park champion, visible from the waist up near the Spring Mountains behind Lorenzi Park at sunset"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <button
        type="button"
        onClick={signOut}
        aria-label="Sign out"
        className="absolute right-3 top-[max(0.75rem,env(safe-area-inset-top))] z-20 rounded-full bg-black/40 p-2 text-gold/70 transition-colors hover:text-gold"
      >
        <LogOut className="h-4 w-4" />
      </button>
      <div className="absolute inset-x-0 bottom-0 z-10 pb-[calc(3.75rem+max(0.25rem,env(safe-area-inset-bottom)))]">
        <PlayerCarousel />
        <ParkAmbassadorsTitle />
        <div className="mt-1 text-center">
          <Link
            to="/ambassador"
            className="text-[9px] uppercase tracking-[0.28em] text-gold/70 transition-colors hover:text-gold"
          >
            Become a Park Ambassador
          </Link>
        </div>
      </div>

      <BottomTabs />
    </main>
  );
}
