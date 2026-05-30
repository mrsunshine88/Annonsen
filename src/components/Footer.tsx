"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  
  // Dölj footern i specifika vyer om det behövs (t.ex. inuti chatt, men vi låter den vara framme för nu eller gömmer om den är i vägen)
  // Om du vill gömma den inne i admin/dashboard:
  // if (pathname?.startsWith("/admin") || pathname?.startsWith("/dashboard")) return null;

  return (
    <footer style={{
      marginTop: "auto",
      backgroundColor: "var(--color-bg-surface)",
      borderTop: "1px solid var(--color-border)",
      padding: "3rem 1rem 1.5rem 1rem",
      color: "var(--color-text-secondary)"
    }}>
      <div className="container" style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "2rem" }}>
          <div style={{ flex: "1 1 300px" }}>
            <h3 style={{ margin: "0 0 1rem 0", color: "var(--color-text)" }}>Annonsen.se</h3>
            <p style={{ margin: "0 0 1rem 0", lineHeight: "1.6", fontSize: "0.95rem" }}>
              En modern och säker marknadsplats för privatpersoner, företag och arbetsgivare i hela Sverige.
            </p>
          </div>

          <div style={{ flex: "1 1 200px" }}>
            <h4 style={{ margin: "0 0 1rem 0", color: "var(--color-text)", fontSize: "1.1rem" }}>Länkar</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "flex-start" }}>
              <li><Link href="/" className="dashboard-link" style={{ display: "inline-block" }}>Sök Annonser</Link></li>
              <li><Link href="/jobb" className="dashboard-link" style={{ display: "inline-block" }}>Lediga Jobb</Link></li>
              <li><Link href="/kontakt" className="dashboard-link" style={{ display: "inline-block" }}>Kontakta Oss</Link></li>
            </ul>
          </div>

          <div style={{ flex: "1 1 200px" }}>
            <h4 style={{ margin: "0 0 1rem 0", color: "var(--color-text)", fontSize: "1.1rem" }}>Information</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "flex-start" }}>
              <li><Link href="/villkor" className="dashboard-link" style={{ display: "inline-block" }}>Användarvillkor</Link></li>
              <li><Link href="/integritet" className="dashboard-link" style={{ display: "inline-block" }}>Integritetspolicy (GDPR)</Link></li>
              <li><Link href="/cookies" className="dashboard-link" style={{ display: "inline-block" }}>Cookiepolicy</Link></li>
            </ul>
          </div>
        </div>

        <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "1.5rem", fontSize: "0.85rem", textAlign: "center", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <p style={{ margin: 0 }}>
            Innehållet på Annonsen.se skyddas av upphovsrättslagen. Regelbunden, systematisk eller kontinuerlig insamling, lagring, indexering, distribuering och annan kompilering av data är strikt förbjuden utan föregående skriftlig tillåtelse från plattformsägaren.
          </p>
          <p style={{ margin: 0, fontWeight: 500 }}>
            © {new Date().getFullYear()} Annonsen.se. Alla rättigheter förbehållna.
          </p>
        </div>

      </div>
    </footer>
  );
}
