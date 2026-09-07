import { createFileRoute } from "@tanstack/react-router";
import { PlayerCarousel } from "@/components/PlayerCarousel";
import monument from "@/assets/lorenzi-park-monument.jpg.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Legends of Lorenzi Park — Team Home" },
      {
        name: "description",
        content:
          "The Legends of Lorenzi Park team home: the bronze champion monument rising from the Lorenzi Park lake, with the black-and-gold player card showcase.",
      },
      { property: "og:title", content: "Legends of Lorenzi Park — Team Home" },
      {
        property: "og:description",
        content:
          "The Legends of Lorenzi Park team home: the bronze champion monument rising from the Lorenzi Park lake, with the black-and-gold player card showcase.",
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
        src={monument.url}
        width={768}
        height={1376}
        alt="A colossal bronze statue of a Legends of Lorenzi Park champion rising from the Lorenzi Park lake at sunset"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-x-0 bottom-0 z-10 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <PlayerCarousel />
      </div>
    </main>
  );
}
