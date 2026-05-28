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
    const { categoryId, customPrice } = await req.json();
    
    const updated = await prisma.category.update({
      where: { id: categoryId },
      data: { customPrice }
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Kunde inte uppdatera pris" }, { status: 500 });
  }
}
