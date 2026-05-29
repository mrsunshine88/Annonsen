import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import AdminSidebar from "./AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session: any = await getServerSession(authOptions);

  // Dubbel säkerhetskoll: Bara inloggade admins får se detta
  if (!session?.user?.email || !(session.user as any).isAdmin) {
    redirect("/");
  }

  return (
    <div className="responsive-flex" style={{ minHeight: '70vh' }}>
      <AdminSidebar />

      <main style={{ flex: 1 }}>
        {children}
      </main>
    </div>
  );
}
