import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Link from "next/link";
import { redirect } from "next/navigation";

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

      {/* Header för Företaget */}
      <div className="glass-panel" style={{ padding: "3rem 2rem", marginBottom: "3rem", display: "flex", flexWrap: "wrap", gap: "2rem", alignItems: "center", border: "2px dashed var(--color-border)" }}>
        
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
            {user.companyDescription || "Välkommen till vår butik/vår sida! (Fyll i en beskrivning under inställningar)"}
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
                  <div style={{ height: "180px", backgroundColor: "var(--color-bg-subtle)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                    {ad.imageUrls && ad.imageUrls.length > 0 ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={ad.imageUrls[0]} alt={ad.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
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
