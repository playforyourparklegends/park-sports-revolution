# More Visible Legends Crest + Skill Update

## What changes

1. **Logo visibility on the Lorenzi Park hero**
   - Recomposite the Legends of the Park crest onto the current waist-up monument image at higher presence:
     - Full opacity (no soft-fade blending) instead of the current partly translucent treatment.
     - Larger footprint: crest width ~60-65% of frame width (up from the current smaller pass).
     - Keep it centered at the very top, with clear separation above the figure's head — no overlap.
     - Add a subtle dark scrim/shadow directly behind the crest so the gold reads cleanly against the bright stormy sky.
   - The figure, park scene, scale, pose, jersey text, and calm lower half stay exactly as they are now — only the crest layer is redone.

2. **Skill update (`legends-monument-generator`)**
   - Lock in the numbers we've settled on so future generations don't drift:
     - Figure: waist/belt-up only, never a full standing body; visible torso+head ~25-30% of frame height, positioned low at the horizon/mountain line.
     - Logo: rendered at full opacity, ~60-65% of frame width, centered at the very top, with a soft dark scrim behind it for legibility and clear separation above the figure's head.
     - Note that the logo is a composited overlay (kept crisp), not something the image model draws.
   - Keep every other rule in the skill byte-identical.

## What stays untouched

- The card carousel — size, position, swipe physics, crossfade.
- Page layout in the home route; at most the hero asset file is swapped.
- No new text, screens, or UI.

## Technical notes

- Crest layer rebuilt with PIL from the uploaded logo (luminance-keyed transparency), composited over the existing 768x1376 monument image; result replaces `src/assets/lorenzi-park-monument.jpg`.
- Verified in the headless browser at mobile size before reporting done.
