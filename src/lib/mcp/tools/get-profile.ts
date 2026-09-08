import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "get_profile",
  title: "Get member profile",
  description: "Return the signed-in member's profile: display name, role, chosen park, email, and admin status.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("profiles")
      .select("id, display_name, role, chosen_park, email, is_admin")
      .eq("id", ctx.getUserId())
      .maybeSingle();

    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    if (!data) {
      return { content: [{ type: "text", text: "Profile not found" }], isError: true };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            id: data.id,
            display_name: data.display_name,
            email: data.email,
            role: data.role,
            chosen_park: data.chosen_park,
            is_admin: data.is_admin,
          }),
        },
      ],
      structuredContent: data,
    };
  },
});
