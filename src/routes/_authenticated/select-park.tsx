import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { PARK_NAMES, type ParkChoice, updateMyProfile, useMyProfile } from "@/lib/profile";

export const Route = createFileRoute("/_authenticated/select-park")({
  head: () => ({
    meta: [
      { title: "Choose Your Park — Legends of the Park" },
      {
        name: "description",
        content: "Pick your home park: the Lorenzi Park Lyons or the Paseo Verde Park Panthers.",
      },
      { property: "og:title", content: "Choose Your Park — Legends of the Park" },
      {
        property: "og:description",
        content: "Pick your home park: the Lorenzi Park Lyons or the Paseo Verde Park Panthers.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SelectPark,
});

const PARKS: ParkChoice[] = ["lorenzi_park_lyons", "paseo_verde_park_panthers"];

function SelectPark() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: profile } = useMyProfile();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function choose(park: ParkChoice) {
    setBusy(true);
    setError(null);
    try {
      await updateMyProfile({ chosen_park: park });
      await queryClient.invalidateQueries({ queryKey: ["my-profile"] });
      if (profile?.role && profile.role !== "fan") {
        navigate({ to: "/applications", replace: true });
      } else {
        navigate({
          to: park === "lorenzi_park_lyons" ? "/park" : "/paseo-verde",
          replace: true,
        });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="card-metal-frame rounded-2xl p-[1px]">
          <div className="card-lacquer card-depth rounded-2xl px-6 py-8">
            <h1 className="font-display text-center text-2xl tracking-wide text-gold">
              Choose your park
            </h1>
            <p className="mt-2 text-center text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
              Step Two of Two
            </p>

            <div className="mt-8 space-y-3">
              {PARKS.map((park) => (
                <button
                  key={park}
                  type="button"
                  disabled={busy}
                  onClick={() => choose(park)}
                  className="w-full rounded-md border border-gold/30 px-4 py-4 text-center font-display text-sm tracking-[0.14em] text-gold transition-colors hover:border-gold disabled:opacity-50"
                >
                  {PARK_NAMES[park]}
                </button>
              ))}
            </div>

            {error && <p className="mt-4 text-xs text-destructive">{error}</p>}
          </div>
        </div>
      </div>
    </main>
  );
}
