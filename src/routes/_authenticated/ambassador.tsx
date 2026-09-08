import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { VideoRecorder } from "@/components/VideoRecorder";
import { AmbassadorCheckout } from "@/components/AmbassadorCheckout";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { getStripeEnvironment } from "@/lib/stripe";
import { supabase } from "@/integrations/supabase/client";
import { getMyApplication, submitApplication } from "@/lib/ambassador.functions";

export const Route = createFileRoute("/_authenticated/ambassador")({
  head: () => ({
    meta: [
      { title: "Become a Park Ambassador — Legends of Lorenzi Park" },
      {
        name: "description",
        content:
          "Apply to represent your park as a Legends of the Park Ambassador: share your day job and record a short video telling us why you can be trusted with the honor.",
      },
      {
        property: "og:title",
        content: "Become a Park Ambassador — Legends of Lorenzi Park",
      },
      {
        property: "og:description",
        content:
          "Apply to represent your park as a Legends of the Park Ambassador: share your day job and record a short video telling us why you can be trusted with the honor.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AmbassadorPage,
});

const PARKS = ["Lorenzi Park"];

function AmbassadorPage() {
  const fetchMine = useServerFn(getMyApplication);
  const { data, isLoading } = useQuery({
    queryKey: ["my-ambassador-application"],
    queryFn: () => fetchMine(),
  });

  return (
    <main className="min-h-screen bg-background pb-16">
      <PaymentTestModeBanner />
      <div className="mx-auto w-full max-w-md px-5 pt-6">
        <Link
          to="/park"
          className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:text-gold"
        >
          ← Team Home
        </Link>
        <h1 className="mt-5 font-display text-2xl tracking-wide text-gold">
          Become a Park Ambassador
        </h1>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          Ambassadors carry the honor of their park. Tell us who you are by day, then look the park
          in the eye and say why you can be trusted.
        </p>

        <div className="mt-7">
          {isLoading ? (
            <p className="text-xs text-muted-foreground">Loading…</p>
          ) : data ? (
            <StatusCard application={data} />
          ) : (
            <ApplicationForm />
          )}
        </div>
      </div>
    </main>
  );
}

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="card-metal-frame rounded-2xl p-[1px]">
      <div className="card-lacquer card-depth rounded-2xl px-5 py-6">{children}</div>
    </div>
  );
}

function StatusCard({
  application,
}: {
  application: NonNullable<Awaited<ReturnType<typeof getMyApplication>>>;
}) {
  const [showCheckout, setShowCheckout] = useState(false);
  const { data: membership } = useQuery({
    queryKey: ["ambassador-membership"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) return null;
      const { data } = await supabase
        .from("subscriptions")
        .select("status, current_period_end")
        .eq("user_id", uid)
        .eq("environment", getStripeEnvironment())
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data ?? null;
    },
    refetchInterval: showCheckout ? 4000 : false,
  });

  const isActive =
    membership != null &&
    ["active", "trialing", "past_due"].includes(membership.status) &&
    (!membership.current_period_end || new Date(membership.current_period_end) > new Date());

  const label =
    application.status === "approved"
      ? "Approved"
      : application.status === "rejected"
        ? "Not Accepted"
        : "Under Review";

  return (
    <Frame>
      <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Your Application</p>
      <p className="mt-3 font-display text-xl text-gold">{label}</p>
      <dl className="mt-4 space-y-2 text-xs text-muted-foreground">
        <div>
          <dt className="inline uppercase tracking-[0.18em]">Park: </dt>
          <dd className="inline text-foreground">{application.park}</dd>
        </div>
        <div>
          <dt className="inline uppercase tracking-[0.18em]">Day job: </dt>
          <dd className="inline text-foreground">{application.day_job_title}</dd>
        </div>
        <div>
          <dt className="inline uppercase tracking-[0.18em]">Submitted: </dt>
          <dd className="inline text-foreground">
            {new Date(application.submitted_at).toLocaleDateString()}
          </dd>
        </div>
      </dl>
      {application.reviewer_note && (
        <p className="mt-4 border-l border-gold/30 pl-3 text-xs italic text-muted-foreground">
          {application.reviewer_note}
        </p>
      )}

      {application.status === "approved" && isActive && (
        <p className="mt-6 font-display text-sm tracking-[0.16em] text-gold">
          Ambassador Active — $25 / month
        </p>
      )}

      {application.status === "approved" && !isActive && (
        <div className="mt-6">
          {showCheckout ? (
            <AmbassadorCheckout />
          ) : (
            <button
              type="button"
              onClick={() => setShowCheckout(true)}
              className="w-full rounded-md bg-gold px-4 py-3 font-display text-xs uppercase tracking-[0.2em] text-gold-foreground transition-opacity hover:opacity-90"
            >
              Activate Ambassador — $25 / month
            </button>
          )}
        </div>
      )}
      {application.status === "pending" && (
        <p className="mt-6 text-xs text-muted-foreground">
          Activation opens once your application is approved.
        </p>
      )}
    </Frame>
  );
}

function ApplicationForm() {
  const queryClient = useQueryClient();
  const submit = useServerFn(submitApplication);
  const [park, setPark] = useState(PARKS[0]!);
  const [dayJob, setDayJob] = useState("");
  const [why, setWhy] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [video, setVideo] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!video) {
      setError("Please record your video before submitting.");
      return;
    }
    setBusy(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) throw new Error("Your session expired. Please sign in again.");

      const stamp = Date.now();
      const videoPath = `${uid}/${stamp}-why-trust-me.webm`;
      const up = await supabase.storage
        .from("ambassador-videos")
        .upload(videoPath, video, { contentType: video.type || "video/webm" });
      if (up.error) throw new Error(up.error.message);

      let photoPath: string | null = null;
      if (photo) {
        const ext = photo.name.split(".").pop() || "jpg";
        photoPath = `${uid}/${stamp}-day-job.${ext}`;
        const pu = await supabase.storage
          .from("ambassador-videos")
          .upload(photoPath, photo, { contentType: photo.type });
        if (pu.error) throw new Error(pu.error.message);
      }

      await submit({
        data: { park, dayJobTitle: dayJob, dayJobPhotoPath: photoPath, videoPath, whyTrustMeText: why },
      });
      await queryClient.invalidateQueries({ queryKey: ["my-ambassador-application"] });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Frame>
      <form onSubmit={onSubmit} className="space-y-5">
        <label className="block">
          <span className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Park</span>
          <select
            value={park}
            onChange={(e) => setPark(e.target.value)}
            className="mt-1 w-full rounded-md border border-gold/30 bg-black px-3 py-2 text-sm text-foreground outline-none focus:border-gold"
          >
            {PARKS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            Day-job title
          </span>
          <input
            type="text"
            required
            value={dayJob}
            onChange={(e) => setDayJob(e.target.value)}
            placeholder="Electrician, Nurse, Line Cook…"
            className="mt-1 w-full rounded-md border border-gold/30 bg-black px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground/60 focus:border-gold"
          />
        </label>

        <label className="block">
          <span className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            Day-job photo (optional)
          </span>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
            className="mt-1 w-full rounded-md border border-gold/30 bg-black px-3 py-2 text-xs text-muted-foreground outline-none focus:border-gold"
          />
        </label>

        <label className="block">
          <span className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            Why the park should trust you
          </span>
          <textarea
            rows={4}
            value={why}
            onChange={(e) => setWhy(e.target.value)}
            className="mt-1 w-full rounded-md border border-gold/30 bg-black px-3 py-2 text-sm text-foreground outline-none focus:border-gold"
          />
        </label>

        <div>
          <span className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            Your video
          </span>
          <div className="mt-2">
            <VideoRecorder onRecorded={setVideo} />
          </div>
        </div>

        {error && <p className="text-xs text-destructive">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-md bg-gold px-4 py-3 font-display text-sm uppercase tracking-[0.2em] text-gold-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {busy ? "Submitting…" : "Submit Application"}
        </button>
      </form>
    </Frame>
  );
}
