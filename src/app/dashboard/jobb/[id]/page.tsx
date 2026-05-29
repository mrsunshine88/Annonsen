import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import BackButton from "@/components/BackButton";
import CreateJobForm from "@/app/skapa-jobb/CreateJobForm";

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export default async function EditJobPage({ params }: { params: { id: string } }) {
  const session: any = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  const job = await prisma.jobAd.findUnique({
    where: { id: params.id }
  });

  if (!job) {
    return (
      <div style={{ maxWidth: "800px", margin: "2rem auto", textAlign: "center" }}>
        <h1 style={{ color: "var(--color-error)" }}>Hittades inte</h1>
        <p>Denna jobbannons existerar inte.</p>
        <BackButton label="Gå tillbaka" />
      </div>
    );
  }

  if (job.authorId !== session.user.id && !session.user.isAdmin) {
    return (
      <div style={{ maxWidth: "800px", margin: "2rem auto", textAlign: "center" }}>
        <h1 style={{ color: "var(--color-error)" }}>Obehörig</h1>
        <p>Du har inte behörighet att redigera denna annons.</p>
        <BackButton label="Gå tillbaka" />
      </div>
    );
  }

  const settings = await prisma.settings.findUnique({ where: { id: "default" } });

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "1rem" }}>
      <BackButton label="Tillbaka till Mina Jobb" />
      <h1 style={{ marginBottom: "2rem", color: "var(--color-primary)", marginTop: "1rem" }}>Redigera Jobbannons</h1>
      <CreateJobForm settings={settings} initialData={job} isEdit={true} />
    </div>
  );
}
