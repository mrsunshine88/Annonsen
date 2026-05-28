import { PrismaClient } from "@prisma/client";
import SearchClient from "./SearchClient";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import BackButton from "@/components/BackButton";

const prisma = new PrismaClient();

export default async function SearchPage() {
  const session = await getServerSession(authOptions);
  let autoLocation = true;
  let defaultLocation: string | null = null;

  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { autoLocation: true, defaultLocation: true }
    });
    if (user) {
      if (user.autoLocation !== undefined) autoLocation = user.autoLocation;
      if (user.defaultLocation) defaultLocation = user.defaultLocation;
    }
  }

  const categories = await prisma.category.findMany({
    where: { parentId: null },
    include: { 
      subcategories: {
        include: { subcategories: true }
      }
    }
  });

  return (
    <div style={{ minHeight: "80vh" }}>
      <BackButton label="Tillbaka till start" style={{ marginBottom: "1rem" }} />
      <SearchClient categories={categories} autoLocation={autoLocation} defaultLocation={defaultLocation} />
    </div>
  );
}
