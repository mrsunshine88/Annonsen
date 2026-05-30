import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const session: any = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Obehörig" }, { status: 401 });
  }

  try {
    const messageId = resolvedParams.id;
    const userId = session.user.id;

    // Hämta meddelandet först för att kolla vem som är vem
    const message = await prisma.message.findUnique({
      where: { id: messageId }
    });

    if (!message) {
      return NextResponse.json({ error: "Meddelandet hittades inte" }, { status: 404 });
    }

    if (message.senderId !== userId && message.receiverId !== userId) {
      return NextResponse.json({ error: "Du har inte behörighet att radera detta meddelande" }, { status: 403 });
    }

    // Uppdatera flaggorna istället för att ta bort raden helt (bevissparning)
    const updateData: any = {};
    if (message.senderId === userId) {
      updateData.deletedBySender = true;
    }
    if (message.receiverId === userId) {
      updateData.deletedByReceiver = true;
    }

    await prisma.message.update({
      where: { id: messageId },
      data: updateData
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Fel vid radering av meddelande:", error);
    return NextResponse.json({ error: "Kunde inte radera meddelandet" }, { status: 500 });
  }
}
