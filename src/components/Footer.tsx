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
            <h3 style={{ margin: "0 0 1rem 0", background: "linear-gradient(90deg, var(--color-primary), #8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontSize: "1.8rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
              Annonsen.se
            </h3>
            <p style={{ margin: "0 0 1rem 0", lineHeight: "1.7", fontSize: "1rem", color: "var(--color-text-secondary)" }}>
              En modern och säker marknadsplats för privatpersoner, företag och arbetsgivare i hela Sverige.
            </p>
          </div>

          <div style={{ flex: "1 1 200px" }}>
            <h4 style={{ margin: "0 0 1rem 0", color: "var(--color-primary)", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>Länkar</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "flex-start" }}>
              <li><Link href="/" className="dashboard-link" style={{ display: "inline-block" }}>Sök Annonser</Link></li>
              <li><Link href="/jobb" className="dashboard-link" style={{ display: "inline-block" }}>Lediga Jobb</Link></li>
              <li><Link href="/kontakt" className="dashboard-link" style={{ display: "inline-block" }}>Kontakta Oss</Link></li>
            </ul>
          </div>

          <div style={{ flex: "1 1 200px" }}>
            <h4 style={{ margin: "0 0 1rem 0", color: "var(--color-primary)", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>Information</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "flex-start" }}>
              <li><Link href="/villkor" className="dashboard-link" style={{ display: "inline-block" }}>Användarvillkor</Link></li>
              <li><Link href="/integritet" className="dashboard-link" style={{ display: "inline-block" }}>Integritetspolicy (GDPR)</Link></li>
              <li><Link href="/cookies" className="dashboard-link" style={{ display: "inline-block" }}>Cookiepolicy</Link></li>
            </ul>
          </div>
        </div>

        <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "2rem", fontSize: "0.85rem", textAlign: "center", display: "flex", flexDirection: "column", gap: "0.75rem", color: "var(--color-text-secondary)" }}>
          <p style={{ margin: 0, opacity: 0.8, lineHeight: 1.6, maxWidth: "800px", alignSelf: "center" }}>
            Innehållet på Annonsen.se skyddas av upphovsrättslagen. Regelbunden, systematisk eller kontinuerlig insamling, lagring, indexering, distribuering och annan kompilering av data är strikt förbjuden utan föregående skriftlig tillåtelse från plattformsägaren.
          </p>
          <p style={{ margin: 0, fontWeight: 600, color: "var(--color-text)" }}>
            © {new Date().getFullYear()} Annonsen.se. Alla rättigheter förbehållna.
          </p>
        </div>

      </div>
    </footer>
  );
}
