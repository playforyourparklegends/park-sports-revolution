import { auth, defineMcp } from "@lovable.dev/mcp-js";
import echoTool from "./tools/echo";
import getProfileTool from "./tools/get-profile";
import getAmbassadorStatusTool from "./tools/get-ambassador-status";

const projectRef = import.meta.env["VITE_SUPABASE_PROJECT_ID"] ?? "project-ref-unset";

export default defineMcp({
  name: "legends-of-the-park",
  title: "Legends of the Park",
  version: "0.1.0",
  instructions:
    "Tools for Legends of the Park members. Use get_profile to read the signed-in member's profile and get_ambassador_status to check their Park Ambassador application status.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [echoTool, getProfileTool, getAmbassadorStatusTool],
});
