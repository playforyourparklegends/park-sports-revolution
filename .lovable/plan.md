# Waist-Up Monument Correction

## What changes
Regenerate the hero background so the ghostly bronze-gold figure is visible **only from the belt/waist up** — no legs, no full standing body. The figure rises behind the horizon/mountain line as a chest-up apparition (like the original monument composition), but stays at the corrected smaller scale (~25-30% of frame height) and distant position from the last round.

## Steps
1. Read the current `legends-monument-generator` skill to follow it exactly.
2. Generate a new image with the same ingredients as the current hero:
   - Same player likeness (reference photo: young adult male, short curly hair), screaming, fists clenched at his sides
   - Semi-transparent bronze-gold material, scenery visible through the figure
   - "Legends of Lorenzi Park" across the button-front jersey chest
   - Same Lorenzi Park scene: twin lakes, palms, lawns, Vegas skyline, Spring Mountains, stormy sky with warm sunset low on the horizon
   - Calm, uncluttered bottom third for the carousel
   - **New:** figure framed from the belt up only, positioned low near the mountain line so the visible torso/head occupies roughly 25-30% of total frame height, with clear open sky above his head
3. Composite the Legends of the Park logo (already-cropped transparent version from the previous pass, if still on disk; otherwise re-crop from the original attachment) centered at the very top with clear separation above the figure's head — matching current spacing.
4. Upload as a new asset, update `src/assets/lorenzi-park-monument.jpg.asset.json` to point at it, and verify the screen in the browser at mobile size.

## What stays untouched
- The card carousel — size, position, swipe physics, crossfade: no changes.
- `src/routes/index.tsx` layout — only the asset pointer file changes (alt text tweak if needed).
- No new text, UI, or other screens.

## Technical notes
- Generation via the agent-side edit_image tool using the player reference photo as input, same as previous passes.
- Logo compositing via PIL (luminance-based transparency already worked); final image saved as JPG asset.
