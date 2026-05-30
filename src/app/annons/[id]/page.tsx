import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Link from "next/link";
import { notFound } from "next/navigation";
import ContactSellerForm from "./ContactSellerForm";
import BackButton from "@/components/BackButton";
import AdActions from "./AdActions";
import Image from "next/image";

const prisma = new PrismaClient();

export default async function AdPage({ params }: { params: Promise<{ id: string }> }) {
  const session: any = await getServerSession(authOptions);
  
  const resolvedParams = await params;

  const ad = await prisma.ad.findUnique({
    where: { id: resolvedParams.id },
    include: {
      author: { select: { id: true, email: true, name: true, createdAt: true, accountType: true, companyName: true, companyOrgNr: true, companyAddress: true, companyCity: true, companyWebsite: true, companyLogoUrl: true, companyDescription: true, companyOpeningHours: true, companyPageApproved: true } },
      category: { select: { name: true } }
    }
  });

  if (!ad) {
    notFound();
  }

  if ((ad.author.accountType === "Företag" || ad.author.accountType === "Arbetsgivare") && !(ad.author as any).companyPageApproved) {
    return (
      <div className="container" style={{ padding: "4rem 1rem", textAlign: "center" }}>
        <div className="glass-panel" style={{ padding: "4rem 2rem", maxWidth: "600px", margin: "0 auto" }}>
          <h1 style={{ color: "var(--color-primary)", marginBottom: "1rem" }}>Annonsen är inte tillgänglig</h1>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "1.1rem", lineHeight: 1.6 }}>
            Denna annons tillhör ett företag vars konto för närvarande är inaktivt eller väntar på godkännande.
          </p>
          <div style={{ marginTop: "2rem" }}>
            <Link href="/" className="btn-primary" style={{ padding: "0.8rem 1.5rem", borderRadius: "100px" }}>Tillbaka till startsidan</Link>
          </div>
        </div>
      </div>
    );
  }

  const isOwner = session?.user?.email && session.user.email === ad.author.email;
  const isCompany = ad.author.accountType === "Företag";
  const loggedInUserId = (session?.user as any)?.id;

  let initialIsFavorite = false;
  let initialIsFollowing = false;
  
  if (loggedInUserId) {
    const fav = await prisma.favorite.findUnique({ 
      where: { userId_adId: { userId: loggedInUserId, adId: ad.id } } 
    });
    if (fav) initialIsFavorite = true;
    
    const fol = await prisma.follow.findUnique({ 
      where: { followerId_followedId: { followerId: loggedInUserId, followedId: ad.author.id } } 
    });
    if (fol) initialIsFollowing = true;
  }

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "1rem" }}>
      <BackButton label="Tillbaka" />
      <div style={{ display: "flex", gap: "2rem", flexDirection: "row", flexWrap: "wrap", marginTop: "1rem" }}>
        
        {/* Vänster: Bilder och Info */}
        <div style={{ flex: "2", minWidth: "250px" }}>
          {/* Bildgalleri (Enkel variant) */}
          <div className="glass-panel" style={{ height: "400px", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", marginBottom: "1.5rem", position: "relative" }}>
            {ad.imageUrls && ad.imageUrls.length > 0 ? (
              <Image 
                src={ad.imageUrls[0]} 
                alt={ad.title} 
                fill 
                style={{ objectFit: "cover" }} 
                sizes="(max-width: 768px) 100vw, 800px"
              />
            ) : (
              <span style={{ color: "var(--color-text-secondary)" }}>Inga bilder uppladdade</span>
            )}
          </div>

          <div className="glass-panel" style={{ padding: "2rem" }}>
            <h1 style={{ marginBottom: "0.5rem", color: "var(--color-primary)" }}>{ad.title}</h1>
            <div style={{ display: "flex", gap: "1rem", color: "var(--color-text-secondary)", marginBottom: "2rem", fontSize: "0.9rem" }}>
              <span>📍 {ad.location || "Okänd plats"}</span>
              <span>📅 {new Date(ad.createdAt).toLocaleString("sv-SE", { dateStyle: "short", timeStyle: "short" })}</span>
              <span>🏷️ {ad.category.name}</span>
            </div>

            <h3 style={{ marginBottom: "1rem" }}>Beskrivning</h3>
            <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{ad.description}</p>

            {/* Fordonsdetaljer */}
            {ad.brand && (
              <div style={{ marginTop: "2rem", paddingTop: "2rem", borderTop: "1px solid var(--color-border)" }}>
                <h3 style={{ marginBottom: "1rem" }}>Fordonsspecifikationer</h3>
                <div className="grid-2-col">
                  {ad.brand && <div><strong>Märke:</strong> {ad.brand}</div>}
                  {ad.model && <div><strong>Modell:</strong> {ad.model}</div>}
                  {ad.year && <div><strong>Årsmodell:</strong> {ad.year}</div>}
                  {ad.mileage && <div><strong>Miltal:</strong> {ad.mileage} mil</div>}
                  {ad.gearbox && <div><strong>Växellåda:</strong> {ad.gearbox}</div>}
                  {ad.fuel && <div><strong>Drivmedel:</strong> {ad.fuel}</div>}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Höger: Pris och Säljare */}
        <div style={{ flex: "1", minWidth: "250px", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          <div className="glass-panel" style={{ padding: "2rem", textAlign: "center" }}>
            <div style={{ fontSize: "2rem", fontWeight: 700, color: "var(--color-primary)", marginBottom: "1.5rem" }}>
              {ad.price.toLocaleString("sv-SE")} kr
            </div>
            
            {isOwner ? (
              <Link href={`/dashboard/annonser/${ad.id}`} className="btn-secondary" style={{ width: "100%", display: "block", textAlign: "center" }}>
                Hantera din annons
              </Link>
            ) : (
              <ContactSellerForm adId={ad.id} receiverId={ad.authorId} loggedInUserId={(session?.user as any)?.id} />
            )}
          </div>

          <div className="glass-panel" style={{ padding: "1.5rem" }}>
            {isCompany ? (
              <>
                <h3 style={{ marginBottom: "1rem", borderBottom: "1px solid var(--color-border)", paddingBottom: "0.5rem" }}>Säljs av Butik</h3>
                
                {ad.author.companyLogoUrl && (
                  <div style={{ marginBottom: "1rem", textAlign: "center", height: "80px", position: "relative" }}>
                    <Image 
                      src={ad.author.companyLogoUrl} 
                      alt={ad.author.companyName || "Företagslogga"} 
                      fill 
                      style={{ objectFit: "contain" }} 
                      sizes="200px"
                    />
                  </div>
                )}
                
                <Link href={`/butik/${ad.author.id}`} style={{ display: "block", fontWeight: 700, fontSize: "1.25rem", marginBottom: "0.5rem", color: "var(--color-primary)", textDecoration: "none" }} className="dashboard-link">
                  {ad.author.companyName}
                </Link>
                
                {ad.author.companyDescription && (
                  <p style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)", marginBottom: "1rem", lineHeight: 1.4 }}>
                    {ad.author.companyDescription}
                  </p>
                )}
                
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
                  {ad.author.companyAddress && <div>📍 {ad.author.companyAddress}, {ad.author.companyCity}</div>}
                  {ad.author.companyOpeningHours && <div>🕒 {ad.author.companyOpeningHours}</div>}
                  {ad.author.companyWebsite && (
                    <div>🌐 <a href={ad.author.companyWebsite} rel="noopener noreferrer" style={{ color: "var(--color-primary)" }}>Besök hemsida</a></div>
                  )}
                  {ad.author.companyOrgNr && <div style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)" }}>Org.nr: {ad.author.companyOrgNr}</div>}
                </div>
                
                <Link href={`/butik/${ad.author.id}`} className="btn-primary" style={{ width: "100%", textAlign: "center", display: "block" }}>
                  Besök Butiks-sida
                </Link>
              </>
            ) : (
              <>
                <h3 style={{ marginBottom: "1rem" }}>Säljare</h3>
                <div style={{ fontWeight: 600, fontSize: "1.1rem", marginBottom: "0.5rem" }}>
                  {ad.author.name || "Anonym säljare"}
                </div>
                <div style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)", marginBottom: "0.5rem" }}>
                  Medlem sedan {new Date(ad.author.createdAt).getFullYear()}
                </div>
                <div style={{ marginTop: "0.5rem", display: "inline-block", background: "var(--color-bg-subtle)", padding: "0.2rem 0.6rem", borderRadius: "var(--radius-sm)", fontSize: "0.8rem" }}>
                  Privatperson
                </div>
              </>
            )}
            
            {ad.phoneNumber && !ad.hidePhone && (
              <div style={{ marginTop: "1rem", padding: "1rem", background: "var(--color-bg-subtle)", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span style={{ fontSize: "1.2rem" }}>📞</span>
                <div>
                  <div style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)" }}>Telefonnummer</div>
                  <a href={`tel:${ad.phoneNumber}`} style={{ fontWeight: 600, color: "var(--color-primary)", textDecoration: "none" }}>{ad.phoneNumber}</a>
                </div>
              </div>
            )}
            
            {!isOwner && (
              <AdActions 
                adId={ad.id} 
                authorId={ad.author.id} 
                authorName={ad.author.companyName || ad.author.name || "Anonym säljare"} 
                initialIsFavorite={initialIsFavorite} 
                initialIsFollowing={initialIsFollowing} 
                isLoggedIn={!!loggedInUserId} 
              />
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
