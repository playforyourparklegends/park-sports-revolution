import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { TeamHome, TeamHomeFallback } from "@/components/TeamHome";
import { getParkBySlug } from "@/lib/parks.functions";

const SLUG = "paseo_verde_park_panthers";

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
  const fetchPark = useServerFn(getParkBySlug);
  const { data: park } = useQuery({
    queryKey: ["park", SLUG],
    queryFn: () => fetchPark({ data: { slug: SLUG } }),
  });

  if (!park) return <TeamHomeFallback slug={SLUG} />;
  return <TeamHome park={park} />;
}

