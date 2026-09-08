import Stripe from 'stripe';
import { env } from '@/lib/server/runtime-env';

export function getStripe() {
  if (!env.STRIPE_SECRET_KEY) throw new Error('Stripe ainda não foi configurado. Defina STRIPE_SECRET_KEY no ambiente do servidor.');
  return new Stripe(env.STRIPE_SECRET_KEY, { httpClient: Stripe.createFetchHttpClient() });
}
