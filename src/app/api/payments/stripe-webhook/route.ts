import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { stripe } from "@/lib/stripe";

const prisma = new PrismaClient();
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  const payload = await req.text();
  const signature = req.headers.get("stripe-signature");

  let event;

  if (process.env.STRIPE_SECRET_KEY && endpointSecret && signature) {
    try {
      event = stripe.webhooks.constructEvent(payload, signature, endpointSecret);
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return NextResponse.json({ error: "Webhook Error" }, { status: 400 });
    }
  } else {
    // Om vi kör lokalt utan Stripe-nycklar (t.ex. med mock-stripe), parsa direkt
    try {
      event = JSON.parse(payload);
    } catch (e) {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
  }

  try {
    switch (event.type) {
      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        if (invoice.customer) {
          const customerId = invoice.customer as string;
          // Kunden har betalat sin faktura -> Aktivera annonsering
          await prisma.user.updateMany({
            where: { stripeCustomerId: customerId },
            data: { 
              canPublishAds: true,
              hasActiveSubscription: true
            }
          });
          console.log(`✅ [Stripe Webhook] Betalning lyckades för kund ${customerId}. canPublishAds = true`);
        }
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object;
        if (invoice.customer) {
          const customerId = invoice.customer as string;
          // Kortet studsade -> Pausa annonsering omedelbart
          await prisma.user.updateMany({
            where: { stripeCustomerId: customerId },
            data: { 
              canPublishAds: false,
              hasActiveSubscription: false 
            }
          });
          console.log(`❌ [Stripe Webhook] Betalning misslyckades för kund ${customerId}. canPublishAds = false`);
        }
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        if (subscription.customer) {
          const customerId = subscription.customer as string;
          // Prenumerationen avslutades -> Pausa annonsering
          await prisma.user.updateMany({
            where: { stripeCustomerId: customerId },
            data: { 
              canPublishAds: false,
              hasActiveSubscription: false 
            }
          });
          console.log(`⚠️ [Stripe Webhook] Prenumeration avslutad för kund ${customerId}. canPublishAds = false`);
        }
        break;
      }
      default:
        console.log(`[Stripe Webhook] Ohanterat event: ${event.type}`);
    }
    
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe Webhook Error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
