"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unhandledReportsCount, setUnhandledReportsCount] = useState(0);

  useEffect(() => {
    if (status !== "authenticated") return;
    
    const checkStatus = async () => {
      try {
        const res = await fetch('/api/auth/status');
        if (res.ok) {
          const data = await res.json();
          if (data.isBlocked) {
            signOut({ callbackUrl: '/login?error=blocked' });
          } else {
            setUnreadCount(data.unreadCount);
            if (data.unhandledReportsCount !== undefined) {
              setUnhandledReportsCount(data.unhandledReportsCount);
            }
          }
        }
      } catch (err) {
        console.error("Failed to check status", err);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 60000); // Koll var 60:e sekund istället för 10 för att spara prestanda
    return () => clearInterval(interval);
  }, [status]);

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
  const isEmployer = (session?.user as any)?.accountType === "Arbetsgivare";

  return (
    <header className="navbar-header">
      <div className="container navbar-container">
        <Link href={isEmployer ? "/jobb" : "/"} className="navbar-logo" onClick={closeMenu}>
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
          <Link href="/jobb" className="dashboard-link">Jobb</Link>
          {status === "loading" ? null : session ? (
            <>
              <Link href={isEmployer ? "/dashboard/jobb" : "/dashboard/annonser"} className="dashboard-link">Mina sidor</Link>
              <Link href="/meddelanden" className="dashboard-link" style={{ position: 'relative' }}>
                Meddelanden
                {unreadCount > 0 && (
                  <span style={{ position: 'absolute', top: '2px', right: '2px', background: 'red', color: 'white', borderRadius: '50%', padding: '0 6px', fontSize: '10px', fontWeight: 'bold' }}>
                    {unreadCount}
                  </span>
                )}
              </Link>

              {(session.user as any)?.isAdmin && (
                <Link href="/admin/konton" className="dashboard-link" style={{ position: 'relative' }}>
                  Admin
                  {unhandledReportsCount > 0 && (
                    <span style={{ position: 'absolute', top: '2px', right: '-5px', background: 'var(--color-error, red)', color: 'white', borderRadius: '50%', padding: '0 5px', fontSize: '10px', fontWeight: 'bold' }}>
                      {unhandledReportsCount}
                    </span>
                  )}
                </Link>
              )}
              <button onClick={() => signOut({ callbackUrl: '/' })} className="dashboard-link-danger">Logga ut</button>
            </>
          ) : (
            <Link href="/login" className="btn-navbar-secondary">Logga in</Link>
          )}
          {isEmployer ? (
            <Link href="/skapa-jobb" className="btn-navbar-primary">
              Skapa Jobb
            </Link>
          ) : (
            <Link href="/skapa" className="btn-navbar-primary">
              {isCompany ? "Företagsannons" : "Skapa annons"}
            </Link>
          )}
        </nav>
      </div>

      {/* Mobilmeny (Rullgardin) */}
      {mobileMenuOpen && (
        <div className="mobile-menu">
          {isEmployer ? (
            <Link href="/skapa-jobb" className="mobile-dropdown-item" onClick={closeMenu}>
              Skapa Jobb
            </Link>
          ) : (
            <Link href="/skapa" className="mobile-dropdown-item" onClick={closeMenu}>
              {isCompany ? "Företagsannons" : "Skapa annons"}
            </Link>
          )}
          
          {deferredPrompt && (
            <button onClick={() => { closeMenu(); handleInstall(); }} className="mobile-dropdown-item" style={{ textAlign: "left", width: "100%", display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              Installera App
            </button>
          )}

          <Link href="/jobb" className="mobile-dropdown-item" onClick={closeMenu}>Jobb</Link>

          {status === "loading" ? null : session ? (
            <>
              <Link href={isEmployer ? "/dashboard/jobb" : "/dashboard/annonser"} className="mobile-dropdown-item" onClick={closeMenu}>Mina sidor</Link>
              <Link href="/meddelanden" className="mobile-dropdown-item" onClick={closeMenu} style={{ display: 'flex', justifyContent: 'space-between' }}>
                Meddelanden
                {unreadCount > 0 && (
                  <span style={{ background: 'red', color: 'white', borderRadius: '50%', padding: '0 8px', fontSize: '12px', fontWeight: 'bold' }}>
                    {unreadCount}
                  </span>
                )}
              </Link>

              {(session.user as any)?.isAdmin && (
                <Link href="/admin/konton" className="mobile-dropdown-item" onClick={closeMenu} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  Admin
                  {unhandledReportsCount > 0 && (
                    <span style={{ background: 'var(--color-error, red)', color: 'white', borderRadius: '50%', padding: '0 8px', fontSize: '12px', fontWeight: 'bold' }}>
                      {unhandledReportsCount}
                    </span>
                  )}
                </Link>
              )}
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
