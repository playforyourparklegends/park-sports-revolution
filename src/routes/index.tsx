import { createFileRoute } from "@tanstack/react-router";
import { PlayerCarousel } from "@/components/PlayerCarousel";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Legends of the Park — Player Cards" },
      {
        name: "description",
        content:
          "Swipe the Legends of the Park collector card showcase: black-and-gold player cards with flip-to-reveal detail.",
      },
      { property: "og:title", content: "Legends of the Park — Player Cards" },
      {
        property: "og:description",
        content:
          "Swipe the Legends of the Park collector card showcase: black-and-gold player cards with flip-to-reveal detail.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main
      className="min-h-screen bg-background"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <PlayerCarousel />
    </main>
  );
}
