import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // I en riktig miljö skulle vi validera data-signaturen här.
    const { swishReference, status, adId, amount, isJob = false } = data;

    if (!swishReference || !status || !adId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (status !== "PAID") {
      // Swish skickar även status som "DECLINED", "ERROR" etc.
      // Vi ignorerar dem eller loggar dem.
      return NextResponse.json({ message: "Not paid, ignored" }, { status: 200 });
    }

    // Idempotens-check: Har vi redan hanterat denna referens?
    const existingTransaction = await prisma.transaction.findUnique({
      where: { swishReference }
    });

    if (existingTransaction) {
      // Referensen finns redan. Vi har redan behandlat den.
      // Vi svarar Swish med 200 OK så de slutar anropa oss.
      return NextResponse.json({ message: "Already processed" }, { status: 200 });
    }

    // ACID Transaktion: Skapa transaktion OCH uppdatera annonsen samtidigt
    await prisma.$transaction(async (tx) => {
      // 1. Skapa rad i Transaction-tabellen
      await tx.transaction.create({
        data: {
          swishReference,
          amount: amount || 0,
          adId,
        }
      });

      // 2. Sätt annonsen till betald
      if (isJob) {
        await tx.jobAd.update({
          where: { id: adId },
          data: { isPaid: true }
        });
      } else {
        await tx.ad.update({
          where: { id: adId },
          data: { isPaid: true }
        });
      }
    });

    // Allt gick bra, svara Swish
    return NextResponse.json({ success: true, message: "Payment processed" }, { status: 200 });

  } catch (error) {
    console.error("Swish webhook error:", error);
    // Om något i Prisma (t.ex. unikt-index) kraschar, returnerar vi 500
    // Swish kommer då försöka anropa webhooken igen senare
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
