import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const session: any = await getServerSession(authOptions);
  
  try {
    const body = await req.json();
    const { name, email, phone, message, cvUrl, coverLetterUrl } = body;

    const job = await prisma.jobAd.findUnique({
      where: { id: resolvedParams.id }
    });

    if (!job) {
      return NextResponse.json({ error: "Jobbet hittades inte" }, { status: 404 });
    }

    if (!name || !email || !cvUrl || !coverLetterUrl) {
      return NextResponse.json({ error: "Saknar obligatoriska fält" }, { status: 400 });
    }

    if (session?.user?.id === job.authorId) {
      return NextResponse.json({ error: "Du kan inte ansöka till din egen jobbannons" }, { status: 400 });
    }

    // Skapa JobApplication
    const applicationData: any = {
      name,
      email,
      phone,
      message,
      cvUrl,
      coverLetterUrl,
      jobId: job.id,
    };

    if (session?.user?.id) {
      applicationData.applicantId = session.user.id;
    } else {
      return NextResponse.json({ error: "Du måste vara inloggad för att ansöka" }, { status: 401 });
    }

    const application = await prisma.jobApplication.create({
      data: applicationData
    });

    return NextResponse.json({ success: true, applicationId: application.id });
  } catch (error) {
    console.error("Ansökan fel:", error);
    return NextResponse.json({ error: "Kunde inte skicka ansökan" }, { status: 500 });
  }
}
