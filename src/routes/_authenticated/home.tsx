import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useMyProfile } from "@/lib/profile";

export const Route = createFileRoute("/_authenticated/home")({
  ssr: false,
  component: HomeRouter,
});

function HomeRouter() {
  const navigate = useNavigate();
  const { data: profile, isLoading } = useMyProfile();

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
      return;
    }
    navigate({
      to: profile.chosen_park === "lorenzi_park_lyons" ? "/park" : "/paseo-verde",
      replace: true,
    });
  }, [profile, isLoading, navigate]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <p className="font-display text-xs uppercase tracking-[0.3em] text-gold/70">Loading</p>
    </main>
  );
}
