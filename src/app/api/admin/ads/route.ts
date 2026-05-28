import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Hämta alla annonser
export async function GET() {
  const session: any = await getServerSession(authOptions);
  if (!session?.user?.email || !(session.user as any).isAdmin) {
    return NextResponse.json({ error: "Obehörig" }, { status: 401 });
  }

  try {
    const ads = await prisma.ad.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { email: true, name: true } },
        category: { select: { name: true } }
      }
    });
    return NextResponse.json(ads);
  } catch (error) {
    return NextResponse.json({ error: "Gick inte att hämta annonser" }, { status: 500 });
  }
}

// Rensa bilder på en annons
export async function PUT(req: Request) {
  const session: any = await getServerSession(authOptions);
  if (!session?.user?.email || !(session.user as any).isAdmin) {
    return NextResponse.json({ error: "Obehörig" }, { status: 401 });
  }

  try {
    const { adId, action, data } = await req.json();

    if (action === "clearImages") {
      const updatedAd = await prisma.ad.update({
        where: { id: adId },
        data: { imageUrls: [] }
      });
      return NextResponse.json(updatedAd);
    }
    
    if (action === "fullEdit" && data) {
      const updatedAd = await prisma.ad.update({
        where: { id: adId },
        data: {
          title: data.title,
          description: data.description,
          price: data.price,
          categoryId: data.categoryId,
          location: data.location,
          zipCode: data.zipCode,
          city: data.city,
          advertiserType: data.advertiserType,
          brand: data.brand,
          mileage: data.mileage,
          year: data.year,
          horsepower: data.horsepower,
          color: data.color,
          gearbox: data.gearbox,
          model: data.model,
          fuel: data.fuel,
          drivetrain: data.drivetrain
        }
      });
      return NextResponse.json(updatedAd);
    }
    
    return NextResponse.json({ error: "Okänd åtgärd" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Ett fel uppstod" }, { status: 500 });
  }
}

// Radera annons
export async function DELETE(req: Request) {
  const session: any = await getServerSession(authOptions);
  if (!session?.user?.email || !(session.user as any).isAdmin) {
    return NextResponse.json({ error: "Obehörig" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const adId = searchParams.get('adId');

    if (!adId) return NextResponse.json({ error: "Saknar adId" }, { status: 400 });

    await prisma.ad.delete({
      where: { id: adId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Gick inte att radera" }, { status: 500 });
  }
}
