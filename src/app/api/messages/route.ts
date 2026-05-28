import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Hämta konversationer
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Obehörig" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    // Hämta alla meddelanden där användaren är antingen sändare eller mottagare
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ]
      },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: { select: { id: true, name: true } },
        receiver: { select: { id: true, name: true } },
        ad: { select: { id: true, title: true } }
      }
    });

    return NextResponse.json(messages);
  } catch (error) {
    return NextResponse.json({ error: "Gick inte att hämta meddelanden" }, { status: 500 });
  }
}

// Skicka nytt meddelande
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Obehörig" }, { status: 401 });
  }

  try {
    const { adId, receiverId, content } = await req.json();

    if (!adId || !receiverId || !content) {
      return NextResponse.json({ error: "Saknar fält" }, { status: 400 });
    }

    if (session.user.id === receiverId) {
      return NextResponse.json({ error: "Du kan inte skicka meddelande till dig själv" }, { status: 400 });
    }

    const newMessage = await prisma.message.create({
      data: {
        content,
        senderId: session.user.id,
        receiverId,
        adId
      },
      include: {
        sender: { select: { id: true, name: true } },
        receiver: { select: { id: true, name: true } },
        ad: { select: { id: true, title: true } }
      }
    });

    return NextResponse.json(newMessage);
  } catch (error) {
    return NextResponse.json({ error: "Gick inte att skicka meddelande" }, { status: 500 });
  }
}
