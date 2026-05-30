import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).isAdmin) {
      return NextResponse.json({ error: "Obehörig" }, { status: 401 });
    }

    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Fel vid hämtning av kontaktmeddelanden:", error);
    return NextResponse.json({ error: "Internt serverfel" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).isAdmin) {
      return NextResponse.json({ error: "Obehörig" }, { status: 401 });
    }

    const { id, isRead } = await req.json();

    await prisma.contactMessage.update({
      where: { id },
      data: { isRead }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Fel vid uppdatering av kontaktmeddelande:", error);
    return NextResponse.json({ error: "Internt serverfel" }, { status: 500 });
  }
}
