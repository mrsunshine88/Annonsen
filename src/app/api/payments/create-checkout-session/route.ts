import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import { stripe } from "@/lib/stripe";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const session: any = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Obehörig" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user) {
      return NextResponse.json({ error: "Användare hittades inte" }, { status: 404 });
    }

    // Failsafe/Mock för lokal miljö om Stripe-nycklar saknas
    if (!process.env.STRIPE_SECRET_KEY) {
      await prisma.user.update({
        where: { id: user.id },
        data: { hasActiveSubscription: true, canPublishAds: true, companyPageApproved: true, stripeSubscriptionItemId: "mock_sub_item" }
      });
      return NextResponse.json({ url: "/dashboard?success=true" });
    }

    // Om de inte har en kund i Stripe, skapa den
    let stripeCustomerId = user.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.companyName || user.name || "Företagskund",
        metadata: {
          userId: user.id
        }
      });
      stripeCustomerId = customer.id;
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customer.id }
      });
    }

    const { priceId } = await req.json(); // T.ex. den fasta månadskostnadens pris-ID från inställningar

    if (!priceId) {
       return NextResponse.json({ error: "Saknar pris-ID" }, { status: 400 });
    }

    // Skapa en Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard?cancel=true`
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Stripe Checkout Error:", error);
    return NextResponse.json({ error: "Ett internt fel uppstod" }, { status: 500 });
  }
}
