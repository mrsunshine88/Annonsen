"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function TermsModal() {
  const { data: session, update, status } = useSession();
  const [showModal, setShowModal] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated" && session?.user && (session.user as any).termsAccepted === false) {
      setShowModal(true);
    } else {
      setShowModal(false);
    }
  }, [session, status]);

  const handleAccept = async () => {
    if (!accepted) return;
    setLoading(true);
    try {
      const res = await fetch("/api/user/accept-terms", { method: "POST" });
      if (res.ok) {
        await update({ termsAccepted: true });
        setShowModal(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!showModal) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.75)",
      backdropFilter: "blur(5px)",
      zIndex: 99999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1rem"
    }}>
      <div className="glass-panel" style={{
        maxWidth: "500px",
        width: "100%",
        padding: "2rem",
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem"
      }}>
        <h2 style={{ color: "var(--color-primary)", margin: 0 }}>Viktig information</h2>
        
        <p style={{ margin: 0, lineHeight: 1.6 }}>
          För att fortsätta använda Annonsen.se måste du läsa och godkänna våra uppdaterade villkor. Detta är ett krav enligt svensk lagstiftning (GDPR) för att vi ska kunna skydda dina personuppgifter.
        </p>

        <div style={{ padding: "1rem", backgroundColor: "var(--color-bg)", borderRadius: "8px", border: "1px solid var(--color-border)" }}>
          <label style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", cursor: "pointer" }}>
            <input 
              type="checkbox" 
              checked={accepted} 
              onChange={(e) => setAccepted(e.target.checked)}
              style={{ marginTop: "0.25rem", width: "1.2rem", height: "1.2rem", cursor: "pointer" }}
            />
            <span style={{ fontSize: "0.95rem", lineHeight: 1.5 }}>
              Jag har läst och godkänner <Link href="/villkor" target="_blank" style={{ color: "var(--color-primary)" }}>Allmänna Villkor</Link> samt bekräftar att jag har tagit del av <Link href="/integritet" target="_blank" style={{ color: "var(--color-primary)" }}>Integritetspolicyn</Link>.
            </span>
          </label>
        </div>

        <button 
          onClick={handleAccept} 
          disabled={!accepted || loading}
          className="primary-btn" 
          style={{ 
            width: "100%", 
            opacity: (!accepted || loading) ? 0.5 : 1,
            cursor: (!accepted || loading) ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "Sparar..." : "Jag godkänner"}
        </button>
      </div>
    </div>
  );
}
