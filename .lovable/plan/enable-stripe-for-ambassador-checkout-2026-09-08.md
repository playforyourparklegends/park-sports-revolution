# Enable Stripe for Ambassador checkout

Stripe is already connected in sandbox mode (account `acct_1UDH0pB7zFRUWpQo`). The remaining work is to confirm the product/price exist, verify a test purchase works end-to-end, and then complete live onboarding so real money can land in your bank.

## Decisions locked in
- Built-in Lovable Stripe payments (no manual account setup needed up front).
- Monthly subscription: $25 USD for the Park Ambassador Membership.
- Seller country: United States.
- Full compliance handling: Stripe handles tax, fraud, disputes, and buyer support for ~80 countries (+3.5% per transaction). Can be changed per transaction or disabled later.

## Steps

1. **Confirm the Ambassador product and price**
   - Verify the "Park Ambassador Membership" product and `ambassador_monthly` price exist in the test environment.
   - If missing, create them with the correct tax code for a community/membership product.

2. **Verify sandbox checkout end-to-end**
   - Sign in as the dev applicant, approve the application, and open the Activate Ambassador checkout.
   - Complete a test-card purchase (`4242 4242 4242 4242`).
   - Confirm the subscription row is written and the Ambassador page flips to "active" after the webhook arrives.
   - Confirm a pending or rejected applicant still cannot reach checkout.

3. **Complete live go-live (your part, one visit)**
   - Finish the go-live form in the Payments tab.
   - Add the Lovable app to your live Stripe account.
   - Provide business/tax details and connect your bank account in Stripe.
   - Stripe verification usually takes minutes to a couple of days.

4. **Switch the app to live and confirm real payouts**
   - Once live keys are provisioned, run one small real-card purchase to confirm money flows to your connected bank.
   - Until this step succeeds, checkout remains in test mode and no real cards are charged.

## Not in scope
- Fan subscription tiers, card-flip reveals, or the onboarding park picker.
- The Lorenzi Park Team Home visuals remain locked.

## Technical notes
- Existing checkout code at `src/lib/ambassador.functions.ts` already resolves `ambassador_monthly` by lookup key and creates embedded subscription sessions with `managed_payments: { enabled: true }`.
- Existing webhook at `src/routes/api/public/payments/webhook.ts` already updates the `subscriptions` table.
- No code changes are expected unless the product/price is missing or the sandbox test reveals a bug.
