import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Returnera alla huvudkategorier med hela trädet
    const categories = await prisma.category.findMany({
      where: { parentId: null },
      include: {
        subcategories: {
          include: {
            subcategories: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });
    
    return NextResponse.json(categories);
  } catch (error) {
    console.error("CATEGORIES FETCH ERROR:", error);
    return NextResponse.json({ error: "Kunde inte hämta kategorier" }, { status: 500 });
  }
}
