# Splash screen + real fan Home dashboard

Two targeted changes; auth, applications, park pages, and Stripe stay untouched.

## 1. Branded splash at `/` (src/routes/index.tsx)

The route's `beforeLoad` session check and its redirect targets (session → `/home`, no session → `/auth`) stay exactly as they are. Only the rendered output changes:

- Replace the `component: () => null` with a minimal branded splash: pitch-black full screen, "Legends of the Park" wordmark in `font-display` gold, with a thin gold divider — same visual vocabulary as `/auth`, no card frame needed for a transient screen.
- No artificial delay. The splash simply renders while `beforeLoad` runs, so there's never a blank flash; if the session resolves instantly the redirect happens immediately as today.
- Keep `ssr: false` (required, since the session check reads browser storage).

## 2. Fan dashboard at `/home` (src/routes/_authenticated/home.tsx)

All existing gating is preserved verbatim:

- No role → `/select-role`
- Role set, no park → `/select-park`
- Role is `player` or `ambassador` → auto-redirect to `/applications` (unchanged, out of scope)

The single behavioral change: role `fan` + park chosen no longer auto-redirects. Instead the route renders a real dashboard:

- **Park identity**: display_name fetched from the `parks` table via the existing `getParkBySlug` server function (query key `["park", slug]`, same as the park pages — no new fetch logic duplicated).
- **Status line**: simple static placeholder such as "Regular Season" — explicitly placeholder copy, no fabricated games or standings.
- **Three quick-link tiles** in the app's gold/black serif card style:
  - "View My Team" → `/park` or `/paseo-verde` based on `chosen_park`
  - "My Profile" → `/profile`
  - "Park Ambassadors" → `/ambassador` (the real application form route; `/applications` is the player/ambassador holding screen, which is not the right destination for a fan)
- `BottomTabs` rendered at the bottom as on other screens; the Home tab now lands here.
- Route gets its own `head()` metadata (title/description/og, "Home — Legends of the Park").

The loading state during gating checks keeps the existing centered "Loading" treatment so there's no flash between gating resolution and dashboard render.

## Technical notes

- No database changes, no migrations, no new tables.
- No changes to `TeamHome`, `park.tsx`, `paseo-verde.tsx`, `BottomTabs`, auth, or any ambassador/Stripe code.
- Dashboard is `useQuery`-driven client-side (route is already `ssr: false`), consistent with the existing `/home` implementation.
- Verification: TypeScript check, then Playwright — logged-out root shows splash then lands on `/auth`; dev sign-in lands on `/home` dashboard (dev account is fan/Lorenzi) showing the Lorenzi park name, status line, and three tiles; each tile navigates to the correct route; `/park` and `/paseo-verde` still render unchanged.
