import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type MemberRole = "player" | "ambassador" | "fan";
export type ParkChoice = "lorenzi_park_lyons" | "paseo_verde_park_panthers";

export type MemberProfile = {
  id: string;
  display_name: string;
  role: MemberRole | null;
  chosen_park: ParkChoice | null;
  email: string | null;
};

export const PARK_NAMES: Record<ParkChoice, string> = {
  lorenzi_park_lyons: "Lorenzi Park Lyons",
  paseo_verde_park_panthers: "Paseo Verde Park Panthers",
};

export const ROLE_LABELS: Record<MemberRole, string> = {
  player: "Player",
  ambassador: "Park Ambassador",
  fan: "Fan",
};

export async function fetchMyProfile(): Promise<MemberProfile | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, role, chosen_park")
    .eq("id", user.id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;

  return {
    id: data.id,
    display_name: data.display_name,
    role: (data.role as MemberRole | null) ?? null,
    chosen_park: (data.chosen_park as ParkChoice | null) ?? null,
    email: user.email ?? null,
  };
}

export function useMyProfile() {
  return useQuery({ queryKey: ["my-profile"], queryFn: fetchMyProfile });
}

export async function updateMyProfile(patch: {
  role?: MemberRole;
  chosen_park?: ParkChoice;
}): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");
  const { error } = await supabase.from("profiles").update(patch).eq("id", user.id);
  if (error) throw new Error(error.message);
}
