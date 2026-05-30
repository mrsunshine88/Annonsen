import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session: any = await getServerSession(authOptions);
    if (!session?.user?.email || !(session.user as any).isAdmin) {
      return NextResponse.json({ error: "Obehörig" }, { status: 403 });
    }

    const companies = await prisma.user.findMany({
      where: {
        accountType: { in: ["Företag", "Arbetsgivare"] }
      },
      select: {
        id: true,
        email: true,
        companyName: true,
        companyOrgNr: true,
        hasActiveSubscription: true,
        canPublishAds: true,
        stripeCustomerId: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return NextResponse.json(companies);
  } catch (error) {
    console.error("Kunde inte hämta företag:", error);
    return NextResponse.json({ error: "Ett fel uppstod" }, { status: 500 });
  }
}
