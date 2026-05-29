import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";
import Link from "next/link";
import BackButton from "@/components/BackButton";

const prisma = new PrismaClient();

export default async function CompanyStorePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;

  // Hämta företaget och dess annonser
  const user = await prisma.user.findUnique({
    where: { id: resolvedParams.id },
    include: {
      ads: {
        orderBy: { createdAt: "desc" },
        include: {
          category: true
        }
      }
    }
  });

  if (!user || (user.accountType !== "Företag" && user.accountType !== "Arbetsgivare")) {
    notFound();
  }

  if (!user.companyPageApproved) {
    return (
      <div className="container" style={{ padding: "4rem 1rem", textAlign: "center" }}>
        <div className="glass-panel" style={{ padding: "4rem 2rem", maxWidth: "600px", margin: "0 auto" }}>
          <h1 style={{ color: "var(--color-primary)", marginBottom: "1rem" }}>Under granskning</h1>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "1.1rem", lineHeight: 1.6 }}>
            Den här företagssidan väntar på godkännande från en administratör och är ännu inte synlig för allmänheten.
          </p>
          <div style={{ marginTop: "2rem" }}>
            <Link href="/" className="btn-primary" style={{ padding: "0.8rem 1.5rem", borderRadius: "100px" }}>Tillbaka till startsidan</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "2rem 1rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <BackButton label="Tillbaka" />
      </div>

      {/* Header för Företaget */}
      <div className="glass-panel" style={{ padding: "3rem 2rem", marginBottom: "3rem", display: "flex", flexWrap: "wrap", gap: "2rem", alignItems: "center" }}>
        
        {/* Logga */}
        <div style={{ flexShrink: 0, width: "150px", height: "150px", backgroundColor: "var(--color-bg-subtle)", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
          {user.companyLogoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.companyLogoUrl} alt={user.companyName || "Logotyp"} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
          ) : (
            <span style={{ fontSize: "3rem" }}>🏢</span>
          )}
        </div>

        {/* Företagsinfo */}
        <div style={{ flex: 1, minWidth: "300px" }}>
          <h1 style={{ color: "var(--color-primary)", marginBottom: "0.5rem" }}>{user.companyName || user.name}</h1>
          <p style={{ color: "var(--color-text-secondary)", marginBottom: "1.5rem", maxWidth: "600px", lineHeight: 1.6 }}>
            {user.companyDescription || "Välkommen till vår butik!"}
          </p>

          <div className="grid-2-col" style={{ maxWidth: "500px", gap: "1rem" }}>
            {user.companyAddress && <div>📍 {user.companyAddress}, {user.companyCity}</div>}
            {user.companyOpeningHours && <div>🕒 {user.companyOpeningHours}</div>}
            {user.companyPhone && <div>📞 {user.companyPhone}</div>}
            {user.companyWebsite && <div>🌐 <a href={user.companyWebsite} rel="noopener noreferrer" style={{ color: "var(--color-primary)" }}>Besök hemsida</a></div>}
            {user.companyOrgNr && <div>📋 Org.nr: {user.companyOrgNr}</div>}
          </div>
        </div>
      </div>

      {/* Annonser */}
      <h2 style={{ marginBottom: "1.5rem" }}>Alla annonser från {user.companyName} ({user.ads.length})</h2>

      {user.ads.length === 0 ? (
        <div className="glass-panel" style={{ padding: "3rem", textAlign: "center", color: "var(--color-text-secondary)" }}>
          Företaget har inga aktiva annonser just nu.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
          {user.ads.map(ad => (
            <Link key={ad.id} href={`/annons/${ad.id}`} className="glass-panel category-card" style={{ display: "flex", flexDirection: "column", overflow: "hidden", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)" }}>
              {/* Bild */}
              <div style={{ height: "200px", backgroundColor: "var(--color-bg-subtle)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                {ad.imageUrls && ad.imageUrls.length > 0 ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={ad.imageUrls[0]} alt={ad.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <span style={{ color: "var(--color-text-muted)" }}>Ingen bild</span>
                )}
              </div>
              
              {/* Innehåll */}
              <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", flex: 1 }}>
                <h3 style={{ margin: "0 0 0.5rem 0", color: "var(--color-primary)", fontSize: "1.2rem" }}>{ad.title}</h3>
                <div style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)", marginBottom: "1rem" }}>
                  {ad.category.name} • {ad.year ? `${ad.year} • ` : ""}{ad.mileage ? `${ad.mileage} mil` : ""}
                </div>
                
                <div style={{ marginTop: "auto", fontSize: "1.25rem", fontWeight: 700, color: "var(--color-text-primary)" }}>
                  {ad.price.toLocaleString("sv-SE")} kr
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
