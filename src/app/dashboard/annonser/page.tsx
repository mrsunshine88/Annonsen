import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import DeleteAdButton from "./DeleteAdButton";
import BackButton from "@/components/BackButton";

const prisma = new PrismaClient();

export default async function MyAdsPage() {
  const session: any = await getServerSession(authOptions);
  
  if (!session?.user?.email) return null;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { ads: true }
  });

  const ads = user?.ads || [];

  return (
    <div>
      <BackButton label="Tillbaka till start" />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', marginTop: "1rem" }}>
        <h2>Mina Annonser</h2>
        <Link href="/skapa" className="btn-primary">Skapa ny annons</Link>
      </div>

      {ads.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--color-text-secondary)' }}>
          <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Du har inte skapat några annonser ännu.</p>
          <Link href="/skapa" className="btn-secondary">Kom igång och sälj</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {ads.map(ad => (
            <div key={ad.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ width: '80px', height: '80px', flexShrink: 0, borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: 'var(--color-bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {ad.imageUrls && ad.imageUrls.length > 0 ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={ad.imageUrls[0]} alt={ad.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Ingen bild</span>
                  )}
                </div>
                <div>
                  <h3 style={{ marginBottom: '0.2rem' }}>{ad.title}</h3>
                  <p style={{ color: 'var(--color-primary)', fontWeight: 600, marginBottom: '0.5rem' }}>{ad.price} kr</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Upplagd: {new Date(ad.createdAt).toLocaleString("sv-SE", { dateStyle: "short", timeStyle: "short" })}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <Link href={`/annons/${ad.id}`} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>Visa Annons</Link>
                <Link href={`/dashboard/annonser/${ad.id}`} className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>Uppdatera & Bumpa</Link>
                <DeleteAdButton adId={ad.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
