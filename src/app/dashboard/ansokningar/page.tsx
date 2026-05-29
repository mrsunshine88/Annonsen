"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function ApplicationsPage() {
  const { data: session } = useSession();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // For this initial implementation, we'll assume there is an API route 
  // to fetch applications for the current employer's jobs.
  // We'll create a basic UI for it now.
  
  useEffect(() => {
    // I a real implementation, you would fetch applications here
    // fetch('/api/jobb/ansokningar').then(...)
    setLoading(false);
  }, []);

  return (
    <div>
      <h1 style={{ marginBottom: "2rem", color: "var(--color-primary)" }}>Inkomna Ansökningar</h1>
      <p style={{ color: "var(--color-text-secondary)", marginBottom: "2rem" }}>
        Här kommer du att kunna se och hantera alla ansökningar som kommit in för dina publicerade jobb. (Data hämtas från API framöver)
      </p>

      {loading ? (
        <p>Laddar ansökningar...</p>
      ) : applications.length === 0 ? (
        <div className="glass-panel" style={{ padding: "3rem", textAlign: "center" }}>
          <p style={{ fontSize: "1.1rem", color: "var(--color-text-secondary)" }}>
            Du har inga inkomna ansökningar ännu.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {applications.map((app) => (
            <div key={app.id} className="glass-panel" style={{ padding: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                  <h3 style={{ margin: 0, color: "var(--color-primary)" }}>{app.name}</h3>
                  <p style={{ margin: "0.25rem 0", color: "var(--color-text-secondary)", fontSize: "0.9rem" }}>
                    Ansökte till: <strong>{app.job.title}</strong>
                  </p>
                  <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem", fontSize: "0.85rem" }}>
                    <span>📧 {app.email}</span>
                    {app.phone && <span>📞 {app.phone}</span>}
                    <span>📅 {new Date(app.createdAt).toLocaleDateString("sv-SE")}</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <a href={app.cvUrl} rel="noreferrer" className="btn-secondary" style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}>
                    Visa CV
                  </a>
                  <a href={app.coverLetterUrl} rel="noreferrer" className="btn-secondary" style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}>
                    Visa Personligt Brev
                  </a>
                </div>
              </div>
              {app.message && (
                <div style={{ marginTop: "1rem", padding: "1rem", backgroundColor: "var(--color-bg-subtle)", borderRadius: "var(--radius-md)", fontSize: "0.9rem" }}>
                  <strong>Meddelande:</strong><br/>
                  {app.message}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
