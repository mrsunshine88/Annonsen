import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Obehörig" }, { status: 401 });
    }

    const { adId, isJob = false } = await req.json();
    if (!adId) {
      return NextResponse.json({ error: "Ad ID saknas" }, { status: 400 });
    }

    // 1. Verifiera att annonsen tillhör användaren och hämta pris
    let ad;
    let price = 0;

    if (isJob) {
      ad = await prisma.jobAd.findUnique({
        where: { id: adId, authorId: (session as any).user.id },
      });
      // Hämta inställningar för pris
      const settings = await prisma.settings.findUnique({ where: { id: "default" } });
      price = settings?.employerAdPrice || 0;
    } else {
      ad = await prisma.ad.findUnique({
        where: { id: adId, authorId: (session as any).user.id },
      });
      // Hämta inställningar för pris
      const settings = await prisma.settings.findUnique({ where: { id: "default" } });
      price = settings?.defaultAdPrice || 0;
    }

    if (!ad) {
      return NextResponse.json({ error: "Annonsen hittades inte eller obehörig" }, { status: 404 });
    }

    if (ad.isPaid) {
      return NextResponse.json({ error: "Annonsen är redan betald" }, { status: 400 });
    }

    // 2. Generera en unik Swish-referens
    const swishReference = crypto.randomUUID();

    // 3. (Framtid) Anropa Swish API här
    // const swishResponse = await fetch("https://mss.cpc.getswish.net/swish-cpcapi/api/v1/paymentrequests", { ... })

    // Eftersom vi simulerar, skickar vi tillbaka referensen direkt till klienten
    return NextResponse.json({
      success: true,
      swishReference,
      amount: price,
      message: "Betalning initierad",
      mockPaymentUrl: `swish://payment?token=${swishReference}`
    });

  } catch (error) {
    console.error("Swish init error:", error);
    return NextResponse.json({ error: "Ett fel uppstod vid initiering av betalning" }, { status: 500 });
  }
}
