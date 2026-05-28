import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import DeleteAdButton from "./DeleteAdButton";
import BackButton from "@/components/BackButton";

const prisma = new PrismaClient();

export default async function MyAdsPage() {
  const session = await getServerSession(authOptions);
  
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
            <div key={ad.id} style={{ padding: '1.5rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ marginBottom: '0.5rem' }}>{ad.title}</h3>
                <p style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{ad.price} kr</p>
              </div>
              <div>
                <Link href={`/dashboard/annonser/${ad.id}`} className="btn-secondary" style={{ marginRight: '0.5rem', display: 'inline-block' }}>Redigera</Link>
                <DeleteAdButton adId={ad.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
