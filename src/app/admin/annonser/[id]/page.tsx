import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { notFound, redirect } from "next/navigation";
import CreateAdForm from "@/app/skapa/CreateAdForm";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

export default async function AdminEditAdPage({ params }: { params: Promise<{ id: string }> }) {
  const session: any = await getServerSession(authOptions);

  if (!session?.user?.email || !(session.user as any).isAdmin) {
    redirect("/");
  }

  const resolvedParams = await params;

  const ad = await prisma.ad.findUnique({
    where: { id: resolvedParams.id }
  });

  if (!ad) {
    notFound();
  }

  const categories = await prisma.category.findMany({
    where: { parentId: null },
    include: { subcategories: { include: { subcategories: true } } }
  });

  const settings = await prisma.settings.findUnique({ where: { id: "default" } });

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "2rem", color: "var(--color-primary)" }}>Redigera Annons (Admin)</h1>
      <CreateAdForm categories={categories} initialData={ad} settings={settings} />
    </div>
  );
}
