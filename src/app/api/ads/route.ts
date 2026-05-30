import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const session: any = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Obehörig" }, { status: 401 });
    }

    const body = await req.json();
    const {
      title, description, price, categoryId, location, zipCode, city, phoneNumber, hidePhone, advertiserType, brand, imageUrls,
      mileage, year, horsepower, color, gearbox, model, fuel, drivetrain
    } = body;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: "Användare hittades inte" }, { status: 404 });
    }

    if (user.accountType === "Arbetsgivare") {
      return NextResponse.json({ error: "Arbetsgivare kan inte skapa vanliga annonser, endast jobbannonser." }, { status: 403 });
    }

    if (user.accountType === "Företag" && !user.canPublishAds) {
      return NextResponse.json({ error: "Ditt konto väntar på godkännande för annonsering." }, { status: 403 });
    }

    // Kolla betalningsinställningar
    const settings = await prisma.settings.findUnique({ where: { id: "default" } });
    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    
    let isPaid = true;
    let paymentAmount = 0;
    let meteredBillingApplied = false;

    if (settings?.paymentsEnabled) {
      isPaid = false;
      
      if (user.accountType === "Företag") {
        paymentAmount = user.customCompanyAdPrice !== null && user.customCompanyAdPrice !== undefined 
          ? user.customCompanyAdPrice 
          : (settings.companyAdPrice || 0);

        // Om företaget har aktiv Stripe-prenumeration hanteras kostnaden som Metered Billing
        if (user.hasActiveSubscription && user.stripeSubscriptionItemId && paymentAmount > 0) {
           meteredBillingApplied = true;
           isPaid = true; // Faktureras av Stripe i efterskott
           paymentAmount = 0; // Inget Swish-belopp
        }
      } else {
        paymentAmount = category?.customPrice !== null && category?.customPrice !== undefined 
          ? category.customPrice 
          : (settings.defaultAdPrice || 0);
      }
      
      if (paymentAmount === 0 && !meteredBillingApplied) {
        isPaid = true; // Gratis
      }
    }

    const ad = await prisma.ad.create({
      data: {
        title,
        description,
        price,
        location,
        zipCode,
        city,
        phoneNumber,
        hidePhone: hidePhone || false,
        isPaid,
        advertiserType: user.accountType, // Använd inloggad användares typ
        brand: brand || null,
        imageUrls: imageUrls || [],
        categoryId,
        authorId: user.id,
        // Bil-specifika
        mileage: mileage || null,
        year: year || null,
        horsepower: horsepower || null,
        color: color || null,
        gearbox: gearbox || null,
        model: model || null,
        fuel: fuel || null,
        drivetrain: drivetrain || null,
      }
    });

    if (meteredBillingApplied && user.stripeSubscriptionItemId) {
      try {
        const { stripe } = await import("@/lib/stripe");
        await (stripe.subscriptionItems as any).createUsageRecord(
          user.stripeSubscriptionItemId,
          { quantity: 1, timestamp: Math.floor(Date.now() / 1000) }
        );
      } catch (stripeError) {
        console.error("Stripe Metered Billing Error:", stripeError);
      }
    }

    return NextResponse.json({ ...ad, paymentAmount }, { status: 201 });
  } catch (error: any) {
    console.error("CREATE AD ERROR:", error);
    return NextResponse.json({ error: "Kunde inte skapa annons" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session: any = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Obehörig" }, { status: 401 });
    }

    const body = await req.json();
    // Kompatibilitet med både admin och vanlig editering
    const adId = body.adId || body.id;
    const data = body.data || body;

    const existingAd = await prisma.ad.findUnique({
      where: { id: adId },
      include: { author: true }
    });

    if (!existingAd) {
      return NextResponse.json({ error: "Annonsen hittades inte" }, { status: 404 });
    }

    if (existingAd.author.email !== session.user.email && !(session.user as any).isAdmin) {
      return NextResponse.json({ error: "Du har inte behörighet att redigera denna annons" }, { status: 403 });
    }

    const {
      title, description, price, categoryId, location, zipCode, city, phoneNumber, hidePhone, advertiserType, brand, imageUrls,
      mileage, year, horsepower, color, gearbox, model, fuel, drivetrain, isBumping
    } = data;

    const settings = await prisma.settings.findUnique({ where: { id: "default" } });

    let newIsPaid = existingAd.isPaid;
    let paymentAmount = 0;
    
    // Hantera Bump
    if (isBumping && settings?.bumpEnabled) {
      paymentAmount = settings.bumpPrice || 0;
      if (paymentAmount > 0) {
        newIsPaid = false;
      }
    }

    const updatedAd = await prisma.ad.update({
      where: { id: adId },
      data: {
        title, description, price, categoryId, location, zipCode, city, phoneNumber, hidePhone, brand,
        advertiserType: existingAd.author.accountType,
        ...(imageUrls ? { imageUrls } : {}), // Uppdatera bara om vi får nya (CreateAdForm hanterar detta)
        mileage: mileage || null,
        year: year || null,
        horsepower: horsepower || null,
        color: color || null,
        gearbox: gearbox || null,
        model: model || null,
        fuel: fuel || null,
        drivetrain: drivetrain || null,
        ...(isBumping ? { createdAt: new Date(), isPaid: newIsPaid } : {})
      }
    });

    return NextResponse.json({ ...updatedAd, paymentAmount });
  } catch (error) {
    console.error("EDIT AD ERROR:", error);
    return NextResponse.json({ error: "Kunde inte uppdatera annonsen" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session: any = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Obehörig" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const adId = searchParams.get('adId');

    if (!adId) return NextResponse.json({ error: "Saknar adId" }, { status: 400 });

    const existingAd = await prisma.ad.findUnique({
      where: { id: adId },
      include: { author: true }
    });

    if (!existingAd) {
      return NextResponse.json({ error: "Annonsen hittades inte" }, { status: 404 });
    }

    if (existingAd.author.email !== session.user.email && !(session.user as any).isAdmin) {
      return NextResponse.json({ error: "Du har inte behörighet att radera denna annons" }, { status: 403 });
    }

    await prisma.ad.delete({ where: { id: adId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE AD ERROR:", error);
    return NextResponse.json({ error: "Kunde inte radera annonsen" }, { status: 500 });
  }
}
