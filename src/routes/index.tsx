import { createFileRoute } from "@tanstack/react-router";
import { PlayerCarousel } from "@/components/PlayerCarousel";
import bg from "@/assets/lorenzi-park-hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lorenzi Park Lyons — Team Home" },
      {
        name: "description",
        content:
          "The Lorenzi Park Lyons team home: the lion mascot rising over the Lorenzi Park fountain, with the black-and-gold player card showcase.",
      },
      { property: "og:title", content: "Lorenzi Park Lyons — Team Home" },
      {
        property: "og:description",
        content:
          "The Lorenzi Park Lyons team home: the lion mascot rising over the Lorenzi Park fountain, with the black-and-gold player card showcase.",
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
        src={bg}
        width={1088}
        height={1920}
        alt="The Lorenzi Park Lyons lion mascot rising above the Lorenzi Park lake fountain at sunset"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-x-0 bottom-0 z-10 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <PlayerCarousel />
      </div>
    </main>
  );
}
