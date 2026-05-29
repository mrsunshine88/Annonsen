import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import DashboardSidebar from "./DashboardSidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session: any = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/login");
  }

  const isEmployer = (session.user as any)?.accountType === "Arbetsgivare";
  const accountType = (session.user as any)?.accountType || "Privat";

  return (
    <div className="responsive-flex" style={{ minHeight: '70vh' }}>
      <DashboardSidebar isEmployer={isEmployer} accountType={accountType} />

      <main style={{ flex: 1 }}>
        <div className="glass-panel" style={{ padding: '2rem', minHeight: '500px' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
