"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function AdminSidebar() {
  const { status } = useSession();
  const [unhandledReportsCount, setUnhandledReportsCount] = useState(0);

  useEffect(() => {
    if (status !== "authenticated") return;
    
    const checkStatus = async () => {
      try {
        const res = await fetch('/api/auth/status');
        if (res.ok) {
          const data = await res.json();
          if (data.unhandledReportsCount !== undefined) {
            setUnhandledReportsCount(data.unhandledReportsCount);
          }
        }
      } catch (err) {
        console.error("Failed to check status", err);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 10000);
    return () => clearInterval(interval);
  }, [status]);

  return (
    <aside className="admin-sidebar">
      <div className="glass-panel" style={{ padding: '1.5rem', position: 'sticky', top: '2rem' }}>
        
        {/* Skrivbord: Vanlig meny */}
        <div className="admin-nav-desktop">
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', color: 'var(--color-primary)' }}>Adminpanel</h2>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Link href="/admin/konton" className="dashboard-link" style={{ display: 'block', margin: '0.2rem 0' }}>Hantera Konton</Link>
            <Link href="/admin/annonser" className="dashboard-link" style={{ display: 'block', margin: '0.2rem 0' }}>Hantera Annonser</Link>
            <Link href="/admin/anmalningar" className="dashboard-link" style={{ display: 'block', margin: '0.2rem 0', position: 'relative' }}>
              Anmälningar
              {unhandledReportsCount > 0 && (
                <span style={{ position: 'absolute', top: '10px', right: '10px', background: 'var(--color-error, red)', color: 'white', borderRadius: '50%', padding: '0 5px', fontSize: '10px', fontWeight: 'bold' }}>
                  {unhandledReportsCount}
                </span>
              )}
            </Link>
            <Link href="/admin/kostnad" className="dashboard-link" style={{ display: 'block', margin: '0.2rem 0' }}>Privatperson</Link>
            <Link href="/admin/foretag" className="dashboard-link" style={{ display: 'block', margin: '0.2rem 0' }}>Företag</Link>
            <Link href="/admin/arbetsgivare" className="dashboard-link" style={{ display: 'block', margin: '0.2rem 0' }}>Arbetsgivare</Link>
            <Link href="/admin/kontakt" className="dashboard-link" style={{ display: 'block', margin: '0.2rem 0' }}>💬 Kundtjänst</Link>
            <Link href="/admin/datautdrag" className="dashboard-link" style={{ display: 'block', margin: '0.2rem 0' }}>👮‍♂️ Datautdrag</Link>
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
              <Link href="/admin/anmalningar" style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid rgba(226, 232, 240, 0.5)', color: 'var(--color-primary)', fontWeight: 600 }}>
                Anmälningar
                {unhandledReportsCount > 0 && (
                  <span style={{ background: 'var(--color-error, red)', color: 'white', borderRadius: '50%', padding: '0 8px', fontSize: '12px', fontWeight: 'bold' }}>
                    {unhandledReportsCount}
                  </span>
                )}
              </Link>
              <Link href="/admin/kostnad" style={{ display: 'block', padding: '1rem 0', borderBottom: '1px solid rgba(226, 232, 240, 0.5)', color: 'var(--color-primary)', fontWeight: 600 }}>Privatperson</Link>
              <Link href="/admin/foretag" style={{ display: 'block', padding: '1rem 0', borderBottom: '1px solid rgba(226, 232, 240, 0.5)', color: 'var(--color-primary)', fontWeight: 600 }}>Företag</Link>
              <Link href="/admin/arbetsgivare" style={{ display: 'block', padding: '1rem 0', borderBottom: '1px solid rgba(226, 232, 240, 0.5)', color: 'var(--color-primary)', fontWeight: 600 }}>Arbetsgivare</Link>
              <Link href="/admin/kontakt" style={{ display: 'block', padding: '1rem 0', borderBottom: '1px solid rgba(226, 232, 240, 0.5)', color: 'var(--color-primary)', fontWeight: 600 }}>💬 Kundtjänst</Link>
              <Link href="/admin/datautdrag" style={{ display: 'block', padding: '1rem 0', color: 'var(--color-primary)', fontWeight: 600 }}>👮‍♂️ Datautdrag</Link>
            </nav>
          </details>
        </div>

      </div>
    </aside>
  );
}
