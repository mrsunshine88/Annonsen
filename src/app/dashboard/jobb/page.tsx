import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';
const prisma = new PrismaClient();

export default async function DashboardJobbPage() {
  const session: any = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      jobAds: {
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { applications: true } } }
      }
    }
  });

  if (!user || (user.accountType !== "Arbetsgivare" && user.accountType !== "Företag")) {
    redirect("/dashboard/annonser");
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <h1 style={{ color: "var(--color-primary)", margin: 0 }}>Dina Jobbannonser</h1>
        <Link href="/skapa-jobb" className="btn-primary">
          Skapa Nytt Jobb
        </Link>
      </div>

      {!user.companyPageApproved && (
         <div style={{ padding: "1rem", backgroundColor: "rgba(239, 68, 68, 0.1)", color: "var(--color-error)", borderRadius: "var(--radius-md)", marginBottom: "2rem" }}>
           <strong>Observera:</strong> Din företagssida och jobbannonser är inaktiverade eller väntar på godkännande av administratör. De syns inte utåt för arbetssökande för tillfället.
         </div>
      )}

      {user.jobAds.length === 0 ? (
        <div className="glass-panel" style={{ padding: "3rem", textAlign: "center" }}>
          <p style={{ fontSize: "1.1rem", color: "var(--color-text-secondary)", marginBottom: "1.5rem" }}>
            Du har inte publicerat några jobbannonser ännu.
          </p>
          <Link href="/skapa-jobb" className="btn-primary">
            Kom igång och skapa en annons
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {user.jobAds.map((job) => {
            const isExpired = new Date(job.deadline).getTime() < new Date().getTime();
            
            return (
              <div key={job.id} className="glass-panel" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
                  <div>
                    <h3 style={{ margin: 0, color: "var(--color-primary)", fontSize: "1.3rem", marginBottom: "0.25rem" }}>{job.title}</h3>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", fontSize: "0.85rem", color: "var(--color-text-secondary)" }}>
                      <span>📍 {job.location}</span>
                      <span>📅 Skapad: {new Date(job.createdAt).toLocaleDateString("sv-SE")}</span>
                      <span>⏳ Sista ansökningsdag: {new Date(job.deadline).toLocaleDateString("sv-SE")}</span>
                    </div>
                  </div>
                  
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <Link href={`/jobb/${job.id}`} target="_blank" className="btn-secondary" style={{ padding: "0.5rem 1rem", fontSize: "0.9rem" }}>
                      Visa live
                    </Link>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.5rem", paddingTop: "1rem", borderTop: "1px solid var(--color-border)", flexWrap: "wrap", gap: "1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    {isExpired ? (
                      <span style={{ color: "var(--color-error)", fontSize: "0.85rem", fontWeight: 600 }}>Avslutad</span>
                    ) : (
                      <span style={{ color: "var(--color-success)", fontSize: "0.85rem", fontWeight: 600 }}>Aktiv</span>
                    )}
                    
                    <Link href="/dashboard/ansokningar" style={{ display: "flex", alignItems: "center", gap: "0.3rem", color: "var(--color-text)", textDecoration: "none", fontSize: "0.95rem" }}>
                      <span>📄 Inkomna ansökningar:</span>
                      <strong style={{ background: "var(--color-primary)", color: "white", padding: "0.1rem 0.6rem", borderRadius: "100px", fontSize: "0.85rem" }}>
                        {job._count.applications}
                      </strong>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
