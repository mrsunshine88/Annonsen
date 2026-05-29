import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";
import Link from "next/link";
import BackButton from "@/components/BackButton";

const prisma = new PrismaClient();

export default async function JobAdPage({ params }: { params: { id: string } }) {
  const job = await prisma.jobAd.findUnique({
    where: { id: params.id }
  });

  if (!job) {
    notFound();
  }

  const daysLeft = Math.ceil((new Date(job.deadline).getTime() - new Date().getTime()) / (1000 * 3600 * 24));

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "1rem" }}>
      <BackButton label="Tillbaka till jobb" />

      <div className="glass-panel" style={{ padding: "2.5rem", marginTop: "1rem" }}>
        
        {/* Header */}
        <div style={{ borderBottom: "1px solid var(--color-border)", paddingBottom: "1.5rem", marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "2.2rem", color: "var(--color-primary)", marginBottom: "0.5rem" }}>{job.title}</h1>
          <div style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "1rem" }}>{job.companyName}</div>
          
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem", fontSize: "0.95rem", color: "var(--color-text-secondary)" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>📍 {job.location}</span>
            <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>🕒 {job.scope}</span>
            <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>📅 {job.duration}</span>
            <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>🏷️ {job.industry}</span>
          </div>
        </div>

        <div className="responsive-flex">
          
          {/* Vänster kolumn (Innehåll) */}
          <div style={{ flex: 2 }}>
            
            <section style={{ marginBottom: "2.5rem" }}>
              <h2 style={{ fontSize: "1.4rem", marginBottom: "1rem" }}>Om jobbet</h2>
              <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.7, color: "var(--color-text)" }}>
                {job.description}
              </div>
            </section>

            <section style={{ marginBottom: "2.5rem" }}>
              <h2 style={{ fontSize: "1.4rem", marginBottom: "1rem" }}>Kvalifikationer</h2>
              <div style={{ backgroundColor: "var(--color-bg-subtle)", padding: "1.5rem", borderRadius: "var(--radius-md)" }}>
                <h3 style={{ fontSize: "1.1rem", marginBottom: "0.5rem", color: "var(--color-primary)" }}>Krav</h3>
                <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.7, marginBottom: "1.5rem" }}>
                  {job.requirements}
                </div>
                
                {job.merits && (
                  <>
                    <h3 style={{ fontSize: "1.1rem", marginBottom: "0.5rem", color: "var(--color-primary)" }}>Meriterande</h3>
                    <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.7 }}>
                      {job.merits}
                    </div>
                  </>
                )}
              </div>
            </section>

          </div>

          {/* Höger kolumn (Ansökan) */}
          <div style={{ flex: 1 }}>
            <div style={{ backgroundColor: "var(--color-bg-subtle)", padding: "1.5rem", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)", position: "sticky", top: "2rem" }}>
              <h3 style={{ marginBottom: "1rem" }}>Ansökan</h3>
              
              <div style={{ marginBottom: "1.5rem", fontSize: "0.95rem" }}>
                <div style={{ marginBottom: "0.5rem" }}>
                  <strong>Sista ansökningsdag:</strong><br />
                  {new Date(job.deadline).toLocaleDateString("sv-SE")}
                </div>
                {daysLeft >= 0 ? (
                  <div style={{ color: daysLeft < 5 ? "var(--color-error)" : "var(--color-success)", fontWeight: 600 }}>
                    {daysLeft === 0 ? "Stänger idag!" : `${daysLeft} dagar kvar`}
                  </div>
                ) : (
                  <div style={{ color: "var(--color-error)", fontWeight: 600 }}>Ansökningstiden har gått ut</div>
                )}
              </div>

              {daysLeft >= 0 && (
                job.applyUrl ? (
                  <a href={job.applyUrl} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ display: "block", textAlign: "center", padding: "1rem", fontSize: "1.1rem" }}>
                    Ansök via arbetsgivaren
                  </a>
                ) : (
                  <Link href={`/jobb/${job.id}/ansok`} className="btn-primary" style={{ display: "block", textAlign: "center", padding: "1rem", fontSize: "1.1rem" }}>
                    Ansök nu
                  </Link>
                )
              )}

              <hr style={{ margin: "1.5rem 0", borderTop: "1px solid var(--color-border)" }} />
              
              <div style={{ fontSize: "0.9rem" }}>
                <h4 style={{ marginBottom: "0.5rem", color: "var(--color-text-secondary)" }}>Kontaktperson</h4>
                {job.contactPerson ? (
                  <div>
                    <strong>{job.contactPerson}</strong><br />
                    {job.contactEmail && <a href={`mailto:${job.contactEmail}`} style={{ color: "var(--color-primary)" }}>{job.contactEmail}</a>}
                  </div>
                ) : (
                  <div style={{ color: "var(--color-text-secondary)" }}>Ingen kontaktperson angiven</div>
                )}
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
