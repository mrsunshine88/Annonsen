import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import BackButton from "@/components/BackButton";

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
    orderBy: { createdAt: 'desc' },
    take: 50 // Begränsa flödet
  });

  return (
    <div>
      <BackButton label="Tillbaka till start" />
      <h2 style={{ marginBottom: '2rem', marginTop: '1rem' }}>Mitt Flöde</h2>

      {ads.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--color-text-secondary)' }}>
          <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Det finns inga annonser i ditt flöde ännu. Följ användare och företag för att se deras annonser här!</p>
          <Link href="/sok" className="btn-secondary">Hitta annonser</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
          {ads.map(ad => (
            <Link key={ad.id} href={`/annons/${ad.id}`} className="glass-panel hover-card" style={{ display: 'block', textDecoration: 'none', color: 'inherit', overflow: 'hidden' }}>
              <div style={{ height: '200px', backgroundColor: 'var(--color-bg-subtle)' }}>
                {ad.imageUrls && ad.imageUrls.length > 0 ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={ad.imageUrls[0]} alt={ad.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
          ))}
        </div>
      )}
    </div>
  );
}
