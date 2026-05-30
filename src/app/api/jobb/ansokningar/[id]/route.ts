import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const session: any = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Du måste vara inloggad" }, { status: 401 });
  }

  try {
    const { status } = await req.json();

    if (!status || (status !== "Ny" && status !== "Hanterad")) {
      return NextResponse.json({ error: "Ogiltig status" }, { status: 400 });
    }

    const application = await prisma.jobApplication.findUnique({
      where: { id: resolvedParams.id },
      include: { job: true }
    });

    if (!application) {
      return NextResponse.json({ error: "Ansökan hittades inte" }, { status: 404 });
    }

    // Endast arbetsgivaren som äger annonsen (eller en admin) får ändra status
    if (application.job.authorId !== session.user.id && !session.user.isAdmin) {
      return NextResponse.json({ error: "Obehörig" }, { status: 403 });
    }

    const updatedApplication = await prisma.jobApplication.update({
      where: { id: resolvedParams.id },
      data: { status }
    });

    return NextResponse.json(updatedApplication);
  } catch (error) {
    console.error("Gick inte att uppdatera ansökan:", error);
    return NextResponse.json({ error: "Gick inte att uppdatera ansökan" }, { status: 500 });
  }
}
