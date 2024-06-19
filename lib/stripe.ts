import Stripe from "stripe";

/**
 * Listen to stripe events on local env via CLI
 *
 * Login to stripe via CLI
 * 1) stripe login
 *
 * listen on your port running local app
 * 2) stripe listen --forward-to http:localhost:3000
 *
 * FOR LOCAL ENV ONLY
 * You need to run the Stripe CLI to listen to the events
 */

export const stripe = new Stripe(process.env.STRIPE_API_KEY!, {
  apiVersion: "2024-04-10",
  typescript: true,
});
