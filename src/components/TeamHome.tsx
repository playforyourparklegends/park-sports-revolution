import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { PlayerCarousel } from "@/components/PlayerCarousel";
import { BottomTabs } from "@/components/BottomTabs";
import { supabase } from "@/integrations/supabase/client";
import type { ParkRecord } from "@/lib/parks.functions";
import lorenziMonument from "@/assets/lorenzi-park-monument.jpg";
import paseoVerdeMonument from "@/assets/paseo-verde-park-monument.jpg";

type ParkVisual = { src: string; alt: string };

const PARK_VISUALS: Record<string, ParkVisual> = {
  lorenzi_park_lyons: {
    src: lorenziMonument,
    alt: "A distant translucent bronze-gold apparition of a Legends of Lorenzi Park champion, visible from the waist up near the Spring Mountains behind Lorenzi Park at sunset",
  },
  paseo_verde_park_panthers: {
    src: paseoVerdeMonument,
    alt: "A distant translucent bronze-gold apparition of a Legends of Paseo Verde Park champion above the McCullough Range behind Paseo Verde Park in Henderson at sunset",
  },
};

export function TeamHome({ park }: { park: ParkRecord }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const visual = PARK_VISUALS[park.slug];

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const comingSoon = park.status === "coming_soon";

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      {visual && (
        <img
          src={visual.src}
          width={768}
          height={1376}
          alt={visual.alt}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      <button
        type="button"
        onClick={signOut}
        aria-label="Sign out"
        className="absolute right-3 top-[max(0.75rem,env(safe-area-inset-top))] z-20 rounded-full bg-black/40 p-2 text-gold/70 transition-colors hover:text-gold"
      >
        <LogOut className="h-4 w-4" />
      </button>

      <div className="absolute inset-x-0 bottom-0 z-10 pb-[calc(3.75rem+max(0.25rem,env(safe-area-inset-bottom)))]">
        {comingSoon ? (
          <div className="mx-auto w-full max-w-md px-8 pb-6 text-center">
            <h1 className="font-display text-3xl leading-tight tracking-wide text-gold drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]">
              {park.display_name}
            </h1>
            <div className="mx-auto mt-5 h-[1px] w-24 bg-gold/50" />
            <p className="mt-5 font-display text-sm uppercase tracking-[0.34em] text-foreground/80 drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
              Coming Soon
            </p>
          </div>
        ) : (
          <PlayerCarousel />
        )}
      </div>

      <BottomTabs />
    </main>
  );
}

export function TeamHomeFallback({ slug }: { slug: string }) {
  const visual = PARK_VISUALS[slug];
  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      {visual && (
        <img
          src={visual.src}
          width={768}
          height={1376}
          alt={visual.alt}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      <BottomTabs />
    </main>
  );
}
