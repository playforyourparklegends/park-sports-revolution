const clientToken = import.meta.env["VITE_PAYMENTS_CLIENT_TOKEN"] as string | undefined;

export function PaymentTestModeBanner() {
  if (!clientToken) {
    return (
      <div className="w-full border-b border-destructive/40 bg-destructive/15 px-4 py-2 text-center text-[11px] text-destructive">
        Live payments are not configured yet. Finish payment setup to accept real cards.
      </div>
    );
  }
  if (clientToken.startsWith("pk_test_")) {
    return (
      <div className="w-full border-b border-gold/30 bg-gold/10 px-4 py-2 text-center text-[11px] tracking-[0.12em] text-gold">
        Test mode — no real money is charged in the preview.
      </div>
    );
  }
  return null;
}
