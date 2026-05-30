import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { del } from "@vercel/blob";

const prisma = new PrismaClient();

// Eftersom detta är ett Vercel Cron-jobb krävs en viss säkerhet
// Vercel skickar en "Authorization: Bearer CRON_SECRET" header
export async function GET(req: Request) {
  // Kontrollera Vercels Cron Secret för att förhindra obehöriga anrop
  const authHeader = req.headers.get("authorization");
  if (
    process.env.CRON_SECRET && 
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    console.log("[CRON] Startar GDPR-rensning av gamla jobbansökningar...");

    // Beräkna datumet "För 6 månader sedan"
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // Hämta alla JobAds (platsannonser) som är äldre än 6 månader
    // Och som har relaterade jobbansökningar (applications)
    const oldJobAds = await prisma.jobAd.findMany({
      where: {
        createdAt: {
          lt: sixMonthsAgo
        }
      },
      include: {
        applications: true
      }
    });

    let deletedApplicationsCount = 0;
    let deletedFilesCount = 0;

    for (const jobAd of oldJobAds) {
      if (jobAd.applications.length > 0) {
        for (const app of jobAd.applications) {
          // 1. Om ansökan har en CV-fil i Vercel Blob, radera den från molnet!
          if (app.cvUrl) {
            try {
              await del(app.cvUrl);
              deletedFilesCount++;
            } catch (err) {
              console.error(`[CRON] Kunde inte radera fil: ${app.cvUrl}`, err);
            }
          }

          if (app.coverLetterUrl) {
            try {
              await del(app.coverLetterUrl);
              deletedFilesCount++;
            } catch (err) {
              console.error(`[CRON] Kunde inte radera fil: ${app.coverLetterUrl}`, err);
            }
          }
        }

        // 2. Radera alla ansökningar från databasen för denna specifika jobbannons
        const deleted = await prisma.jobApplication.deleteMany({
          where: {
            jobId: jobAd.id
          }
        });
        
        deletedApplicationsCount += deleted.count;
      }
    }

    const message = `GDPR-rensning slutförd. Raderade ${deletedApplicationsCount} gamla ansökningar och ${deletedFilesCount} filer (CVn/Brev) från Vercel Blob.`;
    console.log(`[CRON] ${message}`);
    
    return NextResponse.json({ success: true, message });
  } catch (error) {
    console.error("[CRON] Ett fel inträffade vid GDPR-rensningen:", error);
    return NextResponse.json({ error: "Internt serverfel" }, { status: 500 });
  }
}
