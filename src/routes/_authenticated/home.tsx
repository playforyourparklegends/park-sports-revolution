import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Flag, Shield, User } from "lucide-react";
import { BottomTabs } from "@/components/BottomTabs";
import { useMyProfile } from "@/lib/profile";
import { getParkBySlug } from "@/lib/parks.functions";

export const Route = createFileRoute("/_authenticated/home")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Home — Legends of the Park" },
      {
        name: "description",
        content: "Your Legends of the Park home: your team, your profile, and the Park Ambassadors.",
      },
      { property: "og:title", content: "Home — Legends of the Park" },
      {
        property: "og:description",
        content: "Your Legends of the Park home: your team, your profile, and the Park Ambassadors.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomeRouter,
});

function HomeRouter() {
  const navigate = useNavigate();
  const { data: profile, isLoading } = useMyProfile();

  const needsRedirect =
    !isLoading && profile && (!profile.role || !profile.chosen_park || profile.role !== "fan");

  useEffect(() => {
    if (isLoading || !profile) return;
    if (!profile.role) {
      navigate({ to: "/select-role", replace: true });
      return;
    }
    if (!profile.chosen_park) {
      navigate({ to: "/select-park", replace: true });
      return;
    }
    if (profile.role !== "fan") {
      navigate({ to: "/applications", replace: true });
    }
  }, [profile, isLoading, navigate]);

  if (isLoading || !profile || needsRedirect) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <p className="font-display text-xs uppercase tracking-[0.3em] text-gold/70">Loading</p>
      </main>
    );
  }

  return <FanDashboard chosenPark={profile.chosen_park!} />;
}

function FanDashboard({ chosenPark }: { chosenPark: string }) {
  const fetchPark = useServerFn(getParkBySlug);
  const { data: park, isLoading } = useQuery({
    queryKey: ["park", chosenPark],
    queryFn: () => fetchPark({ data: { slug: chosenPark } }),
  });

  const teamTo = chosenPark === "lorenzi_park_lyons" ? "/park" : "/paseo-verde";

  return (
    <main className="min-h-screen bg-background pb-24">
      <div className="mx-auto w-full max-w-md px-6 pt-12 text-center">
        <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          Legends of the Park
        </p>
        <h1 className="mt-4 font-display text-3xl leading-tight tracking-wide text-gold">
          {isLoading ? (
            <span className="inline-block h-8 w-48 animate-pulse rounded bg-gold/20" />
          ) : (
            (park?.display_name ?? "Your Park")
          )}
        </h1>
        <div className="mx-auto mt-5 h-[1px] w-24 bg-gold/50" />
        <p className="mt-5 font-display text-xs uppercase tracking-[0.3em] text-foreground/70">
          Regular Season
        </p>

        <div className="mt-10 grid gap-4">
          <QuickLink
            to={teamTo}
            icon={<Flag className="h-4 w-4" />}
            title="View My Team"
            detail="Your park's team home"
          />
          <QuickLink
            to="/profile"
            icon={<User className="h-4 w-4" />}
            title="My Profile"
            detail="Your membership details"
          />
          <QuickLink
            to="/ambassador"
            icon={<Shield className="h-4 w-4" />}
            title="Park Ambassadors"
            detail="Represent your park"
          />
        </div>
      </div>
      <BottomTabs />
    </main>
  );
}

function QuickLink({
  to,
  icon,
  title,
  detail,
}: {
  to: "/park" | "/paseo-verde" | "/profile" | "/ambassador";
  icon: React.ReactNode;
  title: string;
  detail: string;
}) {
  return (
    <Link
      to={to}
      className="card-metal-frame flex items-center gap-4 rounded-xl p-[1px] text-left transition-opacity hover:opacity-90"
    >
      <div className="card-lacquer flex w-full items-center gap-4 rounded-[inherit] px-5 py-4">
        <span className="text-gold/80">{icon}</span>
        <span>
          <span className="block font-display text-sm uppercase tracking-[0.22em] text-gold">
            {title}
          </span>
          <span className="mt-1 block text-[11px] text-muted-foreground">{detail}</span>
        </span>
      </div>
    </Link>
  );
}
