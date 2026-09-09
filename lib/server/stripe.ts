import Stripe from 'stripe';
import { resolveStripeCredentials } from '@/lib/server/stripe-config';

export async function getStripe() {
  const { credentials } = await resolveStripeCredentials();
  if (!credentials?.secretKey)
    throw new Error('Stripe ainda não foi configurada no painel administrativo.');
  return new Stripe(credentials.secretKey, {
    httpClient: Stripe.createFetchHttpClient(),
  });
}
