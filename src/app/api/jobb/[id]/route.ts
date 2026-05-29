import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  try {
    const job = await prisma.jobAd.findUnique({
      where: { id: resolvedParams.id },
      select: { title: true, companyName: true, applyUrl: true, authorId: true }
    });

    if (!job) {
      return NextResponse.json({ error: "Jobbet hittades inte" }, { status: 404 });
    }

    return NextResponse.json(job);
  } catch (error) {
    return NextResponse.json({ error: "Gick inte att hämta jobb" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  try {
    const { getServerSession } = await import("next-auth");
    const { authOptions } = await import("@/app/api/auth/[...nextauth]/route");
    const session: any = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Obehörig" }, { status: 401 });
    }

    const job = await prisma.jobAd.findUnique({
      where: { id: resolvedParams.id },
      include: { author: true }
    });

    if (!job) {
      return NextResponse.json({ error: "Jobbet hittades inte" }, { status: 404 });
    }

    if (job.author.email !== session.user.email && !session.user.isAdmin) {
      return NextResponse.json({ error: "Du har inte tillåtelse att radera detta jobb" }, { status: 403 });
    }

    await prisma.jobAd.delete({
      where: { id: resolvedParams.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Gick inte att radera jobb" }, { status: 500 });
  }
}
