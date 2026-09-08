import { createFileRoute } from "@tanstack/react-router";
import { BottomTabs } from "@/components/BottomTabs";

export const Route = createFileRoute("/_authenticated/paseo-verde")({
  head: () => ({
    meta: [
      { title: "Paseo Verde Park Panthers — Coming Soon" },
      {
        name: "description",
        content:
          "The Paseo Verde Park Panthers team home is being built. Your place is reserved for opening day.",
      },
      { property: "og:title", content: "Paseo Verde Park Panthers — Coming Soon" },
      {
        property: "og:description",
        content:
          "The Paseo Verde Park Panthers team home is being built. Your place is reserved for opening day.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PaseoVerde,
});

function PaseoVerde() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-8 pb-24 text-center">
      <h1 className="font-display text-3xl leading-tight tracking-wide text-gold">
        Paseo Verde Park Panthers
      </h1>
      <div className="mt-6 h-[1px] w-24 bg-gold/40" />
      <p className="mt-6 font-display text-sm uppercase tracking-[0.34em] text-muted-foreground">
        Coming Soon
      </p>
      <BottomTabs />
    </main>
  );
}
