import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { adId, action } = await req.json();
  const userId = (session.user as any).id;

  try {
    if (action === 'add') {
      await prisma.favorite.create({
        data: { userId, adId }
      });
    } else if (action === 'remove') {
      await prisma.favorite.delete({
        where: { userId_adId: { userId, adId } }
      });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Gick inte att uppdatera favorit" }, { status: 500 });
  }
}
