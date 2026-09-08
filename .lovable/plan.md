# Data-driven park pages

Goal: one shared team-page template fed by a new `parks` table, with Lorenzi Park looking exactly as it does today and nothing in the ambassador/Stripe flow touched.

## 1. New `parks` table

Columns: id, slug (unique), display_name, mascot_name, state (default 'Nevada'), primary_color, secondary_color, text_color, status ('active' | 'coming_soon', default 'active'), created_at.

Access rules:
- Anyone (signed in or not) can read park info.
- Only owner/admin accounts can add or change parks.

Seeded rows (in the migration itself):
- `lorenzi_park_lyons` — "Legends of Lorenzi Park", Nevada, active
- `paseo_verde_park_panthers` — "Paseo Verde Park Panthers", Nevada, coming soon

Colors stay empty; no visual styling changes this pass.

## 2. Ambassador applications: schema only

- Add `park_id` (links to parks, nullable).
- Add `apparel_photo_url` (nullable) for the future flip-card front image; existing `day_job_photo_url` stays as the back image.
- Keep the old `park` text column.

One thing to flag: the single existing application row stores `park` as `"Lorenzi Park"`, not the slug `lorenzi_park_lyons`, so a plain slug match would backfill nothing. The backfill will match on slug **or** display name **or** a loose "lorenzi"/"paseo" text match, so that row gets linked to Lorenzi Park. No checkout, review, or Stripe code is touched.

## 3. Shared `TeamHome` component

New `src/components/TeamHome.tsx` renders exactly what `park.tsx` renders today: full-screen monument image, small sign-out button, `PlayerCarousel`, `BottomTabs` — plus the "coming soon" block when the park's status is coming soon (same markup/classes currently in `paseo-verde.tsx`).

Monument images stay as local static imports mapped by slug inside the component (`lorenzi_park_lyons` → lorenzi-park-monument.jpg, `paseo_verde_park_panthers` → paseo-verde-park-monument.jpg). Only name/mascot/state/status come from the database.

`/park` and `/paseo-verde` keep their exact URLs; each fetches its own park row by slug (react-query) and renders `<TeamHome park={...} />`. Page titles/descriptions stay as they are so search previews don't change.

## Technical notes

- Migration includes CREATE TABLE + GRANTs (SELECT to anon/authenticated, admin-gated INSERT/UPDATE via `profiles.is_admin`) + RLS + policies, then the two seed INSERTs, then the `ambassador_applications` ALTERs and backfill UPDATE.
- Park read goes through a public server function using the publishable key (no auth needed) so it works for both routes; query key `["park", slug]`.
- Coming-soon status only controls whether the copy block renders; Lorenzi's branch is byte-identical markup to today's `park.tsx`, including the sign-out handler (cancel queries, clear cache, sign out, redirect to `/auth`).
- Loading state renders the background image immediately, so there is no visible flash on Lorenzi.
- No route renames, no navigation restructuring, no changes to `PlayerCarousel`.
