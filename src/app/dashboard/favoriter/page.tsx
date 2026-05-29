import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import BackButton from "@/components/BackButton";

const prisma = new PrismaClient();

export default async function FavoritesPage() {
  const session: any = await getServerSession(authOptions);
  
  if (!session?.user?.id) return null;

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    include: {
      ad: {
        select: {
          id: true,
          title: true,
          price: true,
          imageUrls: true,
          location: true,
          createdAt: true,
          isPaid: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div>
      <BackButton label="Tillbaka till start" />
      <h2 style={{ marginBottom: '2rem', marginTop: '1rem' }}>Mina Favoriter</h2>

      {favorites.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--color-text-secondary)' }}>
          <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Du har inte sparat några favoriter ännu.</p>
          <Link href="/sok" className="btn-secondary">Hitta annonser</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
          {favorites.map(fav => (
            <Link key={fav.id} href={`/annons/${fav.ad.id}`} className="glass-panel hover-card" style={{ display: 'block', textDecoration: 'none', color: 'inherit', overflow: 'hidden' }}>
              <div style={{ height: '200px', backgroundColor: 'var(--color-bg-subtle)' }}>
                {fav.ad.imageUrls && fav.ad.imageUrls.length > 0 ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={fav.ad.imageUrls[0]} alt={fav.ad.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-secondary)' }}>Ingen bild</div>
                )}
              </div>
              <div style={{ padding: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{fav.ad.title}</h3>
                <div style={{ color: 'var(--color-primary)', fontWeight: 700, marginBottom: '0.5rem' }}>{fav.ad.price.toLocaleString("sv-SE")} kr</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>📍 {fav.ad.location || 'Sverige'}</span>
                  <span>{new Date(fav.ad.createdAt).toLocaleDateString("sv-SE")}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
