# Lorenzi Park Lyons fictional showcase

## Recommendation: split into 3 messages

33 image generations is too much for one pass. Each one is roughly 30–90 seconds of generation plus a visual check, and the 10 player cards need compositing (crest, name, position) on top of that. One message of 33 means little room to verify likeness/uniform accuracy and re-roll misses. Proposed split:

1. **Message A (this plan):** schema, team identity (crest + colors), 10 fictional Park Ambassadors (20 images), carousel wired to real data.
2. **Message B:** 10 player trading cards + the floating card-pack component.
3. **Message C:** 3 Legends + the elevated Legends section.

Everything below is scoped to Message A, with the B/C schema created now so those passes are content-only. If you would rather do it all at once, say so and I will, but expect a long turn and a higher chance of re-rolls afterward.

## Findings that change the plan slightly

- `ambassador_applications.user_id` is **not null** and points at a real member profile. Fictional ambassadors have no account. Rather than creating 10 fake login accounts, the plan makes `user_id` nullable and adds a `display_name text` column used only for fictional rows. Real applications keep setting `user_id` exactly as today.
- The owner review queue signs a video URL for every row and would break on a row with no video. It will filter to `is_fictional = false`, which is the only touch to the review flow (the query only; no UI/approval logic changes). The checkout eligibility check looks up by the caller's own `user_id`, so fictional rows can never unlock checkout.
- The only storage bucket is the **private** `ambassador-videos`. Fictional photos and the crest need to load without signed URLs, so a new **public** `park-media` bucket is added (owner-only writes). Real applicant uploads stay in the private bucket, untouched.
- Crest colors sampled from the actual image: teal `#017F7E` (dominant shield teal; darker rim is `#013449`), gold `#FFCB00`. Note the uniform photo is black with light-blue trim, which differs from the crest palette; ambassadors get crest teal/gold apparel as you specified, players (Message B) get the black/light-blue jersey from the photo.
- The uniform-designer skill says button-front jerseys only; your instruction to match the photo (crew-neck pullover) overrides that for player cards. Flagging so it is a conscious choice.

## 1. Schema (one migration)

- `parks`: add `crest_image_url text`.
- `ambassador_applications`: add `is_fictional boolean not null default false`, add `display_name text`, make `why_trust_me_video_url` and `user_id` nullable. New read rule: any signed-in member can view rows where `is_fictional = true and status = 'approved'` (needed for the carousel). Existing applicant/admin rules unchanged.
- New `roster_players`: id, park_id → parks, name, position, jersey_number, portrait_image_url, is_fictional (default true), created_at. Public read, no public write, admin insert/update.
- New `legends`: id, park_id → parks, name, position, monument_image_url, achievement_text, is_fictional (default true), created_at. Same access pattern.
- Storage rules for `park-media`: public read, admin-only write.

## 2. Team identity

- Upload the crest to `park-media/lorenzi/crest.png`, set `crest_image_url`, `primary_color = #017F7E`, `secondary_color = #FFCB00` on the Lorenzi row.
- Suggested placement: a small crest (about 52px) in the top-left corner of the team page, mirroring the sign-out icon on the right, with a soft dark drop shadow so it reads over the sky. The top-center is already occupied by the Legends of the Park crest baked into the hero, so the corner keeps them from competing. Rendered from `crest_image_url`, so Paseo Verde (null) shows nothing.

## 3. Ten fictional Park Ambassadors

- Images generated with the agent-side image tools (the same pipeline the monument work used), not through the in-app studio route; the app route is for runtime generation, and seeding is a one-time job. Each ambassador: a front portrait in a teal/gold Lorenzi Park Lyons tee or hoodie, and a back photo at a plausible day job. Mix of ages, genders, and ethnicities; day jobs like nurse, electrician, teacher, barber, firefighter, chef, mail carrier, mechanic, pharmacist, bus driver.
- Uploaded to `park-media/lorenzi/ambassadors/<n>-front.jpg` and `-back.jpg`; inserted as 10 rows with `is_fictional = true`, `status = 'approved'`, `park_id` = Lorenzi, `display_name`, `day_job_title`, `apparel_photo_url`, `day_job_photo_url`, `why_trust_me_video_url = null`, `user_id = null`, legacy `park = 'Lorenzi Park'`.
- Carousel: a new public server function returns approved ambassadors for a park id. `PlayerCarousel` gains a `cards` prop and renders the front image, name, and title on the front face and the day-job photo plus title on the back face, with the existing frame/lacquer/depth/crossfade untouched. Card count becomes the data length (start index centered). With zero rows it renders nothing, so Paseo Verde stays "Coming Soon" with no special casing.

## 4 and 5. Player cards and Legends (deferred to B and C)

Tables and storage exist after this pass; the components and 13 images land in the follow-up messages as described in your brief (floating card pack reusing `card-metal-frame`/`card-lacquer`/`card-depth`, data-driven by park id; elevated Legends section outside the carousel).

## Not touched

Stripe, checkout, the real application form, approval actions, Paseo Verde content, the hero image, and the bottom tabs.

## Technical notes

- Migration order: ALTERs, CREATE TABLE + GRANTs + RLS + policies for both new tables, storage policies on `storage.objects` for `park-media`; bucket itself created with the storage tool.
- Fictional reads go through a publishable-key server function (`getParkAmbassadors`, `getRosterPlayers`, `getLegends`) keyed on `park_id`, cached with react-query.
- `listApplicationsForReview` adds `.eq("is_fictional", false)`; nothing else in `ambassador.functions.ts` changes.
- Types file regenerates after the migration; carousel typing follows.
