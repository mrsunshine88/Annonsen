import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Obehörig" }, { status: 401 });
  }

  try {
    const { adId } = await req.json();
    
    // Säkerställ att annonsen tillhör användaren (om inte admin)
    const ad = await prisma.ad.findUnique({
      where: { id: adId },
      include: { author: true }
    });

    if (!ad) {
      return NextResponse.json({ error: "Annonsen hittades inte" }, { status: 404 });
    }

    if (ad.author.email !== session.user.email && !(session.user as any).isAdmin) {
      return NextResponse.json({ error: "Obehörig" }, { status: 403 });
    }

    const updated = await prisma.ad.update({
      where: { id: adId },
      data: { isPaid: true }
    });

    return NextResponse.json({ success: true, ad: updated });
  } catch (error) {
    return NextResponse.json({ error: "Kunde inte godkänna betalningen" }, { status: 500 });
  }
}
