"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function AdminReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      const res = await fetch("/api/admin/anmalningar");
      const data = await res.json();
      setReports(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const updateStatus = async (reportId: string, status: string) => {
    try {
      const res = await fetch("/api/admin/anmalningar", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, status })
      });
      if (res.ok) fetchReports();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <p>Laddar anmälningar...</p>;

  return (
    <div>
      <h1 style={{ marginBottom: "2rem", color: "var(--color-primary)" }}>Hantera Anmälningar</h1>
      
      <div className="glass-panel" style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--color-border)", textAlign: "left" }}>
              <th style={{ padding: "1rem" }}>Annons</th>
              <th style={{ padding: "1rem" }}>Anledning</th>
              <th style={{ padding: "1rem" }}>Anmälare</th>
              <th style={{ padding: "1rem" }}>Datum</th>
              <th style={{ padding: "1rem" }}>Status</th>
              <th style={{ padding: "1rem", textAlign: "right" }}>Åtgärder</th>
            </tr>
          </thead>
          <tbody>
            {reports.map(report => (
              <tr key={report.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                <td style={{ padding: "1rem" }}>
                  {report.ad ? (
                    <Link href={`/annons/${report.ad.id}`} target="_blank" style={{ color: "var(--color-primary)", textDecoration: "none", fontWeight: 600 }}>
                      {report.ad.title}
                    </Link>
                  ) : (
                    <span style={{ color: "var(--color-text-secondary)" }}>Raderad annons</span>
                  )}
                </td>
                <td style={{ padding: "1rem", whiteSpace: "pre-wrap", maxWidth: "300px" }}>
                  {report.reason}
                </td>
                <td style={{ padding: "1rem" }}>
                  {report.user ? (
                    <>
                      <div>{report.user.name}</div>
                      <div style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)" }}>{report.user.email}</div>
                    </>
                  ) : (
                    <span style={{ color: "var(--color-text-secondary)" }}>Anonym/Raderad</span>
                  )}
                </td>
                <td style={{ padding: "1rem" }}>{new Date(report.createdAt).toLocaleDateString("sv-SE")}</td>
                <td style={{ padding: "1rem" }}>
                  {report.status === "Ny" ? (
                    <span style={{ color: "var(--color-error)", fontWeight: 600 }}>Ny</span>
                  ) : (
                    <span style={{ color: "var(--color-success)" }}>Hanterad</span>
                  )}
                </td>
                <td style={{ padding: "1rem", textAlign: "right" }}>
                  {report.status === "Ny" ? (
                    <button 
                      onClick={() => updateStatus(report.id, "Hanterad")}
                      className="btn-primary"
                      style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}
                    >
                      Markera som Hanterad
                    </button>
                  ) : (
                    <button 
                      onClick={() => updateStatus(report.id, "Ny")}
                      className="btn-secondary"
                      style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}
                    >
                      Markera som Ny
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {reports.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: "2rem", textAlign: "center", color: "var(--color-text-secondary)" }}>
                  Inga anmälningar hittades.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
