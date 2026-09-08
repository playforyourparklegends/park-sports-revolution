import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import {
  amIAdmin,
  listApplicationsForReview,
  reviewApplication,
  type ReviewItem,
} from "@/lib/ambassador.functions";

export const Route = createFileRoute("/_authenticated/review")({
  head: () => ({
    meta: [
      { title: "Ambassador Review Queue — Legends of the Park" },
      {
        name: "description",
        content:
          "Owner-only review queue for Park Ambassador applications: watch each applicant's video, read their day-job details, then approve or decline.",
      },
      { property: "og:title", content: "Ambassador Review Queue — Legends of the Park" },
      {
        property: "og:description",
        content:
          "Owner-only review queue for Park Ambassador applications: watch each applicant's video, read their day-job details, then approve or decline.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReviewPage,
});

function ReviewPage() {
  const navigate = useNavigate();
  const checkAdmin = useServerFn(amIAdmin);
  const fetchList = useServerFn(listApplicationsForReview);

  const admin = useQuery({ queryKey: ["am-i-admin"], queryFn: () => checkAdmin() });
  const list = useQuery({
    queryKey: ["ambassador-review-queue"],
    queryFn: () => fetchList(),
    enabled: admin.data?.isAdmin === true,
  });

  useEffect(() => {
    if (admin.data && !admin.data.isAdmin) navigate({ to: "/park", replace: true });
  }, [admin.data, navigate]);

  if (admin.isLoading) return <Shell>Loading…</Shell>;
  if (!admin.data?.isAdmin) return <Shell>Not authorized.</Shell>;

  const pending = (list.data ?? []).filter((a) => a.status === "pending");
  const reviewed = (list.data ?? []).filter((a) => a.status !== "pending");

  return (
    <Shell>
      <h1 className="font-display text-2xl tracking-wide text-gold">Ambassador Review</h1>
      <p className="mt-2 text-xs text-muted-foreground">
        {pending.length} pending application{pending.length === 1 ? "" : "s"}
      </p>
      <div className="mt-6 space-y-5">
        {pending.map((a) => (
          <ReviewCard key={a.id} item={a} />
        ))}
        {pending.length === 0 && (
          <p className="text-xs text-muted-foreground">Nothing waiting on you.</p>
        )}
        {reviewed.length > 0 && (
          <div className="pt-4">
            <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Decided</p>
            <div className="mt-3 space-y-2">
              {reviewed.map((a) => (
                <p key={a.id} className="text-xs text-muted-foreground">
                  <span className="text-foreground">{a.applicantName}</span> — {a.park} —{" "}
                  <span className="text-gold">{a.status}</span>
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-background px-5 pb-16 pt-[max(1.5rem,env(safe-area-inset-top))]">
      <div className="mx-auto w-full max-w-md">
        <Link
          to="/park"
          className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:text-gold"
        >
          ← Team Home
        </Link>
        <div className="mt-5">{children}</div>
      </div>
    </main>
  );
}

function ReviewCard({ item }: { item: ReviewItem }) {
  const queryClient = useQueryClient();
  const review = useServerFn(reviewApplication);
  const [note, setNote] = useState("");
  const decide = useMutation({
    mutationFn: (decision: "approved" | "rejected") =>
      review({ data: { id: item.id, decision, note: note || undefined } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ambassador-review-queue"] }),
  });

  return (
    <div className="card-metal-frame rounded-2xl p-[1px]">
      <div className="card-lacquer card-depth space-y-4 rounded-2xl px-4 py-5">
        <div>
          <p className="font-display text-lg text-gold">{item.applicantName}</p>
          <p className="text-xs text-muted-foreground">
            {item.park} · {item.day_job_title}
          </p>
        </div>

        {item.videoUrl && (
          <video
            src={item.videoUrl}
            controls
            playsInline
            className="aspect-3/4 w-full rounded-lg bg-black object-cover"
          />
        )}
        {item.photoUrl && (
          <img
            src={item.photoUrl}
            alt={`${item.applicantName} at their day job as a ${item.day_job_title}`}
            className="h-28 w-full rounded-lg object-cover"
          />
        )}
        {item.why_trust_me_text && (
          <p className="text-xs leading-relaxed text-muted-foreground">{item.why_trust_me_text}</p>
        )}

        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Optional note"
          className="w-full rounded-md border border-gold/30 bg-black px-3 py-2 text-xs text-foreground outline-none placeholder:text-muted-foreground/60 focus:border-gold"
        />

        <div className="flex gap-2">
          <button
            type="button"
            disabled={decide.isPending}
            onClick={() => decide.mutate("approved")}
            className="flex-1 rounded-md bg-gold px-3 py-2 font-display text-[11px] uppercase tracking-[0.2em] text-gold-foreground disabled:opacity-50"
          >
            Approve
          </button>
          <button
            type="button"
            disabled={decide.isPending}
            onClick={() => decide.mutate("rejected")}
            className="flex-1 rounded-md border border-gold/30 px-3 py-2 font-display text-[11px] uppercase tracking-[0.2em] text-gold/80 disabled:opacity-50"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}
