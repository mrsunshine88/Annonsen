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
              style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', display: 'block' }}
            >
              Hantera Konton
            </Link>
            <Link 
              href="/admin/annonser" 
              className="dashboard-link"
              style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', display: 'block' }}
            >
              Hantera Annonser
            </Link>
            <Link 
              href="/admin/kostnad" 
              className="dashboard-link"
              style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', display: 'block' }}
            >
              Kostnad (Swish)
            </Link>
            <Link 
              href="/admin/foretag" 
              className="dashboard-link"
              style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', display: 'block' }}
            >
              Företag
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
