import { PrismaClient } from "@prisma/client";
import CreateJobForm from "./CreateJobForm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import BackButton from "@/components/BackButton";

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export default async function SkapaJobbPage() {
  const session: any = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/login?callbackUrl=/skapa-jobb");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { 
      accountType: true,
      canPublishAds: true
    }
  });

  if (!user || (user.accountType !== "Arbetsgivare" && user.accountType !== "Företag")) {
    return (
      <div style={{ maxWidth: "800px", margin: "2rem auto", textAlign: "center" }}>
        <h1 style={{ color: "var(--color-error)" }}>Obehörig</h1>
        <p>Endast arbetsgivare och företag kan skapa jobbannonser.</p>
      </div>
    );
  }

  if (!user.canPublishAds) {
    return (
      <div style={{ maxWidth: "800px", margin: "4rem auto", textAlign: "center" }}>
        <div className="glass-panel" style={{ padding: "3rem" }}>
          <h1 style={{ color: "var(--color-primary)", marginBottom: "1rem" }}>Konto under granskning</h1>
          <p style={{ color: "var(--color-text-secondary)" }}>Ditt konto väntar på att bli godkänt av en administratör innan du kan publicera jobbannonser.</p>
        </div>
      </div>
    );
  }

  const settings = await prisma.settings.findUnique({ where: { id: "default" } });

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "1rem" }}>
      <BackButton label="Tillbaka" />
      <h1 style={{ marginBottom: "2rem", color: "var(--color-primary)", marginTop: "1rem" }}>Skapa Jobbannons</h1>
      <CreateJobForm settings={settings} />
    </div>
  );
}
