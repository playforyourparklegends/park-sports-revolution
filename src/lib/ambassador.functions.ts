import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type ApplicationStatus = "pending" | "approved" | "rejected";

export type MyApplication = {
  id: string;
  park: string;
  day_job_title: string;
  status: ApplicationStatus;
  submitted_at: string;
  reviewed_at: string | null;
  reviewer_note: string | null;
};

export const getMyApplication = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<MyApplication | null> => {
    const { data, error } = await context.supabase
      .from("ambassador_applications")
      .select("id, park, day_job_title, status, submitted_at, reviewed_at, reviewer_note")
      .eq("user_id", context.userId)
      .order("submitted_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (data as MyApplication | null) ?? null;
  });

export const submitApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        park: z.string().min(2).max(120),
        dayJobTitle: z.string().min(2).max(120),
        dayJobPhotoPath: z.string().max(400).nullable().optional(),
        videoPath: z.string().min(3).max(400),
        whyTrustMeText: z.string().max(1000).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const prefix = `${context.userId}/`;
    if (!data.videoPath.startsWith(prefix)) throw new Error("Invalid video path");
    if (data.dayJobPhotoPath && !data.dayJobPhotoPath.startsWith(prefix)) {
      throw new Error("Invalid photo path");
    }

    const { error } = await context.supabase.from("ambassador_applications").insert({
      user_id: context.userId,
      park: data.park,
      day_job_title: data.dayJobTitle,
      day_job_photo_url: data.dayJobPhotoPath ?? null,
      why_trust_me_video_url: data.videoPath,
      why_trust_me_text: data.whyTrustMeText ?? null,
      status: "pending",
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

async function assertAdmin(supabase: {
  from: (t: "profiles") => {
    select: (c: "is_admin") => {
      eq: (
        c: "id",
        v: string,
      ) => { maybeSingle: () => Promise<{ data: { is_admin: boolean } | null }> };
    };
  };
}, userId: string) {
  const { data } = await supabase.from("profiles").select("is_admin").eq("id", userId).maybeSingle();
  if (!data?.is_admin) throw new Error("Forbidden");
}

export const amIAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", context.userId)
      .maybeSingle();
    return { isAdmin: Boolean(data?.is_admin) };
  });

export type ReviewItem = {
  id: string;
  park: string;
  day_job_title: string;
  why_trust_me_text: string | null;
  submitted_at: string;
  status: ApplicationStatus;
  applicantName: string;
  videoUrl: string | null;
  photoUrl: string | null;
};

export const listApplicationsForReview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ReviewItem[]> => {
    await assertAdmin(context.supabase as never, context.userId);

    const { data, error } = await context.supabase
      .from("ambassador_applications")
      .select(
        "id, user_id, park, day_job_title, why_trust_me_text, why_trust_me_video_url, day_job_photo_url, status, submitted_at",
      )
      .order("submitted_at", { ascending: false });
    if (error) throw new Error(error.message);
    const rows = data ?? [];
    if (rows.length === 0) return [];

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: profiles } = await supabaseAdmin
      .from("profiles")
      .select("id, display_name")
      .in("id", [...new Set(rows.map((r) => r.user_id))]);
    const names = new Map((profiles ?? []).map((p) => [p.id, p.display_name]));

    return Promise.all(
      rows.map(async (r) => {
        const video = await context.supabase.storage
          .from("ambassador-videos")
          .createSignedUrl(r.why_trust_me_video_url, 60 * 30);
        const photo = r.day_job_photo_url
          ? await context.supabase.storage
              .from("ambassador-videos")
              .createSignedUrl(r.day_job_photo_url, 60 * 30)
          : null;
        return {
          id: r.id,
          park: r.park,
          day_job_title: r.day_job_title,
          why_trust_me_text: r.why_trust_me_text,
          submitted_at: r.submitted_at,
          status: r.status as ApplicationStatus,
          applicantName: names.get(r.user_id) || "Member",
          videoUrl: video.data?.signedUrl ?? null,
          photoUrl: photo?.data?.signedUrl ?? null,
        };
      }),
    );
  });

export const reviewApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        decision: z.enum(["approved", "rejected"]),
        note: z.string().max(500).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase as never, context.userId);
    const { error } = await context.supabase
      .from("ambassador_applications")
      .update({
        status: data.decision,
        reviewed_at: new Date().toISOString(),
        reviewer_note: data.note ?? null,
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/**
 * Server-side gate for the activation payment. Checkout can only start when the
 * caller owns an approved application. Payment provider wiring is pending, so an
 * eligible caller receives `ready: false` with a reason instead of a session URL.
 */
export const startAmbassadorCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("ambassador_applications")
      .select("id, status")
      .eq("user_id", context.userId)
      .eq("status", "approved")
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) throw new Error("Not eligible: no approved ambassador application");

    return {
      ready: false as const,
      applicationId: data.id,
      reason: "Payments are not connected to this project yet.",
    };
  });
