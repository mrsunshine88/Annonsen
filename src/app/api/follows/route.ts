import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { followedId, action } = await req.json();
  const followerId = (session.user as any).id;

  try {
    if (action === 'add') {
      await prisma.follow.create({
        data: { followerId, followedId }
      });
    } else if (action === 'remove') {
      await prisma.follow.delete({
        where: { followerId_followedId: { followerId, followedId } }
      });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Gick inte att uppdatera följning" }, { status: 500 });
  }
}
