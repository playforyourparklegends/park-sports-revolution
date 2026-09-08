import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";
import { useServerFn } from "@tanstack/react-start";
import { useMemo } from "react";
import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import { startAmbassadorCheckout } from "@/lib/ambassador.functions";

export function AmbassadorCheckout() {
  const start = useServerFn(startAmbassadorCheckout);

  const options = useMemo(
    () => ({
      fetchClientSecret: async (): Promise<string> => {
        const result = await start({
          data: {
            environment: getStripeEnvironment(),
            returnUrl: `${window.location.origin}/ambassador?checkout=complete&session_id={CHECKOUT_SESSION_ID}`,
          },
        });
        if ("error" in result) throw new Error(result.error);
        if (!result.clientSecret) throw new Error("Checkout could not be opened.");
        return result.clientSecret;
      },
    }),
    // Intentionally stable: remounting the provider invalidates the client secret.
    [],
  );

  return (
    <div id="checkout" className="mt-5 overflow-hidden rounded-xl">
      <EmbeddedCheckoutProvider stripe={getStripe()} options={options}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}
