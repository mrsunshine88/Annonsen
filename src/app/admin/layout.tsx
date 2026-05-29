import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session: any = await getServerSession(authOptions);

  // Dubbel säkerhetskoll: Bara inloggade admins får se detta
  if (!session?.user?.email || !(session.user as any).isAdmin) {
    redirect("/");
  }

  return (
    <div className="responsive-flex" style={{ minHeight: '70vh' }}>
      <aside className="admin-sidebar">
        <div className="glass-panel" style={{ padding: '1.5rem', position: 'sticky', top: '2rem' }}>
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', color: 'var(--color-primary)' }}>Adminpanel</h2>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Link 
              href="/admin/konton" 
              className="dashboard-link"
              style={{ display: 'block', margin: '0.2rem 0' }}
            >
              Hantera Konton
            </Link>
            <Link 
              href="/admin/annonser" 
              className="dashboard-link"
              style={{ display: 'block', margin: '0.2rem 0' }}
            >
              Hantera Annonser
            </Link>
            <Link 
              href="/admin/kostnad" 
              className="dashboard-link"
              style={{ display: 'block', margin: '0.2rem 0' }}
            >
              Privatperson
            </Link>
            <Link 
              href="/admin/foretag" 
              className="dashboard-link"
              style={{ display: 'block', margin: '0.2rem 0' }}
            >
              Företag
            </Link>
            <Link 
              href="/admin/arbetsgivare" 
              className="dashboard-link"
              style={{ display: 'block', margin: '0.2rem 0' }}
            >
              Arbetsgivare
            </Link>
          </nav>
        </div>
      </aside>

      <main style={{ flex: 1 }}>
        {children}
      </main>
    </div>
  );
}
