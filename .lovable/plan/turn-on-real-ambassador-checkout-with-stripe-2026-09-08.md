# Turn on real Ambassador checkout with Stripe

Approved ambassadors currently see "payments are not connected". This plan switches on Lovable's built-in Stripe payments, creates the $25/month Ambassador membership, and wires a real checkout — then walks you through claiming the account so money lands in your bank.

## Decisions locked in
- Monthly subscription, $25 USD
- Seller country: United States
- Stripe with full compliance handling: Stripe handles tax compliance, fraud protection, disputes and buyer support for ~80 countries (+3.5% per transaction on top of base Stripe fees). Changeable later per transaction or off entirely.

## Steps

1. **Enable Stripe payments**
   A test environment is created right away, so we can run a full test purchase without real money. No Stripe account or keys needed from you up front.

2. **Create the product**
   "Park Ambassador Membership" — $25 USD monthly recurring, with the correct tax category for a community membership.

3. **Wire the real checkout**
   Replace the placeholder response in the activation step so it creates a live Stripe checkout session for the signed-in ambassador. The existing server-side rule stays: no session is created unless that person has an approved application. Success returns them to the park page with a confirmation; cancel returns them to the ambassador page unchanged.

4. **Record who paid**
   Add membership status fields (active/inactive, current period end, Stripe customer/subscription references) and a webhook endpoint that Stripe calls when a payment succeeds, renews, fails, or is cancelled. The ambassador page then shows "Ambassador active" instead of the activate button once payment clears.

5. **Verify in the browser**
   Sign in as the test applicant, approve them as reviewer, run a test-card purchase end to end, confirm status flips to active, and confirm a pending/rejected member still cannot reach checkout by going to the route directly.

6. **Connect your bank account (your part, one visit)**
   After the above works, you get a link to claim the Stripe account: confirm your legal/business details, tax info, and add your bank account. Stripe verifies it (usually minutes to a couple of days). Until that's done, purchases only work in test mode — no real cards. Once verified, I switch the app to live mode and we do one small real transaction to confirm payouts.

## Not in scope
Fan subscription tiers, the Ambassador card flip display, and the onboarding park picker stay untouched. The Lorenzi Park team home visuals stay locked.

## Technical notes
- `enable_stripe_payments`, then `batch_create_product` for the recurring price with a Stripe tax code; `managed_payments: { enabled: true }` on the session.
- Checkout session created inside `startAmbassadorCheckout` in `src/lib/ambassador.functions.ts`, after the existing approved-row check; no client-trusted price or user id.
- Webhook as a TanStack server route at `src/routes/api/public/stripe-webhook.ts` with signature verification before any DB write; idempotent on event id.
- Migration adds membership columns (or a small `ambassador_memberships` table) with GRANTs, RLS select-own, and writes only via the service-role webhook path.
