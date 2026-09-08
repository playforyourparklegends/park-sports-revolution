import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type OAuthAuthApi = {
  getAuthorizationDetails: (authorizationId: string) => Promise<{
    data?: {
      redirect_url?: string;
      redirect_to?: string;
      client?: { name?: string };
    } | null;
    error?: { message: string } | null;
  }>;
  approveAuthorization: (authorizationId: string) => Promise<{
    data?: { redirect_url?: string; redirect_to?: string } | null;
    error?: { message: string } | null;
  }>;
  denyAuthorization: (authorizationId: string) => Promise<{
    data?: { redirect_url?: string; redirect_to?: string } | null;
    error?: { message: string } | null;
  }>;
};

function oauthApi(): OAuthAuthApi {
  const api = (supabase.auth as unknown as { oauth?: OAuthAuthApi }).oauth;
  if (!api) throw new Error("Supabase OAuth API is not available");
  return api;
}

export const Route = createFileRoute("/.lovable/oauth/consent")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    authorization_id: typeof s["authorization_id"] === "string" ? s["authorization_id"] : "",
  }),
  beforeLoad: async ({ search, location }) => {
    if (!search.authorization_id) throw new Error("Missing authorization_id");
    const { data } = await supabase.auth.getSession();
    const next = location.pathname + location.searchStr;
    if (!data.session) throw redirect({ to: "/auth", search: { next } });
  },
  loader: async ({ location }) => {
    const authorizationId = new URLSearchParams(location.search).get("authorization_id")!;
    const { data, error } = await oauthApi().getAuthorizationDetails(authorizationId);
    if (error) throw new Error(error.message);
    const immediate = data?.redirect_url ?? data?.redirect_to;
    if (immediate && !data?.client) throw redirect({ href: immediate });
    return data;
  },
  component: Consent,
  errorComponent: ({ error }) => (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <div className="max-w-sm text-center">
        <h1 className="font-display text-xl text-gold">Connection Error</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {String((error as Error)?.message ?? error)}
        </p>
      </div>
    </main>
  ),
});

function Consent() {
  const details = Route.useLoaderData();
  const { authorization_id } = Route.useSearch();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function decide(approve: boolean) {
    setBusy(true);
    const { data, error: decisionError } = approve
      ? await oauthApi().approveAuthorization(authorization_id)
      : await oauthApi().denyAuthorization(authorization_id);
    if (decisionError) {
      setBusy(false);
      setError(decisionError.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("No redirect returned by the authorization server.");
      return;
    }
    window.location.href = target;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="card-metal-frame rounded-2xl p-[1px]">
          <div className="card-lacquer card-depth rounded-2xl px-6 py-8 text-center">
            <h1 className="font-display text-2xl text-gold">Connect {details?.client?.name ?? "an app"}</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              {details?.client?.name ?? "This app"} wants to use Legends of the Park as you.
            </p>
            <p className="mt-2 text-xs text-muted-foreground/70">
              It can read your member profile and Park Ambassador status.
            </p>
            {error && <p className="mt-4 text-xs text-destructive">{error}</p>}
            <div className="mt-6 flex gap-3">
              <button
                disabled={busy}
                onClick={() => decide(false)}
                className="flex-1 rounded-md border border-gold/30 px-4 py-3 text-xs uppercase tracking-[0.2em] text-gold/80 transition-colors hover:border-gold hover:text-gold disabled:opacity-50"
              >
                Deny
              </button>
              <button
                disabled={busy}
                onClick={() => decide(true)}
                className="flex-1 rounded-md bg-gold px-4 py-3 font-display text-xs uppercase tracking-[0.2em] text-gold-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
