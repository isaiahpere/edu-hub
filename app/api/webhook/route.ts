import Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";

/**
 * To handle stripe webhook used to create purchase
 *
 *
 * Note: Do not return too many status: 400 in response as webhook will be disconnected
 * by stripe.
 *
 *
 * Webhook Instructions:
 * https://dashboard.stripe.com/test/webhooks/create?endpoint_location=local
 */
export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("Stripe-signature") as string;

  let event: Stripe.Event;

  // attempt webhook construction
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`);
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const userId = session?.metadata?.userId;
  const courseId = session?.metadata?.courseId;

  if (event.type === "checkout.session.completed") {
    // return error if no userId or courseId as they are needed to create purchase in DB.
    if (!userId || !courseId) {
      return new NextResponse("Webhook Error: Missing metadata", {
        status: 400,
      });
    }

    // create purchase in DB
    await db.purchase.create({
      data: {
        courseId,
        userId,
      },
    });
  } else {
    return new NextResponse(
      `Webhook Error: Unhandled event type - ${event.type}`,
      { status: 200 }
    );
  }

  // returning this to complete webhook operation
  return new NextResponse(null, { status: 200 });
}
