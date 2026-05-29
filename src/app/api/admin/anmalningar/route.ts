import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const session: any = await getServerSession(authOptions);
  if (!session?.user?.email || !(session.user as any).isAdmin) {
    return NextResponse.json({ error: "Obehörig" }, { status: 401 });
  }

  try {
    const reports = await prisma.adReport.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        ad: { select: { id: true, title: true } }
      }
    });
    return NextResponse.json(reports);
  } catch (error) {
    return NextResponse.json({ error: "Gick inte att hämta anmälningar" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session: any = await getServerSession(authOptions);
  if (!session?.user?.email || !(session.user as any).isAdmin) {
    return NextResponse.json({ error: "Obehörig" }, { status: 401 });
  }

  try {
    const { reportId, status } = await req.json();

    const updated = await prisma.adReport.update({
      where: { id: reportId },
      data: { status }
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Ett fel uppstod" }, { status: 500 });
  }
}
