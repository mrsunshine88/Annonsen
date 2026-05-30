import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const session: any = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Obehörig" }, { status: 401 });
    }

    const { adId, counterPartId } = await req.json();

    if (!adId || !counterPartId) {
      return NextResponse.json({ error: "Saknar id" }, { status: 400 });
    }

    const currentUserId = (session.user as any).id;

    // Optimering: UpdateMany direkt i databasen istället för att loopa
    const result = await prisma.message.updateMany({
      where: {
        OR: [
          { adId: adId },
          { jobAdId: adId }
        ],
        senderId: counterPartId,
        receiverId: currentUserId,
        readAt: null
      },
      data: {
        isRead: true, // Behåll isRead för bakåtkompatibilitet
        readAt: new Date()
      }
    });

    return NextResponse.json({ success: true, updatedCount: result.count });
  } catch (error) {
    console.error("Mark read error:", error);
    return NextResponse.json({ error: "Ett fel uppstod" }, { status: 500 });
  }
}
