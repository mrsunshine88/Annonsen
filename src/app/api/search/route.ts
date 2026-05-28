import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  
  const query = searchParams.get("q") || "";
  const categoryIds = searchParams.getAll("category");
  const isCar = searchParams.get("isCar") === "true";
  const locations = searchParams.getAll("location");
  const cities = searchParams.getAll("city");
  
  // Pris
  const minPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined;
  const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined;

  // Bil-specifika
  const minMileage = searchParams.get("minMileage") ? Number(searchParams.get("minMileage")) : undefined;
  const maxMileage = searchParams.get("maxMileage") ? Number(searchParams.get("maxMileage")) : undefined;
  
  const minYear = searchParams.get("minYear") ? Number(searchParams.get("minYear")) : undefined;
  const maxYear = searchParams.get("maxYear") ? Number(searchParams.get("maxYear")) : undefined;
  
  const minHp = searchParams.get("minHp") ? Number(searchParams.get("minHp")) : undefined;
  const maxHp = searchParams.get("maxHp") ? Number(searchParams.get("maxHp")) : undefined;

  const brand = searchParams.get("brand") || undefined;
  const model = searchParams.get("model") || undefined;
  const color = searchParams.get("color") || undefined;
  const gearbox = searchParams.get("gearbox") || undefined;
  const fuel = searchParams.get("fuel") || undefined;
  const drivetrain = searchParams.get("drivetrain") || undefined;
  
  const advertiserType = searchParams.get("advertiserType") || undefined;

  try {
    const queryNum = parseInt(query);
    const isQueryNum = !isNaN(queryNum) && query.trim() !== "";

    let textSearchOr: any = undefined;
    if (query) {
      textSearchOr = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { brand: { contains: query, mode: 'insensitive' } },
        { model: { contains: query, mode: 'insensitive' } },
        { fuel: { contains: query, mode: 'insensitive' } },
        { gearbox: { contains: query, mode: 'insensitive' } },
        { color: { contains: query, mode: 'insensitive' } }
      ];
      if (isQueryNum) {
        textSearchOr.push({ year: queryNum });
        textSearchOr.push({ price: queryNum }); // Fallback om nån söker på exakt pris
      }
    }

    const whereClause: any = {
      ...(categoryIds.length > 0 ? { categoryId: { in: categoryIds } } : {}),
      location: locations.length > 0 ? { in: locations } : undefined,
      city: cities.length > 0 ? { in: cities } : undefined,
      ...((minPrice !== undefined || maxPrice !== undefined) && { price: { gte: minPrice, lte: maxPrice } }),
      brand: brand ? { equals: brand, mode: 'insensitive' } : undefined,
      ...(advertiserType && advertiserType !== "Alla" ? { advertiserType } : {}),
      ...(isCar && {
        ...((minMileage !== undefined || maxMileage !== undefined) && { mileage: { gte: minMileage, lte: maxMileage } }),
        ...((minYear !== undefined || maxYear !== undefined) && { year: { gte: minYear, lte: maxYear } }),
        ...((minHp !== undefined || maxHp !== undefined) && { horsepower: { gte: minHp, lte: maxHp } }),
        ...(model ? { model: { equals: model, mode: 'insensitive' } } : {}),
        ...(color ? { color: { equals: color, mode: 'insensitive' } } : {}),
        ...(gearbox ? { gearbox: { equals: gearbox } } : {}),
        ...(fuel ? { fuel: { equals: fuel } } : {}),
        ...(drivetrain ? { drivetrain: { equals: drivetrain } } : {})
      })
    };

    if (textSearchOr) {
      whereClause.OR = textSearchOr;
    }

    const ads = await prisma.ad.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: { category: true }
    });

    return NextResponse.json(ads);
  } catch (error) {
    console.error("SEARCH ERROR:", error);
    return NextResponse.json({ error: "Sökningen misslyckades" }, { status: 500 });
  }
}
