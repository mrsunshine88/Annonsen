import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const locations = searchParams.getAll("location");
  
  try {
    // Hitta alla unika orter (city) som finns på aktiva annonser inom de valda länen
    const uniqueCities = await prisma.ad.findMany({
      where: locations.length > 0 ? { location: { in: locations }, city: { not: null } } : { city: { not: null } },
      select: { city: true },
      distinct: ['city']
    });

    const citiesList = uniqueCities.map(c => c.city).filter(Boolean);
    
    // Sortera alfabetiskt
    citiesList.sort((a, b) => (a as string).localeCompare(b as string, 'sv'));

    return NextResponse.json(citiesList);
  } catch (error) {
    console.error("CITIES FETCH ERROR:", error);
    return NextResponse.json({ error: "Kunde inte hämta orter" }, { status: 500 });
  }
}
