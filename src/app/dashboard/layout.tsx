import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

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

  return (
    <div className="responsive-flex" style={{ minHeight: '70vh' }}>
      <aside className="admin-sidebar">
        <div className="glass-panel" style={{ padding: '1.5rem', position: 'sticky', top: '2rem' }}>
          
          {/* Skrivbord: Vanlig meny */}
          <div className="admin-nav-desktop">
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', color: 'var(--color-primary)' }}>Mina sidor</h2>
            {isEmployer ? (
              <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Link href="/dashboard/jobb" className="dashboard-link" style={{ display: 'block', margin: '0.2rem 0' }}>Dina Jobb</Link>
                <Link href="/dashboard/ansokningar" className="dashboard-link" style={{ display: 'block', margin: '0.2rem 0' }}>Ansökningar</Link>
                <Link href="/dashboard/installningar" className="dashboard-link" style={{ display: 'block', margin: '0.2rem 0' }}>Företagssida (Inställningar)</Link>
                <Link href={`/butik/${(session.user as any)?.id}`} target="_blank" className="dashboard-link" style={{ display: 'block', margin: '0.2rem 0' }}>Visa Publik Sida ↗</Link>
              </nav>
            ) : (
              <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Link href="/dashboard/annonser" className="dashboard-link" style={{ display: 'block', margin: '0.2rem 0' }}>Mina Annonser</Link>
                <Link href="/dashboard/favoriter" className="dashboard-link" style={{ display: 'block', margin: '0.2rem 0' }}>Favoriter</Link>
                <Link href="/dashboard/flodet" className="dashboard-link" style={{ display: 'block', margin: '0.2rem 0' }}>Flödet</Link>
                <Link href="/dashboard/installningar" className="dashboard-link" style={{ display: 'block', margin: '0.2rem 0' }}>Inställningar</Link>
                {(session.user as any)?.accountType === "Företag" && (
                  <Link href={`/butik/${(session.user as any)?.id}`} target="_blank" className="dashboard-link" style={{ display: 'block', margin: '0.2rem 0' }}>Visa Publik Sida ↗</Link>
                )}
              </nav>
            )}
          </div>

          {/* Mobil: Rullgardin (Details/Summary) */}
          <div className="admin-nav-mobile">
            <details style={{ outline: 'none' }}>
              <summary style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--color-primary)', cursor: 'pointer', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', outline: 'none', padding: '0.5rem 0' }}>
                Mina sidor
                <span style={{ fontSize: '0.8rem' }}>▼</span>
              </summary>
              {isEmployer ? (
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '0', marginTop: '0.5rem', borderTop: '1px solid var(--color-border)' }}>
                  <Link href="/dashboard/jobb" style={{ display: 'block', padding: '1rem 0', borderBottom: '1px solid rgba(226, 232, 240, 0.5)', color: 'var(--color-primary)', fontWeight: 600 }}>Dina Jobb</Link>
                  <Link href="/dashboard/ansokningar" style={{ display: 'block', padding: '1rem 0', borderBottom: '1px solid rgba(226, 232, 240, 0.5)', color: 'var(--color-primary)', fontWeight: 600 }}>Ansökningar</Link>
                  <Link href="/dashboard/installningar" style={{ display: 'block', padding: '1rem 0', color: 'var(--color-primary)', fontWeight: 600 }}>Företagssida (Inställningar)</Link>
                  <Link href={`/butik/${(session.user as any)?.id}`} target="_blank" style={{ display: 'block', padding: '1rem 0', color: 'var(--color-primary)', fontWeight: 600 }}>Visa Publik Sida ↗</Link>
                </nav>
              ) : (
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '0', marginTop: '0.5rem', borderTop: '1px solid var(--color-border)' }}>
                  <Link href="/dashboard/annonser" style={{ display: 'block', padding: '1rem 0', borderBottom: '1px solid rgba(226, 232, 240, 0.5)', color: 'var(--color-primary)', fontWeight: 600 }}>Mina Annonser</Link>
                  <Link href="/dashboard/favoriter" style={{ display: 'block', padding: '1rem 0', borderBottom: '1px solid rgba(226, 232, 240, 0.5)', color: 'var(--color-primary)', fontWeight: 600 }}>Favoriter</Link>
                  <Link href="/dashboard/flodet" style={{ display: 'block', padding: '1rem 0', borderBottom: '1px solid rgba(226, 232, 240, 0.5)', color: 'var(--color-primary)', fontWeight: 600 }}>Flödet</Link>
                  <Link href="/dashboard/installningar" style={{ display: 'block', padding: '1rem 0', color: 'var(--color-primary)', fontWeight: 600 }}>Inställningar</Link>
                  {(session.user as any)?.accountType === "Företag" && (
                    <Link href={`/butik/${(session.user as any)?.id}`} target="_blank" style={{ display: 'block', padding: '1rem 0', color: 'var(--color-primary)', fontWeight: 600 }}>Visa Publik Sida ↗</Link>
                  )}
                </nav>
              )}
            </details>
          </div>

        </div>
      </aside>

      <main style={{ flex: 1 }}>
        <div className="glass-panel" style={{ padding: '2rem', minHeight: '500px' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
