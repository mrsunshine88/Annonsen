import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const session: any = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Du måste vara inloggad" }, { status: 401 });
  }

  // Enbart företag och arbetsgivare bör kunna lägga upp jobb (eller bara arbetsgivare?)
  // Låter Företag och Arbetsgivare lägga upp jobb
  if (session.user.accountType === "Privat") {
    return NextResponse.json({ error: "Endast arbetsgivare kan publicera jobb" }, { status: 403 });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) return NextResponse.json({ error: "Användare hittades inte" }, { status: 404 });

    if (!user.canPublishAds) {
      return NextResponse.json({ error: "Ditt konto väntar på godkännande för att publicera annonser." }, { status: 403 });
    }

    const body = await req.json();
    const { 
      title, industry, location, scope, duration, vacancies, description, 
      requirements, merits, deadline, applyUrl, contactPerson, contactEmail, contactPhone, hideContactPhone
    } = body;

    const job = await prisma.jobAd.create({
      data: {
        title,
        industry,
        location,
        scope,
        duration,
        vacancies: vacancies ? parseInt(vacancies, 10) : 1,
        description,
        requirements,
        merits: merits || null,
        deadline: new Date(deadline),
        applyUrl: applyUrl || null,
        contactPerson: contactPerson || null,
        contactEmail: contactEmail || null,
        contactPhone: contactPhone || null,
        hideContactPhone: hideContactPhone || false,
        companyName: session.user.companyName || session.user.name || "Arbetsgivare",
        authorId: session.user.id
      }
    });

    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    console.error("Jobb skapande fel:", error);
    return NextResponse.json({ error: "Gick inte att skapa jobbannonsen" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session: any = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Du måste vara inloggad" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { 
      id, title, industry, location, scope, duration, vacancies, description, 
      requirements, merits, deadline, applyUrl, contactPerson, contactEmail, contactPhone, hideContactPhone
    } = body;

    if (!id) {
      return NextResponse.json({ error: "Saknar jobb-ID" }, { status: 400 });
    }

    // Hämta annonsen och verifiera ägandeskap
    const existingJob = await prisma.jobAd.findUnique({ where: { id } });
    if (!existingJob) {
      return NextResponse.json({ error: "Jobbannonsen hittades inte" }, { status: 404 });
    }

    if (existingJob.authorId !== session.user.id && !session.user.isAdmin) {
      return NextResponse.json({ error: "Obehörig" }, { status: 403 });
    }

    const updatedJob = await prisma.jobAd.update({
      where: { id },
      data: {
        title,
        industry,
        location,
        scope,
        duration,
        vacancies: vacancies ? parseInt(vacancies, 10) : 1,
        description,
        requirements,
        merits: merits || null,
        deadline: new Date(deadline),
        applyUrl: applyUrl || null,
        contactPerson: contactPerson || null,
        contactEmail: contactEmail || null,
        contactPhone: contactPhone || null,
        hideContactPhone: hideContactPhone || false,
      }
    });

    return NextResponse.json(updatedJob, { status: 200 });
  } catch (error) {
    console.error("Jobb uppdaterings fel:", error);
    return NextResponse.json({ error: "Gick inte att uppdatera jobbannonsen" }, { status: 500 });
  }
}
