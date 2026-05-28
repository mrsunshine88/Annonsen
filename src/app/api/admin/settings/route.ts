import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function GET() {
  const session: any = await getServerSession(authOptions);
  if (!session?.user?.email || !(session.user as any).isAdmin) {
    return NextResponse.json({ error: "Obehörig" }, { status: 403 });
  }

  let settings = await prisma.settings.findUnique({ where: { id: "default" } });
  if (!settings) {
    settings = await prisma.settings.create({ data: { id: "default" } });
  }

  return NextResponse.json(settings);
}

export async function PUT(req: Request) {
  const session: any = await getServerSession(authOptions);
  if (!session?.user?.email || !(session.user as any).isAdmin) {
    return NextResponse.json({ error: "Obehörig" }, { status: 403 });
  }

  try {
    const data = await req.json();
    const updated = await prisma.settings.upsert({
      where: { id: "default" },
      update: {
        paymentsEnabled: data.paymentsEnabled,
        defaultAdPrice: data.defaultAdPrice,
        swishMode: data.swishMode,
        swishAlias: data.swishAlias,
        swishCert: data.swishCert,
        swishKey: data.swishKey,
        bumpEnabled: data.bumpEnabled,
        bumpPrice: data.bumpPrice,
        companyAdPrice: data.companyAdPrice !== undefined ? data.companyAdPrice : undefined,
        companySubscriptionPrice: data.companySubscriptionPrice !== undefined ? data.companySubscriptionPrice : undefined,
      },
      create: {
        id: "default",
        paymentsEnabled: data.paymentsEnabled,
        defaultAdPrice: data.defaultAdPrice,
        swishMode: data.swishMode,
        swishAlias: data.swishAlias,
        swishCert: data.swishCert,
        swishKey: data.swishKey,
        bumpEnabled: data.bumpEnabled ?? false,
        bumpPrice: data.bumpPrice ?? 0,
        companyAdPrice: data.companyAdPrice ?? 0,
        companySubscriptionPrice: data.companySubscriptionPrice ?? 0,
      }
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Kunde inte spara inställningar" }, { status: 500 });
  }
}
