'use client';

import { loadStripe, type StripeEmbeddedCheckout } from '@stripe/stripe-js';
import { LockKeyhole } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type EmbeddedStripeCheckoutProps = {
  clientSecret: string;
  publishableKey: string;
  sessionId: string;
};

export function EmbeddedStripeCheckout({
  clientSecret,
  publishableKey,
  sessionId,
}: EmbeddedStripeCheckoutProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    let checkout: StripeEmbeddedCheckout | null = null;

    async function mountCheckout() {
      try {
        const stripe = await loadStripe(publishableKey);
        if (!stripe)
          throw new Error('Não foi possível carregar o pagamento seguro.');
        const instance = await stripe.createEmbeddedCheckoutPage({
          clientSecret,
          onComplete: () => {
            window.location.assign(
              `/sucesso?session_id=${encodeURIComponent(sessionId)}`,
            );
          },
        });
        if (cancelled) {
          instance.destroy();
          return;
        }
        checkout = instance;
        if (mountRef.current) instance.mount(mountRef.current);
      } catch (cause) {
        if (!cancelled)
          setError(
            cause instanceof Error
              ? cause.message
              : 'Não foi possível carregar o pagamento seguro.',
          );
      }
    }

    void mountCheckout();
    return () => {
      cancelled = true;
      checkout?.destroy();
    };
  }, [clientSecret, publishableKey, sessionId]);

  return (
    <section className="embedded-checkout-shell" aria-label="Pagamento seguro">
      <p className="embedded-checkout-security">
        <LockKeyhole aria-hidden="true" /> Pagamento protegido pela Stripe
      </p>
      {error ? (
        <div className="form-error" role="alert">
          {error} Feche o carrinho e tente novamente.
        </div>
      ) : (
        <>
          <div ref={mountRef} className="embedded-checkout-mount" />
          <div className="embedded-checkout-loading" aria-live="polite">
            Carregando pagamento seguro…
          </div>
        </>
      )}
    </section>
  );
}
