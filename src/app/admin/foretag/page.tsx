"use client";

import { useState, useEffect } from "react";
import { useNotification } from "@/components/NotificationProvider";

export default function AdminCompanyPricingPage() {
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Företagspriser
  const [companyAdPrice, setCompanyAdPrice] = useState<number | "">(0);
  const [companySubscriptionPrice, setCompanySubscriptionPrice] = useState<number | "">(0);
  
  // Övriga inställningar för att undvika överskrivning
  const [fullSettings, setFullSettings] = useState<any>(null);

  // Lista över företag
  const [companies, setCompanies] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings");
      const settings = await res.json();
      
      const usersRes = await fetch("/api/admin/users");
      const users = await usersRes.json();
      setCompanies(users.filter((u: any) => u.accountType === "Företag"));

      setFullSettings(settings);
      setCompanyAdPrice(settings.companyAdPrice || 0);
      setCompanySubscriptionPrice(settings.companySubscriptionPrice || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!fullSettings) return;
    
    setSaving(true);
    try {
      await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          ...fullSettings,
          companyAdPrice: Number(companyAdPrice),
          companySubscriptionPrice: Number(companySubscriptionPrice)
        })
      });
      showNotification("Företagspriserna sparades!", "success");
      fetchSettings(); // Ladda om för att få uppdaterade värden
    } catch (e) {
      showNotification("Kunde inte spara priserna.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: "4rem", textAlign: "center" }}>Laddar inställningar...</div>;

  return (
    <div style={{ maxWidth: "800px", display: "flex", flexDirection: "column", gap: "2rem" }}>
      <div className="glass-panel" style={{ padding: "2rem" }}>
        <h2 style={{ marginBottom: "1.5rem", color: "var(--color-primary)" }}>Företagspriser</h2>
        <p style={{ fontSize: "0.95rem", color: "var(--color-text-secondary)", marginBottom: "2rem", lineHeight: 1.6 }}>
          Här ställer du in vilka avgifter som gäller specifikt för företagskonton. 
          Till skillnad från privatpersoner kan företag ha en månadskostnad för sin butikssida, samt ett eget pris för att publicera fordon.
        </p>
        
        <div className="grid-2-col" style={{ marginBottom: "2rem", gap: "2rem" }}>
          
          {/* Månadskostnad */}
          <div style={{ backgroundColor: "var(--color-bg-subtle)", padding: "1.5rem", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)" }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🏢</div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 700, fontSize: "1.1rem" }}>
              Månadskostnad Företagssida (kr)
            </label>
            <p style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)", marginBottom: "1rem" }}>
              Abonnemangskostnad för att ha en aktiv butikssida.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <input 
                type="number" 
                className="input-field" 
                value={companySubscriptionPrice} 
                onChange={e => setCompanySubscriptionPrice(e.target.value === "" ? "" : Number(e.target.value))} 
                style={{ fontSize: "1.1rem", fontWeight: 600 }}
              />
              <span style={{ fontWeight: 600 }}>kr / mån</span>
            </div>
          </div>

          {/* Pris per annons */}
          <div style={{ backgroundColor: "var(--color-bg-subtle)", padding: "1.5rem", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)" }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🚗</div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 700, fontSize: "1.1rem" }}>
              Pris per publicerad bil (kr)
            </label>
            <p style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)", marginBottom: "1rem" }}>
              Vad det kostar för ett företag att lägga ut en ny bilannons.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <input 
                type="number" 
                className="input-field" 
                value={companyAdPrice} 
                onChange={e => setCompanyAdPrice(e.target.value === "" ? "" : Number(e.target.value))} 
                style={{ fontSize: "1.1rem", fontWeight: 600 }}
              />
              <span style={{ fontWeight: 600 }}>kr / bil</span>
            </div>
          </div>

        </div>

        <button 
          onClick={handleSaveSettings} 
          disabled={saving} 
          className="btn-primary" 
          style={{ width: "100%", padding: "1rem", fontSize: "1.1rem" }}
        >
          {saving ? "Sparar priser..." : "Spara Allmänna Företagspriser"}
        </button>
      </div>

      {/* Unika priser per företag */}
      <div className="glass-panel" style={{ padding: "2rem" }}>
        <h2 style={{ marginBottom: "1.5rem", color: "var(--color-primary)" }}>Individuella Företagspriser</h2>
        <p style={{ fontSize: "0.95rem", color: "var(--color-text-secondary)", marginBottom: "2rem", lineHeight: 1.6 }}>
          Här kan du sätta ett unikt pris per annons och månad för ett specifikt företag. Om ett fält lämnas tomt gäller det allmänna företagspriset ovan.
        </p>

        <div style={{ marginBottom: "1.5rem" }}>
          <input 
            type="text" 
            placeholder="Sök på företagsnamn eller e-post..." 
            className="input-field" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ maxWidth: "400px" }}
          />
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-border)", textAlign: "left" }}>
                <th style={{ padding: "0.5rem" }}>Företag</th>
                <th style={{ padding: "0.5rem" }}>E-post</th>
                <th style={{ padding: "0.5rem", width: "150px" }}>Unikt Pris/Bil</th>
                <th style={{ padding: "0.5rem", width: "150px" }}>Unikt Pris/Mån</th>
                <th style={{ padding: "0.5rem", width: "100px", textAlign: "right" }}>Åtgärd</th>
              </tr>
            </thead>
            <tbody>
              {companies.filter(company => 
                (company.companyName && company.companyName.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (company.email && company.email.toLowerCase().includes(searchQuery.toLowerCase()))
              ).map(company => (
                <tr key={company.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                  <td style={{ padding: "0.75rem 0.5rem", fontWeight: 500 }}>{company.companyName || "Inget namn"}</td>
                  <td style={{ padding: "0.75rem 0.5rem", color: "var(--color-text-secondary)", fontSize: "0.9rem" }}>{company.email}</td>
                  <td style={{ padding: "0.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      <input 
                        type="number" 
                        className="input-field" 
                        defaultValue={company.customCompanyAdPrice} 
                        id={`edit-ad-${company.id}`}
                        style={{ width: "80px", padding: "0.3rem" }}
                      />
                      <span style={{ fontSize: "0.9rem" }}>kr</span>
                    </div>
                  </td>
                  <td style={{ padding: "0.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      <input 
                        type="number" 
                        className="input-field" 
                        defaultValue={company.customCompanySubscriptionPrice} 
                        id={`edit-sub-${company.id}`}
                        style={{ width: "80px", padding: "0.3rem" }}
                      />
                      <span style={{ fontSize: "0.9rem" }}>kr</span>
                    </div>
                  </td>
                  <td style={{ padding: "0.5rem", textAlign: "right" }}>
                    <button 
                      className="btn-primary" 
                      style={{ fontSize: "0.8rem", padding: "0.3rem 0.6rem" }}
                      onClick={async () => {
                        const adVal = (document.getElementById(`edit-ad-${company.id}`) as HTMLInputElement).value;
                        const subVal = (document.getElementById(`edit-sub-${company.id}`) as HTMLInputElement).value;
                        try {
                          await fetch("/api/admin/users/price", {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ 
                              userId: company.id, 
                              customCompanyAdPrice: adVal === "" ? null : Number(adVal),
                              customCompanySubscriptionPrice: subVal === "" ? null : Number(subVal)
                            })
                          });
                          showNotification("Unikt pris sparat för " + (company.companyName || company.email), "success");
                          fetchSettings();
                        } catch (e) {
                          showNotification("Kunde inte ändra priset.", "error");
                        }
                      }}
                    >
                      Spara
                    </button>
                  </td>
                </tr>
              ))}
              {companies.filter(company => 
                (company.companyName && company.companyName.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (company.email && company.email.toLowerCase().includes(searchQuery.toLowerCase()))
              ).length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: "var(--color-text-secondary)" }}>
                    Inga företag hittades.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
