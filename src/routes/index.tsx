import { createFileRoute } from "@tanstack/react-router";
import { PlayerCarousel } from "@/components/PlayerCarousel";
import monument from "@/assets/lorenzi-park-monument.jpg";

export const Route = createFileRoute("/")({
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
  component: Index,
});

function Index() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <img
        src={monument}
        width={768}
        height={1376}
        alt="A distant translucent bronze-gold apparition of a Legends of Lorenzi Park champion, visible from the waist up near the Spring Mountains behind Lorenzi Park at sunset"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-x-0 bottom-0 z-10 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <PlayerCarousel />
      </div>
    </main>
  );
}
