import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import BackButton from "@/components/BackButton";

const prisma = new PrismaClient();

export default async function JobApplicationsPage() {
  const session: any = await getServerSession(authOptions);
  
  if (!session?.user?.id) return null;

  const jobAds = await prisma.jobAd.findMany({
    where: { authorId: session.user.id },
    include: {
      applications: {
        orderBy: { createdAt: 'desc' }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div>
      <BackButton label="Tillbaka" />
      <h2 style={{ marginBottom: '2rem', marginTop: '1rem', color: 'var(--color-primary)' }}>Mottagna Ansökningar</h2>

      {jobAds.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--color-text-secondary)' }}>
          <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Du har inte publicerat några jobbannonser ännu.</p>
          <Link href="/dashboard/jobb/skapa" className="btn-secondary">Skapa en jobbannons</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {jobAds.map(job => (
            <div key={job.id} className="glass-panel" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.3rem', marginBottom: '0.2rem' }}>{job.title}</h3>
                  <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                    Publicerad: {new Date(job.createdAt).toLocaleDateString("sv-SE")} | 
                    Ansökningar: <strong>{job.applications.length} st</strong>
                  </div>
                </div>
                <Link href={`/jobb/${job.id}`} target="_blank" className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>Visa Annons</Link>
              </div>

              {job.applications.length === 0 ? (
                <div style={{ color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>Inga ansökningar ännu.</div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--color-border)' }}>
                        <th style={{ padding: '0.5rem' }}>Namn</th>
                        <th style={{ padding: '0.5rem' }}>Datum</th>
                        <th style={{ padding: '0.5rem' }}>Dokument</th>
                        <th style={{ padding: '0.5rem', textAlign: 'right' }}>Åtgärd</th>
                      </tr>
                    </thead>
                    <tbody>
                      {job.applications.map(app => (
                        <tr key={app.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                          <td style={{ padding: '1rem 0.5rem' }}>
                            <div style={{ fontWeight: 600 }}>{app.name}</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                              <a href={`mailto:${app.email}`} style={{ color: 'inherit' }}>{app.email}</a>
                              {app.phone && <span> | {app.phone}</span>}
                            </div>
                          </td>
                          <td style={{ padding: '1rem 0.5rem', fontSize: '0.9rem' }}>{new Date(app.createdAt).toLocaleDateString("sv-SE")}</td>
                          <td style={{ padding: '1rem 0.5rem' }}>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <a href={app.cvUrl} target="_blank" rel="noreferrer" className="btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}>📄 CV</a>
                              <a href={app.coverLetterUrl} target="_blank" rel="noreferrer" className="btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}>✉️ Brev</a>
                            </div>
                          </td>
                          <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                            {/* Knappen "Kontakta" leder till den inbyggda meddelandecentralen om konversationen redan skapats (vilket vi gör vid ansökan) */}
                            <Link href={`/dashboard/meddelanden`} className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>Kontakta i chatt</Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
