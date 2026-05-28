import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/login");
  }

  return (
    <div style={{ marginTop: '2rem' }}>
      <main>
        <div className="glass-panel" style={{ padding: '2rem', minHeight: '500px' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
