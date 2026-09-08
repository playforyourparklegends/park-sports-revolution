import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type AmbassadorCard = {
  id: string;
  display_name: string;
  day_job_title: string;
  apparel_photo_url: string | null;
  day_job_photo_url: string | null;
};

/** Approved Park Ambassador cards for a park — fictional showcase rows only (real applicants stay private). */
export const listParkAmbassadors = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ parkId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }): Promise<AmbassadorCard[]> => {
    const { data: rows, error } = await context.supabase
      .from("ambassador_applications")
      .select("id, display_name, day_job_title, apparel_photo_url, day_job_photo_url")
      .eq("park_id", data.parkId)
      .eq("is_fictional", true)
      .eq("status", "approved")
      .order("submitted_at", { ascending: true })
      .order("id", { ascending: true });

    if (error) throw new Error(error.message);
    return (rows ?? []).map((r) => ({
      id: r.id,
      display_name: r.display_name ?? "Park Ambassador",
      day_job_title: r.day_job_title,
      apparel_photo_url: r.apparel_photo_url,
      day_job_photo_url: r.day_job_photo_url,
    }));
  });
