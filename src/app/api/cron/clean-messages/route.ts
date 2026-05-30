import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Säkerställ att routen bara kan anropas via Vercel Cron (eller med korrekt Authorization header)
export async function GET(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Obehörig" }, { status: 401 });
  }

  try {
    // 30 dagar bakåt i tiden
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Hitta och radera meddelanden där BÅDE sändare och mottagare har "raderat" det
    // OCH som är äldre än 30 dagar.
    const deletedCount = await prisma.message.deleteMany({
      where: {
        deletedBySender: true,
        deletedByReceiver: true,
        createdAt: {
          lt: thirtyDaysAgo
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: `Rensade ${deletedCount.count} permanenta raderade meddelanden.` 
    });
  } catch (error) {
    console.error("Fel vid cron-rensning av meddelanden:", error);
    return NextResponse.json({ error: "Internt serverfel" }, { status: 500 });
  }
}
