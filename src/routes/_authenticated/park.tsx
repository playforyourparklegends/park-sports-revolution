import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { TeamHome, TeamHomeFallback } from "@/components/TeamHome";
import { getParkBySlug } from "@/lib/parks.functions";

const SLUG = "lorenzi_park_lyons";

export const Route = createFileRoute("/_authenticated/park")({
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
  component: ParkHome,
});

function ParkHome() {
  const fetchPark = useServerFn(getParkBySlug);
  const { data: park } = useQuery({
    queryKey: ["park", SLUG],
    queryFn: () => fetchPark({ data: { slug: SLUG } }),
  });

  if (!park) return <TeamHomeFallback slug={SLUG} />;
  return <TeamHome park={park} />;
}
