"use client";

import { useState, useEffect } from "react";

export default function InstallAppBox() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Lyssna på när Chrome säger "Appen är redo att installeras!"
    const handler = (e: any) => {
      e.preventDefault(); // Stoppa webbläsarens egen (fula) lilla flik
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Visa den inbyggda rutan
    deferredPrompt.prompt();

    // Vänta på användarens val
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  if (!deferredPrompt || isDismissed) {
    return null; // Visa inget om appen redan är installerad eller om användaren stängt rutan
  }

  return (
    <div style={{
      backgroundColor: "var(--color-bg-elevated)",
      border: "1px solid var(--color-border)",
      borderRadius: "var(--radius-lg)",
      padding: "1.25rem",
      margin: "2rem 0",
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "1rem",
      boxShadow: "var(--shadow-md)"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", flex: "1 1 300px" }}>
        <div style={{
          backgroundColor: "var(--color-primary)",
          color: "white",
          width: "48px",
          height: "48px",
          borderRadius: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
        </div>
        <div>
          <h3 style={{ margin: "0 0 0.25rem 0", fontSize: "1.1rem", color: "var(--color-primary)" }}>
            Skaffa Annonsen-appen
          </h3>
          <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--color-text-secondary)" }}>
            Snabbare surf och smidigare bilduppladdning. Helt gratis!
          </p>
        </div>
      </div>
      
      <div style={{ display: "flex", gap: "0.5rem", flex: "1 1 100%", justifyContent: "flex-end", marginTop: "0.5rem" }}>
        <button 
          onClick={() => setIsDismissed(true)} 
          className="btn-secondary"
          style={{ padding: "0.5rem 1rem", flex: 1 }}
        >
          Kanske sen
        </button>
        <button 
          onClick={handleInstallClick} 
          className="btn-primary"
          style={{ padding: "0.5rem 1rem", flex: 1 }}
        >
          Ladda ner nu
        </button>
      </div>
    </div>
  );
}
