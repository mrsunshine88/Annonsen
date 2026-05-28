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
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { 
        autoLocation: true, 
        defaultLocation: true,
        accountType: true,
        customCompanyAdPrice: true
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
      <BackButton label="Tillbaka" />
      <h1 style={{ marginBottom: "2rem", color: "var(--color-primary)" }}>Skapa Annons</h1>
      <CreateAdForm 
        categories={categories} 
        autoLocation={autoLocation} 
        defaultLocation={defaultLocation} 
        settings={settings}
        user={session?.user?.email ? await prisma.user.findUnique({ where: { email: session.user.email }, select: { accountType: true, customCompanyAdPrice: true } }) : null}
      />
    </div>
  );
}
