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
          
          {/* Skrivbord: Vanlig meny */}
          <div className="admin-nav-desktop">
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', color: 'var(--color-primary)' }}>Adminpanel</h2>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Link href="/admin/konton" className="dashboard-link" style={{ display: 'block', margin: '0.2rem 0' }}>Hantera Konton</Link>
              <Link href="/admin/annonser" className="dashboard-link" style={{ display: 'block', margin: '0.2rem 0' }}>Hantera Annonser</Link>
              <Link href="/admin/anmalningar" className="dashboard-link" style={{ display: 'block', margin: '0.2rem 0' }}>Anmälningar</Link>
              <Link href="/admin/kostnad" className="dashboard-link" style={{ display: 'block', margin: '0.2rem 0' }}>Privatperson</Link>
              <Link href="/admin/foretag" className="dashboard-link" style={{ display: 'block', margin: '0.2rem 0' }}>Företag</Link>
              <Link href="/admin/arbetsgivare" className="dashboard-link" style={{ display: 'block', margin: '0.2rem 0' }}>Arbetsgivare</Link>
            </nav>
          </div>

          {/* Mobil: Rullgardin (Details/Summary) */}
          <div className="admin-nav-mobile">
            <details style={{ outline: 'none' }}>
              <summary style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--color-primary)', cursor: 'pointer', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', outline: 'none', padding: '0.5rem 0' }}>
                Admin Meny
                <span style={{ fontSize: '0.8rem' }}>▼</span>
              </summary>
              <nav style={{ display: 'flex', flexDirection: 'column', gap: '0', marginTop: '0.5rem', borderTop: '1px solid var(--color-border)' }}>
                <Link href="/admin/konton" style={{ display: 'block', padding: '1rem 0', borderBottom: '1px solid rgba(226, 232, 240, 0.5)', color: 'var(--color-primary)', fontWeight: 600 }}>Hantera Konton</Link>
                <Link href="/admin/annonser" style={{ display: 'block', padding: '1rem 0', borderBottom: '1px solid rgba(226, 232, 240, 0.5)', color: 'var(--color-primary)', fontWeight: 600 }}>Hantera Annonser</Link>
                <Link href="/admin/anmalningar" style={{ display: 'block', padding: '1rem 0', borderBottom: '1px solid rgba(226, 232, 240, 0.5)', color: 'var(--color-primary)', fontWeight: 600 }}>Anmälningar</Link>
                <Link href="/admin/kostnad" style={{ display: 'block', padding: '1rem 0', borderBottom: '1px solid rgba(226, 232, 240, 0.5)', color: 'var(--color-primary)', fontWeight: 600 }}>Privatperson</Link>
                <Link href="/admin/foretag" style={{ display: 'block', padding: '1rem 0', borderBottom: '1px solid rgba(226, 232, 240, 0.5)', color: 'var(--color-primary)', fontWeight: 600 }}>Företag</Link>
                <Link href="/admin/arbetsgivare" style={{ display: 'block', padding: '1rem 0', color: 'var(--color-primary)', fontWeight: 600 }}>Arbetsgivare</Link>
              </nav>
            </details>
          </div>

        </div>
      </aside>

      <main style={{ flex: 1 }}>
        {children}
      </main>
    </div>
  );
}
