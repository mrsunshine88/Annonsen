import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST() {
  try {
    const session: any = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Obehörig" }, { status: 401 });
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { termsAccepted: true }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Fel vid godkännande av villkor:", error);
    return NextResponse.json({ error: "Internt serverfel" }, { status: 500 });
  }
}
