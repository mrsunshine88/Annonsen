import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ isBlocked: false, unreadCount: 0 });
  }

  const user = await prisma.user.findUnique({
    where: { id: (session.user as any).id },
    select: { isBlocked: true }
  });

  if (!user) {
    return NextResponse.json({ isBlocked: true, unreadCount: 0 });
  }

  const unreadCount = await prisma.message.count({
    where: { 
      receiverId: (session.user as any).id,
      isRead: false 
    }
  });

  return NextResponse.json({ 
    isBlocked: user.isBlocked, 
    unreadCount 
  });
}
