import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const session: any = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.isAdmin) {
      return NextResponse.json({ error: "Obehörig" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "E-post saknas" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        accountType: true,
        sentMessages: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            isRead: true,
            deletedBySender: true,
            deletedByReceiver: true,
            receiver: { select: { email: true, name: true } },
            adId: true
          },
          orderBy: { createdAt: "desc" }
        },
        receivedMessages: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            isRead: true,
            deletedBySender: true,
            deletedByReceiver: true,
            sender: { select: { email: true, name: true } },
            adId: true
          },
          orderBy: { createdAt: "desc" }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: "Användaren hittades inte" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error("Fel vid datautdrag:", error);
    return NextResponse.json({ error: "Internt serverfel" }, { status: 500 });
  }
}
