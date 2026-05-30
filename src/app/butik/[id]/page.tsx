import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";
import Link from "next/link";
import BackButton from "@/components/BackButton";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import FollowButton from "@/components/FollowButton";
import Image from "next/image";

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
      },
      jobAds: {
        orderBy: { createdAt: "desc" }
      }
    }
  });

  const session: any = await getServerSession(authOptions);
  
  let isFollowing = false;
  if (session?.user?.id) {
    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followedId: {
          followerId: session.user.id,
          followedId: resolvedParams.id
        }
      }
    });
    isFollowing = !!follow;
  }

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
            
            {/* Titel och Följ-knapp */}
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: "1.5rem" }}>
              <div style={{ flex: "1 1 300px" }}>
                <h1 style={{ color: "var(--color-text-primary)", fontSize: "2.2rem", fontWeight: 800, marginBottom: "0.2rem" }}>{user.companyName || user.name}</h1>
                <p style={{ color: "var(--color-text-secondary)", fontSize: "1.1rem", maxWidth: "800px", lineHeight: 1.6, margin: 0 }}>
                  {user.companyDescription || "Välkommen till vår företagssida!"}
                </p>
              </div>
              
              {session?.user?.id !== user.id && (
                <div style={{ flexShrink: 0 }}>
                  <FollowButton 
                    authorId={user.id} 
                    authorName={user.companyName || user.name || ""} 
                    initialIsFollowing={isFollowing} 
                    isLoggedIn={!!session?.user?.id} 
                  />
                </div>
              )}
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
                  <div style={{ height: "200px", backgroundColor: "var(--color-bg-subtle)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative" }}>
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
        </>
      )}

      {/* Jobbannonser */}
      {user.accountType === "Arbetsgivare" && (
        <div style={{ marginTop: "0" }}>
          <h2 style={{ marginBottom: "1.5rem" }}>Lediga jobb hos {user.companyName} ({user.jobAds.length})</h2>
          
          {user.jobAds.length === 0 ? (
            <div className="glass-panel" style={{ padding: "3rem", textAlign: "center", color: "var(--color-text-secondary)" }}>
              Företaget har inga lediga tjänster just nu.
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
              {user.jobAds.map(job => (
                <Link key={job.id} href={`/jobb/${job.id}`} className="glass-panel hover-card" style={{ display: 'block', textDecoration: 'none', color: 'inherit', overflow: 'hidden' }}>
                  <div style={{ height: '150px', background: 'linear-gradient(135deg, var(--color-primary), #1e40af)', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem', textAlign: 'center', position: 'relative' }}>
                    <div style={{ position: "absolute", top: "-30px", left: "-30px", width: "100px", height: "100px", borderRadius: "50%", background: "rgba(255,255,255,0.1)" }}></div>
                    <span style={{ background: 'rgba(255,255,255,0.2)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', marginBottom: '1rem', fontWeight: 'bold', letterSpacing: '1px', zIndex: 1, color: 'white' }}>JOBB</span>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', color: 'white', zIndex: 1, textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>{job.title}</h3>
                  </div>
                  <div style={{ padding: '1rem' }}>
                    <div style={{ color: 'var(--color-text)', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.95rem' }}>{job.scope} • {job.duration}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
                      <span>📍 {job.location}</span>
                      <span>{new Date(job.createdAt).toLocaleDateString("sv-SE")}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
