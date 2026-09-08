import { createFileRoute } from "@tanstack/react-router";
import { BottomTabs } from "@/components/BottomTabs";
import { PARK_NAMES, ROLE_LABELS, useMyProfile } from "@/lib/profile";

export const Route = createFileRoute("/_authenticated/applications")({
  head: () => ({
    meta: [
      { title: "Applications Opening Soon — Legends of the Park" },
      {
        name: "description",
        content:
          "Player and Park Ambassador applications open soon. Your intent is recorded for your home park.",
      },
      { property: "og:title", content: "Applications Opening Soon — Legends of the Park" },
      {
        property: "og:description",
        content:
          "Player and Park Ambassador applications open soon. Your intent is recorded for your home park.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ApplicationsSoon,
});

function ApplicationsSoon() {
  const { data: profile } = useMyProfile();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-8 pb-24 text-center">
      <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
        {profile?.role ? ROLE_LABELS[profile.role] : "Member"}
      </p>
      <h1 className="mt-4 font-display text-3xl leading-tight tracking-wide text-gold">
        Applications Opening Soon
      </h1>
      <div className="mt-6 h-[1px] w-24 bg-gold/40" />
      <p className="mt-6 max-w-xs text-xs leading-relaxed text-muted-foreground">
        Your intent has been recorded for{" "}
        {profile?.chosen_park ? PARK_NAMES[profile.chosen_park] : "your park"}. We will open the
        selection process here shortly.
      </p>
      <BottomTabs />
    </main>
  );
}
