import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { notFound, redirect } from "next/navigation";
import CreateAdForm from "@/app/skapa/CreateAdForm";
import BackButton from "@/components/BackButton";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

export default async function UserEditAdPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/");
  }

  const resolvedParams = await params;

  const ad = await prisma.ad.findUnique({
    where: { id: resolvedParams.id },
    include: { author: true }
  });

  if (!ad) {
    notFound();
  }

  const isAdmin = (session.user as any).isAdmin;
  const isOwner = ad.author.email === session.user.email;

  if (!isAdmin && !isOwner) {
    redirect("/");
  }

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
      <BackButton label="Avbryt / Tillbaka" />
      <h1 style={{ marginBottom: "2rem", color: "var(--color-primary)" }}>Redigera din annons</h1>
      <CreateAdForm categories={categories} initialData={ad} settings={settings} />
    </div>
  );
}
