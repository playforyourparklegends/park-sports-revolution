import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { type MemberRole, updateMyProfile } from "@/lib/profile";

export const Route = createFileRoute("/_authenticated/select-role")({
  head: () => ({
    meta: [
      { title: "Why Are You Here? — Legends of the Park" },
      {
        name: "description",
        content: "Choose your place in Legends of the Park: player, park ambassador, or fan.",
      },
      { property: "og:title", content: "Why Are You Here? — Legends of the Park" },
      {
        property: "og:description",
        content: "Choose your place in Legends of the Park: player, park ambassador, or fan.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SelectRole,
});

const OPTIONS: { role: MemberRole; label: string; note: string }[] = [
  { role: "player", label: "Apply to Play", note: "Take the field for your park" },
  { role: "ambassador", label: "Apply to be a Park Ambassador", note: "Carry your park's honor" },
  { role: "fan", label: "Just Here to Root", note: "Follow the legends" },
];

function SelectRole() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function choose(role: MemberRole) {
    setBusy(true);
    setError(null);
    try {
      await updateMyProfile({ role });
      await queryClient.invalidateQueries({ queryKey: ["my-profile"] });
      navigate({ to: "/select-park", replace: true });
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
              Why are you here?
            </h1>
            <p className="mt-2 text-center text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
              Step One of Two
            </p>

            <div className="mt-8 space-y-3">
              {OPTIONS.map((o) => (
                <button
                  key={o.role}
                  type="button"
                  disabled={busy}
                  onClick={() => choose(o.role)}
                  className="w-full rounded-md border border-gold/30 px-4 py-4 text-left transition-colors hover:border-gold disabled:opacity-50"
                >
                  <span className="block font-display text-sm tracking-[0.14em] text-gold">
                    {o.label}
                  </span>
                  <span className="mt-1 block text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    {o.note}
                  </span>
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
