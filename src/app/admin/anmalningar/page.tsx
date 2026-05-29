"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useNotification } from "@/components/NotificationProvider";

export default function AdminReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { showConfirm, showNotification } = useNotification();

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
    // Markera alla nya anmälningar som sedda när vi öppnar sidan
    fetch("/api/admin/anmalningar/mark-viewed", { method: "POST" }).catch(console.error);
  }, []);

  const updateStatus = async (reportId: string, status: string) => {
    try {
      const res = await fetch("/api/admin/anmalningar", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, status })
      });
      if (res.ok) {
        showNotification(`Anmälan är nu markerad som ${status}.`, "success");
        fetchReports();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const deleteAd = async (adId: string) => {
    const confirmed = await showConfirm({ message: "Är du helt säker på att du vill radera denna annons permanent?" });
    if (!confirmed) return;
    try {
      const res = await fetch(`/api/admin/ads?adId=${adId}`, { method: "DELETE" });
      if (res.ok) {
        showNotification("Annonsen raderades permanent.", "success");
        fetchReports(); // Refresh the list
      } else {
        showNotification("Något gick fel vid radering.", "error");
      }
    } catch (error) {
      console.error(error);
      showNotification("Något gick fel vid radering.", "error");
    }
  };

  if (loading) return <div style={{ padding: "4rem", textAlign: "center" }}>Laddar anmälningar...</div>;

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "2rem", color: "var(--color-primary)" }}>Hantera Anmälningar</h1>
      
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {reports.length === 0 ? (
          <div className="glass-panel" style={{ padding: "3rem", textAlign: "center", color: "var(--color-text-secondary)" }}>
            Inga anmälningar hittades. Bra jobbat!
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {/* Header för Desktop */}
            <div className="admin-table-header" style={{ display: "none", gridTemplateColumns: "1.5fr 2fr 1fr 1fr 1fr 2fr", gap: "1rem", padding: "0 1.5rem", color: "var(--color-text-secondary)", fontSize: "0.9rem", fontWeight: 600 }}>
              <div>Annons</div>
              <div>Anledning</div>
              <div>Anmälare</div>
              <div>Datum</div>
              <div>Status</div>
              <div style={{ textAlign: "right" }}>Åtgärder</div>
            </div>

            {reports.map(report => {
              const isHandled = report.status === "Hanterad";

              return (
                <div key={report.id} className="admin-report-card glass-panel" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem", opacity: isHandled ? 0.8 : 1 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1rem", alignItems: "start" }} className="admin-report-grid">
                    
                    {/* Column 1: Annons */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                      <span className="mobile-label" style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", display: "none", fontWeight: 600, marginBottom: "0.2rem" }}>Annons</span>
                      {report.ad ? (
                        <>
                          <Link href={`/annons/${report.ad.id}`} style={{ color: "var(--color-primary)", textDecoration: "none", fontWeight: 600, wordBreak: "break-word" }}>
                            {report.ad.title}
                          </Link>
                          <div style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)" }}>{report.ad.price} kr</div>
                        </>
                      ) : (
                        <span style={{ color: "var(--color-text-secondary)", fontStyle: "italic" }}>Raderad annons</span>
                      )}
                    </div>

                    {/* Column 2: Anledning */}
                    <div>
                      <span className="mobile-label" style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", display: "none", fontWeight: 600, marginBottom: "0.2rem" }}>Anledning</span>
                      <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", fontSize: "0.9rem", background: "var(--color-bg-subtle)", padding: "0.75rem", borderRadius: "var(--radius-sm)" }}>
                        {report.reason}
                      </div>
                    </div>

                    {/* Column 3: Anmälare */}
                    <div>
                      <span className="mobile-label" style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", display: "none", fontWeight: 600, marginBottom: "0.2rem" }}>Anmälare</span>
                      {report.user ? (
                        <>
                          <div style={{ fontWeight: 600 }}>{report.user.name}</div>
                          <div style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)", wordBreak: "break-all" }}>{report.user.email}</div>
                        </>
                      ) : (
                        <span style={{ color: "var(--color-text-secondary)", fontStyle: "italic" }}>Anonym / Okänd</span>
                      )}
                    </div>

                    {/* Column 4: Datum */}
                    <div>
                      <span className="mobile-label" style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", display: "none", fontWeight: 600, marginBottom: "0.2rem" }}>Datum</span>
                      <div style={{ fontSize: "0.9rem" }}>{new Date(report.createdAt).toLocaleDateString("sv-SE")}</div>
                    </div>

                    {/* Column 5: Status */}
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <span className="mobile-label" style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", display: "none", fontWeight: 600, marginBottom: "0.2rem", marginRight: "0.5rem" }}>Status</span>
                      {isHandled ? (
                        <span style={{ background: "rgba(34, 197, 94, 0.1)", color: "var(--color-success)", padding: "0.3rem 0.8rem", borderRadius: "100px", fontSize: "0.8rem", fontWeight: 600 }}>Hanterad</span>
                      ) : (
                        <span style={{ background: "rgba(239, 68, 68, 0.1)", color: "var(--color-error)", padding: "0.3rem 0.8rem", borderRadius: "100px", fontSize: "0.8rem", fontWeight: 600 }}>Ny</span>
                      )}
                    </div>

                    {/* Column 6: Åtgärder */}
                    <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", flexWrap: "wrap", borderTop: "1px solid var(--color-border)", paddingTop: "1rem" }} className="admin-actions-col">
                      {!isHandled && (
                        <>
                          <button 
                            onClick={() => updateStatus(report.id, "Hanterad")}
                            className="btn-primary"
                            style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem", flex: "1 1 auto", textAlign: "center" }}
                          >
                            Markera som Hanterad
                          </button>
                          
                          {report.ad && (
                            <>
                              <Link 
                                href={`/admin/annonser/${report.ad.id}`}
                                className="btn-secondary"
                                style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem", flex: "1 1 auto", textAlign: "center", textDecoration: "none" }}
                              >
                                Redigera annons
                              </Link>
                              
                              <button 
                                onClick={() => deleteAd(report.ad.id)}
                                className="btn-secondary"
                                style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem", flex: "1 1 auto", textAlign: "center", color: "var(--color-error)", borderColor: "rgba(239, 68, 68, 0.3)" }}
                              >
                                Radera annons
                              </button>
                            </>
                          )}
                        </>
                      )}
                      {isHandled && (
                        <div style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)", fontStyle: "italic" }}>
                          Anmälan är låst och hanterad.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style jsx global>{`
        /* Responsive Grid for Admin Reports */
        @media (max-width: 899px) {
          .mobile-label {
            display: block !important;
          }
        }
        
        @media (min-width: 900px) {
          .admin-table-header {
            display: grid !important;
          }
          .admin-report-grid {
            grid-template-columns: 1.5fr 2fr 1fr 1fr 1fr 2fr !important;
            border-top: none !important;
            border-bottom: none !important;
            align-items: center !important;
          }
          .admin-actions-col {
            border-top: none !important;
            padding-top: 0 !important;
            justify-content: flex-end !important;
          }
          .admin-actions-col button, .admin-actions-col a {
            flex: 0 1 auto !important;
          }
        }
      `}</style>
    </div>
  );
}
