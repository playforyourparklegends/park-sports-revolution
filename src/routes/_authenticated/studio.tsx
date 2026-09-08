import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { BottomTabs } from "@/components/BottomTabs";
import { amIAdmin } from "@/lib/ambassador.functions";
import { IMAGE_PRESET_LIST, type ImagePresetId } from "@/lib/image-presets";
import { generatePresetImage } from "@/lib/streamImage";

export const Route = createFileRoute("/_authenticated/studio")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Image Studio — Legends of the Park" },
      {
        name: "description",
        content:
          "Owner-only image studio: pick a hero or poster recipe, describe the scene, and generate on-brand Legends of the Park artwork.",
      },
      { property: "og:title", content: "Image Studio — Legends of the Park" },
      {
        property: "og:description",
        content:
          "Owner-only image studio: pick a hero or poster recipe, describe the scene, and generate on-brand Legends of the Park artwork.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StudioPage,
});

function StudioPage() {
  const navigate = useNavigate();
  const checkAdmin = useServerFn(amIAdmin);
  const admin = useQuery({ queryKey: ["am-i-admin"], queryFn: () => checkAdmin() });

  const [preset, setPreset] = useState<ImagePresetId>("hero");
  const [subject, setSubject] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [isFinal, setIsFinal] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastRun = useRef<{ preset: ImagePresetId; subject: string } | null>(null);

  useEffect(() => {
    if (admin.data && !admin.data.isAdmin) navigate({ to: "/home", replace: true });
  }, [admin.data, navigate]);

  async function run(next: { preset: ImagePresetId; subject: string }) {
    if (!next.subject.trim() || busy) return;
    lastRun.current = next;
    setBusy(true);
    setError(null);
    setImage(null);
    setIsFinal(false);
    try {
      await generatePresetImage(next.preset, { subject: next.subject }, (dataUrl, final) => {
        setImage(dataUrl);
        setIsFinal(final);
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong generating that image.");
    } finally {
      setBusy(false);
    }
  }

  if (admin.isLoading) return <Shell>Loading…</Shell>;
  if (!admin.data?.isAdmin) return <Shell>Not authorized.</Shell>;

  const active = IMAGE_PRESET_LIST.find((p) => p.id === preset)!;

  return (
    <Shell>
      <h1 className="text-center font-display text-2xl tracking-wide text-gold">Image Studio</h1>
      <p className="mx-auto mt-2 max-w-sm text-center text-[11px] leading-relaxed tracking-[0.12em] text-muted-foreground">
        Choose a format, describe the scene, and the house style is applied for you.
      </p>

      <div className="mx-auto mt-8 w-full max-w-sm space-y-6">
        <div className="grid grid-cols-2 gap-3">
          {IMAGE_PRESET_LIST.map((p) => {
            const selected = p.id === preset;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setPreset(p.id)}
                aria-pressed={selected}
                className={`rounded-xl border px-3 py-4 text-left transition-colors ${
                  selected
                    ? "border-gold bg-card-lift text-gold"
                    : "border-gold/25 text-muted-foreground hover:border-gold/60"
                }`}
              >
                <span className="block font-display text-[11px] uppercase tracking-[0.2em]">
                  {p.label.split("—")[0]?.trim()}
                </span>
                <span className="mt-1 block text-[10px] tracking-[0.1em]">
                  {p.size.width}×{p.size.height}
                </span>
              </button>
            );
          })}
        </div>

        <p className="text-[10px] leading-relaxed tracking-[0.08em] text-muted-foreground">
          {active.purpose}
        </p>

        <div>
          <label
            htmlFor="scene"
            className="block font-display text-[10px] uppercase tracking-[0.26em] text-gold/80"
          >
            Scene
          </label>
          <textarea
            id="scene"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            rows={4}
            placeholder="A translucent bronze champion above Lorenzi Park at sunset…"
            className="mt-2 w-full resize-none rounded-md border border-gold/25 bg-card px-3 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none"
          />
        </div>

        <button
          type="button"
          disabled={busy || !subject.trim()}
          onClick={() => run({ preset, subject })}
          className="w-full rounded-md border border-gold/40 px-4 py-3 font-display text-[11px] uppercase tracking-[0.22em] text-gold transition-colors hover:border-gold disabled:opacity-40"
        >
          {busy ? "Generating…" : "Generate"}
        </button>

        {error && (
          <p className="rounded-md border border-destructive/50 px-3 py-3 text-[11px] leading-relaxed text-destructive">
            {error}
          </p>
        )}

        {(image || busy) && (
          <div className="card-metal-frame rounded-2xl p-[1px]">
            <div className="card-lacquer card-depth overflow-hidden rounded-2xl p-3">
              <div
                className="flex items-center justify-center overflow-hidden rounded-xl bg-background"
                style={{ aspectRatio: `${active.size.width} / ${active.size.height}` }}
              >
                {image ? (
                  <img
                    src={image}
                    alt={`Generated ${active.label} artwork: ${subject}`}
                    className={`h-full w-full object-cover transition-[filter] duration-500 ${
                      isFinal ? "blur-0" : "blur-lg"
                    }`}
                  />
                ) : (
                  <span className="text-[10px] uppercase tracking-[0.26em] text-muted-foreground">
                    Rendering
                  </span>
                )}
              </div>

              {image && isFinal && (
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <a
                    href={image}
                    download={`legends-${preset}.png`}
                    className="rounded-md border border-gold/40 px-3 py-2.5 text-center font-display text-[10px] uppercase tracking-[0.2em] text-gold transition-colors hover:border-gold"
                  >
                    Download
                  </a>
                  <button
                    type="button"
                    onClick={() => lastRun.current && run(lastRun.current)}
                    className="rounded-md border border-gold/25 px-3 py-2.5 font-display text-[10px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:border-gold hover:text-gold"
                  >
                    Regenerate
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-background px-6 pb-28 pt-[max(2rem,env(safe-area-inset-top))]">
      {children}
      <BottomTabs />
    </main>
  );
}
