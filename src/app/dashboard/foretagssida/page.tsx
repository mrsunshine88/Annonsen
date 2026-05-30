import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Link from "next/link";
import { redirect } from "next/navigation";
import Image from "next/image";

export const dynamic = 'force-dynamic';
const prisma = new PrismaClient();

export default async function DashboardCompanyPage() {
  const session: any = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  // Hämta företaget och dess annonser och jobb
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      ads: {
        orderBy: { createdAt: "desc" },
        include: { category: true }
      },
      jobAds: {
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!user || (user.accountType !== "Företag" && user.accountType !== "Arbetsgivare")) {
    redirect("/dashboard/annonser");
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 style={{ color: "var(--color-primary)", margin: 0 }}>Förhandsgranskning av företagssida</h1>
        <Link href={`/butik/${user.id}`} className="btn-secondary">
          Förhandsgranska
        </Link>
      </div>

      {!user.companyPageApproved && (
         <div style={{ padding: "1rem", backgroundColor: "rgba(239, 68, 68, 0.1)", color: "var(--color-error)", borderRadius: "var(--radius-md)", marginBottom: "2rem" }}>
           <strong>Observera:</strong> Din företagssida är just nu inaktiverad eller väntar på godkännande. Så här kommer den se ut när den blir godkänd.
         </div>
      )}

      {/* Hero för Företaget */}
      <div className="glass-panel" style={{ marginBottom: "3rem", overflow: "hidden", position: "relative", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)" }}>
        
        {/* Banner Gradient */}
        <div style={{ height: "180px", background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)", position: "relative" }}>
          <div style={{ position: "absolute", top: "-50px", right: "-50px", width: "250px", height: "250px", borderRadius: "50%", background: "rgba(255,255,255,0.05)" }}></div>
          <div style={{ position: "absolute", bottom: "-50px", left: "20%", width: "150px", height: "150px", borderRadius: "50%", background: "rgba(255,255,255,0.03)" }}></div>
        </div>
        
        <div style={{ padding: "0 2rem 2rem 2rem", position: "relative", zIndex: 2 }}>
          {/* Logga överlappande */}
          <div style={{ 
            marginTop: "-60px", 
            marginBottom: "1.5rem", 
            width: "130px", 
            height: "130px", 
            backgroundColor: "#ffffff", 
            borderRadius: "var(--radius-md)", 
            display: "inline-flex", 
            alignItems: "center", 
            justifyContent: "center", 
            overflow: "hidden", 
            border: "4px solid #ffffff", 
            boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
            flexShrink: 0
          }}>
            {user.companyLogoUrl ? (
              <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                <Image 
                  src={user.companyLogoUrl} 
                  alt={user.companyName || "Logotyp"} 
                  fill 
                  style={{ objectFit: "contain", backgroundColor: 'white' }} 
                  sizes="130px"
                />
              </div>
            ) : (
              <span style={{ fontSize: "3rem" }}>🏢</span>
            )}
          </div>

          {/* Företagsinfo */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            
            {/* Titel */}
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: "1.5rem" }}>
              <div style={{ flex: "1 1 300px" }}>
                <h1 style={{ color: "var(--color-text-primary)", fontSize: "2.2rem", fontWeight: 800, marginBottom: "0.2rem" }}>{user.companyName || user.name}</h1>
                <p style={{ color: "var(--color-text-secondary)", fontSize: "1.1rem", maxWidth: "800px", lineHeight: 1.6, margin: 0 }}>
                  {user.companyDescription || "Välkommen till vår butik/vår sida! (Fyll i en beskrivning under inställningar)"}
                </p>
              </div>
            </div>
            
            {/* Kontakt & Info-piller */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.8rem", paddingTop: "0.5rem", borderTop: "1px solid var(--color-border)" }}>
              {user.companyAddress && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1rem", backgroundColor: "var(--color-bg-subtle)", borderRadius: "100px", fontSize: "0.95rem", color: "var(--color-text-secondary)", border: "1px solid var(--color-border)" }}>
                  <span style={{ fontSize: "1.1rem" }}>📍</span> {user.companyAddress}, {user.companyCity}
                </span>
              )}
              {user.companyPhone && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1rem", backgroundColor: "var(--color-bg-subtle)", borderRadius: "100px", fontSize: "0.95rem", color: "var(--color-text-secondary)", border: "1px solid var(--color-border)" }}>
                  <span style={{ fontSize: "1.1rem" }}>📞</span> {user.companyPhone}
                </span>
              )}
              {user.companyWebsite && (
                <a href={user.companyWebsite} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1rem", backgroundColor: "rgba(37, 99, 235, 0.05)", borderRadius: "100px", fontSize: "0.95rem", color: "var(--color-primary)", fontWeight: 600, border: "1px solid rgba(37, 99, 235, 0.2)", textDecoration: "none" }}>
                  <span style={{ fontSize: "1.1rem" }}>🌐</span> Besök hemsida
                </a>
              )}
              {user.companyOpeningHours && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1rem", backgroundColor: "var(--color-bg-subtle)", borderRadius: "100px", fontSize: "0.95rem", color: "var(--color-text-secondary)", border: "1px solid var(--color-border)" }}>
                  <span style={{ fontSize: "1.1rem" }}>🕒</span> {user.companyOpeningHours}
                </span>
              )}
              {user.companyOrgNr && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1rem", backgroundColor: "var(--color-bg-subtle)", borderRadius: "100px", fontSize: "0.95rem", color: "var(--color-text-secondary)", border: "1px solid var(--color-border)" }}>
                  <span style={{ fontSize: "1.1rem" }}>📋</span> Org.nr: {user.companyOrgNr}
                </span>
              )}
            </div>
            
          </div>
        </div>
      </div>

      {user.accountType === "Företag" && (
        <>
          <h2 style={{ marginBottom: "1.5rem" }}>Alla annonser från {user.companyName || user.name} ({user.ads.length})</h2>
          {user.ads.length === 0 ? (
            <div className="glass-panel" style={{ padding: "3rem", textAlign: "center", color: "var(--color-text-secondary)" }}>
              Du har inga aktiva annonser just nu.
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "1.5rem" }}>
              {user.ads.map(ad => (
                <div key={ad.id} className="glass-panel category-card" style={{ display: "flex", flexDirection: "column", overflow: "hidden", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)" }}>
                  <div style={{ height: "180px", backgroundColor: "var(--color-bg-subtle)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative" }}>
                    {ad.imageUrls && ad.imageUrls.length > 0 ? (
                      <Image 
                        src={ad.imageUrls[0]} 
                        alt={ad.title} 
                        fill 
                        style={{ objectFit: "cover" }} 
                        sizes="(max-width: 768px) 100vw, 300px"
                      />
                    ) : (
                      <span style={{ color: "var(--color-text-muted)" }}>Ingen bild</span>
                    )}
                  </div>
                  <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", flex: 1 }}>
                    <h3 style={{ margin: "0 0 0.5rem 0", color: "var(--color-primary)", fontSize: "1.2rem" }}>{ad.title}</h3>
                    <div style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)", marginBottom: "1rem" }}>
                      {ad.category.name} • {ad.year ? `${ad.year} • ` : ""}{ad.mileage ? `${ad.mileage} mil` : ""}
                    </div>
                    <div style={{ marginTop: "auto", fontSize: "1.25rem", fontWeight: 700, color: "var(--color-text-primary)" }}>
                      {ad.price.toLocaleString("sv-SE")} kr
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {user.accountType === "Arbetsgivare" && (
        <>
          <h2 style={{ marginBottom: "1.5rem" }}>Lediga tjänster hos {user.companyName || user.name} ({user.jobAds.length})</h2>
          {user.jobAds.length === 0 ? (
            <div className="glass-panel" style={{ padding: "3rem", textAlign: "center", color: "var(--color-text-secondary)" }}>
              Ni har inga lediga tjänster just nu.
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1rem" }}>
              {user.jobAds.map(job => (
                <div key={job.id} className="glass-panel" style={{ padding: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)" }}>
                  <div>
                    <h3 style={{ color: "var(--color-primary)", margin: "0 0 0.25rem 0" }}>{job.title}</h3>
                    <div style={{ display: "flex", gap: "1rem", fontSize: "0.85rem", color: "var(--color-text-secondary)" }}>
                      <span>📍 {job.location}</span>
                      <span>🕒 {job.scope}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

    </div>
  );
}
