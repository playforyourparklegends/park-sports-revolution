import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

export type ParkStatus = "active" | "coming_soon";

export type ParkRecord = {
  id: string;
  slug: string;
  display_name: string;
  mascot_name: string | null;
  state: string | null;
  status: ParkStatus;
};

export const getParkBySlug = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ slug: z.string().min(2).max(80) }).parse(data))
  .handler(async ({ data }): Promise<ParkRecord | null> => {
    const supabasePublic = createClient<Database>(
      process.env["SUPABASE_URL"]!,
      process.env["SUPABASE_PUBLISHABLE_KEY"]!,
      { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
    );

    const { data: row, error } = await supabasePublic
      .from("parks")
      .select("id, slug, display_name, mascot_name, state, status")
      .eq("slug", data.slug)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!row) return null;

    return {
      id: row.id,
      slug: row.slug,
      display_name: row.display_name,
      mascot_name: row.mascot_name,
      state: row.state,
      status: (row.status as ParkStatus) ?? "active",
    };
  });
