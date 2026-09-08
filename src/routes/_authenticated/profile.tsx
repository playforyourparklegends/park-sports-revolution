import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { BottomTabs } from "@/components/BottomTabs";
import { supabase } from "@/integrations/supabase/client";
import { PARK_NAMES, ROLE_LABELS, useMyProfile } from "@/lib/profile";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Your Profile — Legends of the Park" },
      {
        name: "description",
        content: "Your Legends of the Park member profile: name, standing, and home park.",
      },
      { property: "og:title", content: "Your Profile — Legends of the Park" },
      {
        property: "og:description",
        content: "Your Legends of the Park member profile: name, standing, and home park.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProfilePage;
});

function ProfilePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useMyProfile();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <main className="min-h-screen bg-background px-6 pb-28 pt-[max(2rem,env(safe-area-inset-top))]">
      <h1 className="text-center font-display text-2xl tracking-wide text-gold">Profile</h1>

      <div className="mx-auto mt-8 w-full max-w-sm">
        <div className="card-metal-frame rounded-2xl p-[1px]">
          <div className="card-lacquer card-depth rounded-2xl px-6 py-8">
            {isLoading ? (
              <p className="text-center text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
                Loading
              </p>
            ) : (
              <>
                <p className="text-center font-display text-xl tracking-wide text-foreground">
                  {profile?.display_name || "Member"}
                </p>
                {profile?.email && (
                  <p className="mt-1 text-center text-[11px] tracking-[0.12em] text-muted-foreground">
                    {profile.email}
                  </p>
                )}

                <div className="mt-6 flex justify-center">
                  <span className="rounded-full border border-gold/40 px-4 py-1 font-display text-[10px] uppercase tracking-[0.24em] text-gold">
                    {profile?.role ? ROLE_LABELS[profile.role] : "Role Not Chosen"}
                  </span>
                </div>

                <div className="mt-8 border-t border-gold/15 pt-6 text-center">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                    Home Park
                  </p>
                  <p className="mt-2 font-display text-sm tracking-[0.14em] text-gold">
                    {profile?.chosen_park ? PARK_NAMES[profile.chosen_park] : "Not Chosen"}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={signOut}
          className="mt-8 w-full rounded-md border border-gold/30 px-4 py-3 font-display text-[11px] uppercase tracking-[0.22em] text-gold/80 transition-colors hover:border-gold hover:text-gold"
        >
          Sign Out
        </button>
      </div>

      <BottomTabs />
    </main>
  );
}
