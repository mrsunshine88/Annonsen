import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import Image from "next/image";

const prisma = new PrismaClient();

export default async function FeedPage() {
  const session: any = await getServerSession(authOptions);
  
  if (!session?.user?.id) return null;

  const follows = await prisma.follow.findMany({
    where: { followerId: session.user.id },
    select: { followedId: true }
  });

  const followedIds = follows.map(f => f.followedId);

  const ads = await prisma.ad.findMany({
    where: { 
      authorId: { in: followedIds },
      isPaid: true
    },
    include: {
      author: {
        select: {
          name: true,
          companyName: true,
          accountType: true
        }
      }
    },
    take: 50
  });

  const jobAds = await prisma.jobAd.findMany({
    where: {
      authorId: { in: followedIds }
    },
    take: 50
  });

  const feedItems = [
    ...ads.map(ad => ({ type: "AD", data: ad, date: new Date(ad.createdAt).getTime() })),
    ...jobAds.map(job => ({ type: "JOB", data: job, date: new Date(job.createdAt).getTime() }))
  ].sort((a, b) => b.date - a.date).slice(0, 50);

  return (
    <div>
      <h2 style={{ marginBottom: '2rem', marginTop: '1rem' }}>Mitt Flöde</h2>

      {feedItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--color-text-secondary)' }}>
          <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Det finns inga annonser i ditt flöde ännu. Följ användare och företag för att se deras annonser här!</p>
          <Link href="/sok" className="btn-secondary">Hitta annonser</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
          {feedItems.map(item => {
            if (item.type === "AD") {
              const ad = item.data as any;
              return (
                <Link key={`ad-${ad.id}`} href={`/annons/${ad.id}`} className="glass-panel hover-card" style={{ display: 'block', textDecoration: 'none', color: 'inherit', overflow: 'hidden' }}>
                  <div style={{ height: '200px', backgroundColor: 'var(--color-bg-subtle)', position: 'relative' }}>
                    {ad.imageUrls && ad.imageUrls.length > 0 ? (
                      <Image 
                        src={ad.imageUrls[0]} 
                        alt={ad.title} 
                        fill 
                        style={{ objectFit: 'cover' }} 
                        sizes="(max-width: 768px) 100vw, 300px"
                      />
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-secondary)' }}>Ingen bild</div>
                    )}
                  </div>
                  <div style={{ padding: '1rem' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '0.2rem' }}>Säljs av {ad.author.companyName || ad.author.name}</div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ad.title}</h3>
                    <div style={{ color: 'var(--color-primary)', fontWeight: 700, marginBottom: '0.5rem' }}>{ad.price.toLocaleString("sv-SE")} kr</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
                      <span>📍 {ad.location || 'Sverige'}</span>
                      <span>{new Date(ad.createdAt).toLocaleDateString("sv-SE")}</span>
                    </div>
                  </div>
                </Link>
              );
            } else {
              const job = item.data as any;
              return (
                <Link key={`job-${job.id}`} href={`/jobb/${job.id}`} className="glass-panel hover-card" style={{ display: 'block', textDecoration: 'none', color: 'inherit', overflow: 'hidden' }}>
                  <div style={{ height: '200px', background: 'linear-gradient(135deg, var(--color-primary), #1e40af)', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem', textAlign: 'center', position: 'relative' }}>
                    <div style={{ position: "absolute", top: "-30px", left: "-30px", width: "100px", height: "100px", borderRadius: "50%", background: "rgba(255,255,255,0.1)" }}></div>
                    <span style={{ background: 'rgba(255,255,255,0.2)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', marginBottom: '1rem', fontWeight: 'bold', letterSpacing: '1px', zIndex: 1, color: 'white' }}>JOBB</span>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', color: 'white', zIndex: 1, textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>{job.title}</h3>
                  </div>
                  <div style={{ padding: '1rem' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '0.2rem' }}>Publicerat av {job.companyName}</div>
                    <div style={{ color: 'var(--color-text)', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.95rem' }}>{job.scope} • {job.duration}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
                      <span>📍 {job.location}</span>
                      <span>{new Date(job.createdAt).toLocaleDateString("sv-SE")}</span>
                    </div>
                  </div>
                </Link>
              );
            }
          })}
        </div>
      )}
    </div>
  );
}
