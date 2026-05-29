import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const session: any = await getServerSession(authOptions);
  const userId = session?.user ? (session.user as any).id : null;

  const { adId, reason } = await req.json();

  if (!adId || !reason) {
    return NextResponse.json({ error: "Saknar fält" }, { status: 400 });
  }

  try {
    await prisma.adReport.create({
      data: {
        adId,
        reason,
        userId
      }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Gick inte att skapa anmälan" }, { status: 500 });
  }
}
