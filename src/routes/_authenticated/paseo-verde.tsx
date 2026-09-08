import { createFileRoute } from "@tanstack/react-router";
import { BottomTabs } from "@/components/BottomTabs";
import monument from "@/assets/paseo-verde-park-monument.jpg";

export const Route = createFileRoute("/_authenticated/paseo-verde")({
  head: () => ({
    meta: [
      { title: "Paseo Verde Park Panthers — Coming Soon" },
      {
        name: "description",
        content:
          "The Paseo Verde Park Panthers team home is being built: a bronze champion apparition watches over Paseo Verde Park at sunset. Your place is reserved for opening day.",
      },
      { property: "og:title", content: "Paseo Verde Park Panthers — Coming Soon" },
      {
        property: "og:description",
        content:
          "The Paseo Verde Park Panthers team home is being built: a bronze champion apparition watches over Paseo Verde Park at sunset. Your place is reserved for opening day.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PaseoVerde,
});

function PaseoVerde() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <img
        src={monument}
        width={768}
        height={1376}
        alt="A distant translucent bronze-gold apparition of a Legends of Paseo Verde Park champion above the McCullough Range behind Paseo Verde Park in Henderson at sunset"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-x-0 bottom-0 z-10 pb-[calc(3.75rem+max(0.25rem,env(safe-area-inset-bottom)))]">
        <div className="mx-auto w-full max-w-md px-8 pb-6 text-center">
          <h1 className="font-display text-3xl leading-tight tracking-wide text-gold drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]">
            Paseo Verde Park Panthers
          </h1>
          <div className="mx-auto mt-5 h-[1px] w-24 bg-gold/50" />
          <p className="mt-5 font-display text-sm uppercase tracking-[0.34em] text-foreground/80 drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
            Coming Soon
          </p>
        </div>
      </div>

      <BottomTabs />
    </main>
  );
}

