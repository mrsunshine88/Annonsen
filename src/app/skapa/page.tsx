import { PrismaClient } from "@prisma/client";
import CreateAdForm from "./CreateAdForm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import BackButton from "@/components/BackButton";

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export default async function SkapaAnnonsPage() {
  const session: any = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/login?callbackUrl=/skapa");
  }

  // Hämta autoLocation och defaultLocation
  let autoLocation = true;
  let defaultLocation: string | null = null;
  let user: any = null;
  
  if (session?.user?.email) {
    user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { 
        autoLocation: true, 
        defaultLocation: true,
        accountType: true,
        customCompanyAdPrice: true,
        canPublishAds: true
      }
    });
    if (user) {
      if (user.autoLocation !== undefined) autoLocation = user.autoLocation;
      if (user.defaultLocation) defaultLocation = user.defaultLocation;
    }
  }

  // Hämta huvudkategorier
  const categories = await prisma.category.findMany({
    where: { parentId: null },
    include: { 
      subcategories: {
        include: { subcategories: true }
      }
    }
  });

  const settings = await prisma.settings.findUnique({ where: { id: "default" } });

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <BackButton label="Tillbaka till start" href="/" />
      <h1 style={{ marginBottom: "2rem", color: "var(--color-primary)" }}>Skapa Annons</h1>
      
      {session?.user?.email && user?.accountType === "Företag" && !user.canPublishAds ? (
        <div style={{ padding: "2rem", backgroundColor: "var(--color-bg-surface)", border: "1px solid var(--color-error)", borderRadius: "var(--radius-lg)", textAlign: "center" }}>
          <h2 style={{ color: "var(--color-error)", marginBottom: "1rem" }}>Aktivering krävs</h2>
          <p style={{ color: "var(--color-text-secondary)", marginBottom: "2rem" }}>
            Ditt konto måste aktiveras innan du kan publicera annonser. Om du precis har skapat kontot väntar det på godkännande. Om du har blivit godkänd behöver du aktivera annonseringen under dina inställningar.
          </p>
          <a href="/dashboard/installningar" className="btn-primary" style={{ display: "inline-block" }}>Gå till inställningar</a>
        </div>
      ) : (
        <CreateAdForm 
          categories={categories} 
          autoLocation={autoLocation} 
          defaultLocation={defaultLocation} 
          settings={settings}
          user={user}
        />
      )}
    </div>
  );
}
