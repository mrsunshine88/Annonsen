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
