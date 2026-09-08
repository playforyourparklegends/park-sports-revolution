# Remove Park Ambassadors text and link from Lorenzi Park home

## Goal
Clean up the Lorenzi Park Team Home screen by removing the "Park Ambassadors" title and the "Become a Park Ambassador" link below the carousel. The Ambassador sign-up entry point will be re-added elsewhere later at the user's direction.

## Changes
1. `src/routes/_authenticated/park.tsx`
   - Remove the `ParkAmbassadorsTitle` import.
   - Remove the `<ParkAmbassadorsTitle />` element from the bottom content stack.
   - Remove the centered `<Link to="/ambassador">` block and its wrapping `div`.
2. `src/components/ParkAmbassadorsTitle.tsx`
   - Delete the now-unused component file to avoid orphaned code.

## Out of scope
- No changes to the hero image, carousel, bottom tabs, auth, MCP, Ambassador pipeline, or payments.
- The `/ambassador` route remains reachable for users who already know the URL or for later navigation.

## Verification
- Run TypeScript check and a quick browser preview of `/park` to confirm the carousel sits cleanly at the bottom without the title or link.
