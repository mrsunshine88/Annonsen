import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session: any = await getServerSession(authOptions);
  
  try {
    const body = await req.json();
    const { name, email, phone, message, cvUrl, coverLetterUrl } = body;

    const job = await prisma.jobAd.findUnique({
      where: { id: params.id }
    });

    if (!job) {
      return NextResponse.json({ error: "Jobbet hittades inte" }, { status: 404 });
    }

    if (!name || !email || !cvUrl || !coverLetterUrl) {
      return NextResponse.json({ error: "Saknar obligatoriska fält" }, { status: 400 });
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

    // Skapa ett meddelande-tråd till arbetsgivaren
    const messageContent = `[NY ANSÖKAN]\nNamn: ${name}\nE-post: ${email}\nTelefon: ${phone || 'Ej angivet'}\n\nMeddelande:\n${message || 'Inget meddelande'}\n\nCV: ${cvUrl}\nPersonligt brev: ${coverLetterUrl}`;

    await prisma.message.create({
      data: {
        content: messageContent,
        senderId: session.user.id,
        receiverId: job.authorId,
        isJobMessage: true, // Markerad som jobbmeddelande
        jobAdId: job.id, // Vi använder nu den nya kolumnen jobAdId
      }
    });

    return NextResponse.json({ success: true, applicationId: application.id });
  } catch (error) {
    console.error("Ansökan fel:", error);
    return NextResponse.json({ error: "Kunde inte skicka ansökan" }, { status: 500 });
  }
}
