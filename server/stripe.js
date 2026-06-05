// server/stripe.js
import Stripe from 'stripe';

const stripeSecret = process.env.STRIPE_SECRET_KEY;
if (!stripeSecret) {
  console.warn('⚠️ Stripe secret key not set – Stripe integration disabled.');
}

const stripe = stripeSecret ? Stripe(stripeSecret) : null;

export const createPaymentIntent = async (amount, currency = 'usd') => {
  if (!stripe) {
    throw new Error('Stripe not configured');
  }
  // amount is in smallest currency unit (e.g., cents)
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency,
    // automatic_payment_methods enables dynamic payment method selection
    automatic_payment_methods: { enabled: true },
  });
  return paymentIntent;
};

export default stripe;
