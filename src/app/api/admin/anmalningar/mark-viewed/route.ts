import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST() {
  const session: any = await getServerSession(authOptions);
  
  if (!session?.user?.email || !(session.user as any).isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.adReport.updateMany({
      where: {
        adminViewed: false
      },
      data: {
        adminViewed: true
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Mark viewed error:", error);
    return NextResponse.json({ error: "Failed to mark as viewed" }, { status: 500 });
  }
}
