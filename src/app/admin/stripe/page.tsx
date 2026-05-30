"use client";

import { useState, useEffect } from "react";
import { useNotification } from "@/components/NotificationProvider";

export default function AdminStripePage() {
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<any[]>([]);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const res = await fetch("/api/admin/stripe");
      const data = await res.json();
      setCompanies(data);
    } catch (e) {
      console.error(e);
      showNotification("Kunde inte hämta Stripe-data", "error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: "4rem", textAlign: "center" }}>Laddar företag...</div>;

  const activeCount = companies.filter(c => c.hasActiveSubscription).length;

  return (
    <div style={{ maxWidth: "1000px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2rem" }}>
        <div>
          <h2 style={{ marginBottom: "0.5rem" }}>Stripe & Prenumerationer</h2>
          <p style={{ color: "var(--color-text-secondary)", margin: 0 }}>
            Översikt över anslutna företag och deras faktureringsstatus.
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: "var(--color-success)" }}>{activeCount}</div>
          <div style={{ fontSize: "0.9rem", color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "1px" }}>Aktiva Betalande</div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: "2rem", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--color-border)", textAlign: "left" }}>
              <th style={{ padding: "1rem 0.5rem", color: "var(--color-text-secondary)", fontWeight: 600, fontSize: "0.9rem" }}>Företag</th>
              <th style={{ padding: "1rem 0.5rem", color: "var(--color-text-secondary)", fontWeight: 600, fontSize: "0.9rem" }}>E-post</th>
              <th style={{ padding: "1rem 0.5rem", color: "var(--color-text-secondary)", fontWeight: 600, fontSize: "0.9rem" }}>Org.nummer</th>
              <th style={{ padding: "1rem 0.5rem", color: "var(--color-text-secondary)", fontWeight: 600, fontSize: "0.9rem" }}>Status</th>
              <th style={{ padding: "1rem 0.5rem", color: "var(--color-text-secondary)", fontWeight: 600, fontSize: "0.9rem", textAlign: "right" }}>Stripe Kund-ID</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((company) => (
              <tr key={company.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                <td style={{ padding: "1rem 0.5rem", fontWeight: 500 }}>
                  {company.companyName || "Inget namn angivet"}
                </td>
                <td style={{ padding: "1rem 0.5rem", color: "var(--color-text-secondary)" }}>
                  {company.email}
                </td>
                <td style={{ padding: "1rem 0.5rem", color: "var(--color-text-secondary)" }}>
                  {company.companyOrgNr || "-"}
                </td>
                <td style={{ padding: "1rem 0.5rem" }}>
                  {company.hasActiveSubscription ? (
                    <span style={{ display: "inline-block", padding: "0.2rem 0.6rem", backgroundColor: "rgba(16, 185, 129, 0.1)", color: "var(--color-success)", borderRadius: "100px", fontSize: "0.85rem", fontWeight: 600 }}>
                      Aktiv
                    </span>
                  ) : (
                    <span style={{ display: "inline-block", padding: "0.2rem 0.6rem", backgroundColor: "var(--color-bg-subtle)", color: "var(--color-text-secondary)", borderRadius: "100px", fontSize: "0.85rem", fontWeight: 600 }}>
                      Ej aktiv
                    </span>
                  )}
                </td>
                <td style={{ padding: "1rem 0.5rem", textAlign: "right" }}>
                  {company.stripeCustomerId ? (
                    <a 
                      href={`https://dashboard.stripe.com/customers/${company.stripeCustomerId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "var(--color-primary)", textDecoration: "none", fontFamily: "monospace", fontSize: "0.9rem" }}
                      title="Öppna i Stripe"
                    >
                      {company.stripeCustomerId} ↗
                    </a>
                  ) : (
                    <span style={{ color: "var(--color-text-secondary)", fontSize: "0.9rem" }}>Saknas</span>
                  )}
                </td>
              </tr>
            ))}

            {companies.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: "3rem 1rem", textAlign: "center", color: "var(--color-text-secondary)" }}>
                  Inga företagsanvändare hittades.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
