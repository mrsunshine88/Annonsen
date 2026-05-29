import { PrismaClient } from "@prisma/client";
import Link from "next/link";

const prisma = new PrismaClient();

export default async function JobPortalPage({ searchParams }: { searchParams: { q?: string; location?: string; industry?: string } }) {
  const query = searchParams.q || "";
  const location = searchParams.location || "";
  const industry = searchParams.industry || "";

  const whereClause: any = {
    author: {
      OR: [
        { accountType: "Privat" },
        { 
          accountType: { in: ["Företag", "Arbetsgivare"] },
          companyPageApproved: true 
        }
      ]
    }
  };

  if (query) {
    whereClause.OR = [
      { title: { contains: query, mode: "insensitive" } },
      { companyName: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } },
    ];
  }
  
  if (location) {
    whereClause.location = { contains: location, mode: "insensitive" };
  }

  if (industry) {
    whereClause.industry = { equals: industry };
  }

  const jobs = await prisma.jobAd.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "1rem" }}>
      <div className="hero-section" style={{ 
          position: "relative",
          textAlign: "center", 
          marginBottom: "4rem", 
          padding: "5rem 2rem", 
          background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)", 
          borderRadius: "var(--radius-xl)",
          boxShadow: "var(--shadow-lg)",
          overflow: "hidden"
        }}>
        <div style={{ position: "relative", zIndex: 10 }}>
          <h1 style={{ fontSize: "3.5rem", marginBottom: "1rem", color: "#ffffff", fontWeight: 800, letterSpacing: "-0.03em", textShadow: "0 2px 10px rgba(0,0,0,0.2)" }}>Hitta ditt nästa drömjobb</h1>
          <p style={{ fontSize: "1.25rem", color: "rgba(255,255,255,0.9)", maxWidth: "600px", margin: "0 auto", fontWeight: 500 }}>Sök bland tusentals lediga tjänster över hela landet.</p>
          
          <form action="/jobb" method="GET" style={{ 
              display: "flex", 
              gap: "0.75rem", 
              justifyContent: "center", 
              marginTop: "2.5rem", 
              flexWrap: "wrap", 
              maxWidth: "800px", 
              margin: "2.5rem auto 0",
              background: "rgba(255,255,255,0.1)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              padding: "0.75rem",
              borderRadius: "1rem",
              border: "1px solid rgba(255,255,255,0.2)"
            }}>
            <input 
              type="text" 
              name="q" 
              defaultValue={query} 
              placeholder="Sök på yrke, företag eller nyckelord..." 
              className="input-field"
              style={{ flex: "1 1 250px", border: "none", padding: "1rem", fontSize: "1.05rem", borderRadius: "0.5rem" }}
            />
            <input 
              type="text" 
              name="location" 
              defaultValue={location} 
              placeholder="Ort eller Län" 
              className="input-field"
              style={{ flex: "1 1 150px", border: "none", padding: "1rem", fontSize: "1.05rem", borderRadius: "0.5rem" }}
            />
            <button type="submit" style={{ 
                padding: "1rem 2.5rem", 
                background: "#ffffff", 
                color: "#1e3a8a", 
                fontWeight: "bold", 
                border: "none", 
                borderRadius: "0.5rem", 
                cursor: "pointer", 
                fontSize: "1.05rem", 
                flex: "1 1 auto",
                boxShadow: "0 4px 14px 0 rgba(0,0,0,0.1)",
                transition: "transform 0.2s ease"
              }}>
              Sök Jobb
            </button>
          </form>
        </div>
      </div>

      <div className="responsive-flex">
        {/* Filtrering / Sidebar (valfritt, kan utvecklas) */}
        
        {/* Jobblista */}
        <div style={{ flex: 1, width: "100%" }}>
          <h2 style={{ marginBottom: "1.5rem" }}>{jobs.length} lediga jobb</h2>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {jobs.length === 0 ? (
              <div className="glass-panel" style={{ padding: "3rem", textAlign: "center", color: "var(--color-text-secondary)" }}>
                Tyvärr hittade vi inga jobb som matchade din sökning.
              </div>
            ) : (
              jobs.map((job: any) => (
                <Link href={`/jobb/${job.id}`} key={job.id} style={{ textDecoration: "none", color: "inherit" }}>
                  <div className="glass-panel premium-hover" style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ fontSize: "0.9rem", color: "var(--color-text-secondary)", marginBottom: "0.3rem" }}>{job.companyName}</div>
                        <h3 style={{ fontSize: "1.3rem", color: "var(--color-primary)", marginBottom: "0.5rem" }}>{job.title}</h3>
                        <div style={{ display: "flex", gap: "1rem", fontSize: "0.85rem", color: "var(--color-text-secondary)" }}>
                          <span>📍 {job.location}</span>
                          <span>🕒 {job.scope}</span>
                          <span>📅 {new Date(job.createdAt).toLocaleDateString("sv-SE")}</span>
                        </div>
                      </div>
                    </div>
                    <p style={{ fontSize: "0.95rem", lineHeight: 1.5, color: "var(--color-text)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {job.description}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
