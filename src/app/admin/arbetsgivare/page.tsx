"use client";

import { useState, useEffect } from "react";
import { useNotification } from "@/components/NotificationProvider";

export default function AdminEmployerPricingPage() {
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Arbetsgivarpriser
  const [employerAdPrice, setEmployerAdPrice] = useState<number | "">(0);
  const [employerSubscriptionPrice, setEmployerSubscriptionPrice] = useState<number | "">(0);
  
  // Övriga inställningar för att undvika överskrivning
  const [fullSettings, setFullSettings] = useState<any>(null);

  // Lista över arbetsgivare
  const [employers, setEmployers] = useState<any[]>([]);
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
      setEmployers(users.filter((u: any) => u.accountType === "Arbetsgivare"));

      setFullSettings(settings);
      setEmployerAdPrice(settings.employerAdPrice || 0);
      setEmployerSubscriptionPrice(settings.employerSubscriptionPrice || 0);
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
          employerAdPrice: Number(employerAdPrice),
          employerSubscriptionPrice: Number(employerSubscriptionPrice)
        })
      });
      showNotification("Arbetsgivarpriserna sparades!", "success");
      fetchSettings();
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
        <h2 style={{ marginBottom: "1.5rem", color: "var(--color-primary)" }}>Arbetsgivarpriser</h2>
        <p style={{ fontSize: "0.95rem", color: "var(--color-text-secondary)", marginBottom: "2rem", lineHeight: 1.6 }}>
          Här ställer du in vilka avgifter som gäller specifikt för arbetsgivare. 
          Du kan sätta en månadskostnad för att ha ett arbetsgivarkonto, samt ett pris för varje upplagd jobbannons.
        </p>
        
        <div className="grid-2-col" style={{ marginBottom: "2rem", gap: "2rem" }}>
          
          {/* Månadskostnad */}
          <div style={{ backgroundColor: "var(--color-bg-subtle)", padding: "1.5rem", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)" }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🏢</div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 700, fontSize: "1.1rem" }}>
              Månadskostnad Arbetsgivare (kr)
            </label>
            <p style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)", marginBottom: "1rem" }}>
              Abonnemangskostnad för arbetsgivare.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <input 
                type="number" 
                className="input-field" 
                value={employerSubscriptionPrice} 
                onChange={e => setEmployerSubscriptionPrice(e.target.value === "" ? "" : Number(e.target.value))} 
                style={{ fontSize: "1.1rem", fontWeight: 600 }}
              />
              <span style={{ fontWeight: 600 }}>kr / mån</span>
            </div>
          </div>

          {/* Pris per annons */}
          <div style={{ backgroundColor: "var(--color-bg-subtle)", padding: "1.5rem", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)" }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📄</div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 700, fontSize: "1.1rem" }}>
              Pris per platsannons (kr)
            </label>
            <p style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)", marginBottom: "1rem" }}>
              Vad det kostar för en arbetsgivare att lägga ut en platsannons.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <input 
                type="number" 
                className="input-field" 
                value={employerAdPrice} 
                onChange={e => setEmployerAdPrice(e.target.value === "" ? "" : Number(e.target.value))} 
                style={{ fontSize: "1.1rem", fontWeight: 600 }}
              />
              <span style={{ fontWeight: 600 }}>kr / annons</span>
            </div>
          </div>

        </div>

        <button 
          onClick={handleSaveSettings} 
          disabled={saving} 
          className="btn-primary" 
          style={{ width: "100%", padding: "1rem", fontSize: "1.1rem" }}
        >
          {saving ? "Sparar priser..." : "Spara Allmänna Arbetsgivarpriser"}
        </button>
      </div>

      {/* Unika priser per arbetsgivare */}
      <div className="glass-panel" style={{ padding: "2rem" }}>
        <h2 style={{ marginBottom: "1.5rem", color: "var(--color-primary)" }}>Individuella Arbetsgivarpriser</h2>
        <p style={{ fontSize: "0.95rem", color: "var(--color-text-secondary)", marginBottom: "2rem", lineHeight: 1.6 }}>
          Här kan du sätta ett unikt pris per annons och månad för en specifik arbetsgivare. Om ett fält lämnas tomt gäller det allmänna priset ovan.
        </p>

        <div style={{ marginBottom: "1.5rem" }}>
          <input 
            type="text" 
            placeholder="Sök på arbetsgivarens namn eller e-post..." 
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
                <th style={{ padding: "0.5rem" }}>Arbetsgivare</th>
                <th style={{ padding: "0.5rem" }}>E-post</th>
                <th style={{ padding: "0.5rem", width: "150px" }}>Unikt Pris/Annons</th>
                <th style={{ padding: "0.5rem", width: "150px" }}>Unikt Pris/Mån</th>
                <th style={{ padding: "0.5rem", width: "100px", textAlign: "right" }}>Åtgärd</th>
              </tr>
            </thead>
            <tbody>
              {employers.filter(emp => 
                (emp.companyName && emp.companyName.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (emp.email && emp.email.toLowerCase().includes(searchQuery.toLowerCase()))
              ).map(emp => (
                <tr key={emp.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                  <td style={{ padding: "0.75rem 0.5rem", fontWeight: 500 }}>{emp.companyName || emp.name || "Inget namn"}</td>
                  <td style={{ padding: "0.75rem 0.5rem", color: "var(--color-text-secondary)", fontSize: "0.9rem" }}>{emp.email}</td>
                  <td style={{ padding: "0.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      <input 
                        type="number" 
                        className="input-field" 
                        defaultValue={emp.customEmployerAdPrice} 
                        id={`edit-ad-${emp.id}`}
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
                        defaultValue={emp.customEmployerSubscriptionPrice} 
                        id={`edit-sub-${emp.id}`}
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
                        const adVal = (document.getElementById(`edit-ad-${emp.id}`) as HTMLInputElement).value;
                        const subVal = (document.getElementById(`edit-sub-${emp.id}`) as HTMLInputElement).value;
                        try {
                          await fetch("/api/admin/users/price", {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ 
                              userId: emp.id, 
                              customEmployerAdPrice: adVal === "" ? null : Number(adVal),
                              customEmployerSubscriptionPrice: subVal === "" ? null : Number(subVal)
                            })
                          });
                          showNotification("Unikt pris sparat för " + (emp.companyName || emp.name || emp.email), "success");
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
              {employers.filter(emp => 
                (emp.companyName && emp.companyName.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (emp.email && emp.email.toLowerCase().includes(searchQuery.toLowerCase()))
              ).length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: "var(--color-text-secondary)" }}>
                    Inga arbetsgivare hittades.
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
