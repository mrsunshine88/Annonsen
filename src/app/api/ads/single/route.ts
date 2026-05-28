import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    
    if (!id) {
      return NextResponse.json({ error: "ID saknas" }, { status: 400 });
    }

    const ad = await prisma.ad.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, name: true, companyName: true, accountType: true }
        }
      }
    });

    if (!ad) {
      return NextResponse.json({ error: "Hittades inte" }, { status: 404 });
    }

    return NextResponse.json(ad);
  } catch (error) {
    return NextResponse.json({ error: "Internt serverfel" }, { status: 500 });
  }
}
