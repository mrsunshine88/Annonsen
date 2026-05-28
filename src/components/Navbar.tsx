"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  const closeMenu = () => setMobileMenuOpen(false);

  const isCompany = (session?.user as any)?.accountType === "Företag";

  return (
    <header className="navbar-header" style={{ position: 'relative', zIndex: 1000 }}>
      <div className="container navbar-container">
        <Link href="/" className="navbar-logo" onClick={closeMenu}>
          Annonsen
        </Link>

        {/* Hamburgermeny-knapp för mobil */}
        <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Meny">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {mobileMenuOpen ? (
              <path d="M18 6L6 18M6 6l12 12" />
            ) : (
              <path d="M3 12h18M3 6h18M3 18h18" />
            )}
          </svg>
        </button>

        {/* Skrivbordsmeny */}
        <nav className="navbar-desktop">
          {status === "loading" ? null : session ? (
            <>
              {(session.user as any)?.isAdmin && (
                <Link href="/admin/konton" className="dashboard-link" style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', fontWeight: 'bold', color: 'var(--color-primary)' }}>Admin</Link>
              )}
              <Link href="/dashboard/annonser" className="dashboard-link" style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)' }}>Mina Annonser</Link>
              <Link href="/dashboard/meddelanden" className="dashboard-link" style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)' }}>Meddelanden</Link>
              <Link href="/dashboard/installningar" className="dashboard-link" style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)' }}>Inställningar</Link>
              <button onClick={() => signOut({ callbackUrl: '/' })} className="dashboard-link" style={{ padding: '0.5rem 1rem', color: 'var(--color-error)' }}>Logga ut</button>
            </>
          ) : (
            <Link href="/login" className="btn-secondary">Logga in</Link>
          )}
          {deferredPrompt && (
            <button onClick={handleInstall} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              Installera App
            </button>
          )}
          <Link href="/skapa" className="btn-primary">
            {isCompany ? "Företagsannons" : "Skapa annons"}
          </Link>
        </nav>
      </div>

      {/* Mobilmeny (Rullgardin) */}
      {mobileMenuOpen && (
        <div className="mobile-menu glass-panel" style={{ zIndex: 999, borderRadius: "0 0 var(--radius-md) var(--radius-md)" }}>
          <Link href="/skapa" className="mobile-dropdown-item" onClick={closeMenu} style={{ fontWeight: 600, color: "var(--color-primary)" }}>
            {isCompany ? "Företagsannons" : "Skapa annons"}
          </Link>
          
          {deferredPrompt && (
            <button onClick={() => { closeMenu(); handleInstall(); }} className="mobile-dropdown-item" style={{ textAlign: "left", width: "100%", display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: 'var(--color-primary)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              Installera App
            </button>
          )}

          {status === "loading" ? null : session ? (
            <>
              {(session.user as any)?.isAdmin && (
                <Link href="/admin/konton" className="mobile-dropdown-item" onClick={closeMenu} style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>Admin</Link>
              )}
              <Link href="/dashboard/annonser" className="mobile-dropdown-item" onClick={closeMenu}>Mina Annonser</Link>
              <Link href="/dashboard/meddelanden" className="mobile-dropdown-item" onClick={closeMenu}>Meddelanden</Link>
              <Link href="/dashboard/installningar" className="mobile-dropdown-item" onClick={closeMenu}>Inställningar</Link>
              <button onClick={() => { closeMenu(); signOut({ callbackUrl: '/' }); }} className="mobile-dropdown-item" style={{ color: 'var(--color-error)', textAlign: "left", width: "100%" }}>Logga ut</button>
            </>
          ) : (
            <Link href="/login" className="mobile-dropdown-item" onClick={closeMenu}>Logga in</Link>
          )}
        </div>
      )}
    </header>
  );
}
