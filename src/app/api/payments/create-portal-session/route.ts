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

    if (!user || !user.stripeCustomerId) {
      return NextResponse.json({ error: "Ingen Stripe-kund hittades" }, { status: 404 });
    }

    // Skapa en Customer Portal Session
    // (Ger användaren en länk till en säker sida hos Stripe där de kan byta kort eller säga upp)
    if (process.env.STRIPE_SECRET_KEY) {
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/installningar`
      });

      return NextResponse.json({ url: portalSession.url });
    } else {
      // För test/lokalt om nycklar saknas
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json({ error: "Betalningssystemet är tillfälligt otillgängligt." }, { status: 500 });
      }
      console.log("[MOCK] Öppnar Stripe Customer Portal");
      return NextResponse.json({ url: "/dashboard/installningar?mock_portal=true" });
    }
  } catch (error) {
    console.error("Stripe Portal Error:", error);
    return NextResponse.json({ error: "Ett internt fel uppstod" }, { status: 500 });
  }
}
