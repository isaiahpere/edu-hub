import Stripe from "stripe";

/**
 * Listen to stripe events on local env via CLI
 *
 * Login to stripe via CLI
 * 1) stripe login
 *
 * listen on your port running local app (MUST BE RUNNING FOR WEBHOOK TO WORK)
 * 2) stripe listen --forward-to localhost:3000/api/webhook
 *
 * FOR LOCAL ENV ONLY
 * You need to run the Stripe CLI to listen to the events
 */

export const stripe = new Stripe(process.env.STRIPE_API_KEY!, {
  apiVersion: "2024-04-10",
  typescript: true,
});
