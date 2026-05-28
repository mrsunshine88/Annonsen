import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !(session.user as any).isAdmin) {
    return NextResponse.json({ error: "Obehörig" }, { status: 403 });
  }

  try {
    const data = await req.json();
    const { userId, customCompanyAdPrice, customCompanySubscriptionPrice } = data;

    if (!userId) {
      return NextResponse.json({ error: "Saknar användar-ID" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        customCompanyAdPrice: customCompanyAdPrice === null ? null : Number(customCompanyAdPrice),
        customCompanySubscriptionPrice: customCompanySubscriptionPrice === null ? null : Number(customCompanySubscriptionPrice),
      }
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("ADMIN USER PRICE ERROR:", error);
    return NextResponse.json({ error: "Kunde inte spara företagspris" }, { status: 500 });
  }
}
