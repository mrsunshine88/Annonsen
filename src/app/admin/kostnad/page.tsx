"use client";

import { useState, useEffect } from "react";

export default function AdminKostnadPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Settings
  const [paymentsEnabled, setPaymentsEnabled] = useState(false);
  const [defaultAdPrice, setDefaultAdPrice] = useState<number | "">(0);
  const [bumpEnabled, setBumpEnabled] = useState(false);
  const [bumpPrice, setBumpPrice] = useState<number | "">(0);
  const [swishMode, setSwishMode] = useState("TEST");
  const [swishAlias, setSwishAlias] = useState("");
  const [swishCert, setSwishCert] = useState("");
  const [swishKey, setSwishKey] = useState("");
  
  // Categories
  const [categories, setCategories] = useState<any[]>([]);
  
  // Kategori-väljare state
  const [mainCategoryId, setMainCategoryId] = useState("");
  const [subCategoryId, setSubCategoryId] = useState("");
  const [subSubCategoryId, setSubSubCategoryId] = useState("");
  const [customPrice, setCustomPrice] = useState<number | "">("");

  // Beräkna vald kategori
  const selectedCategoryId = subSubCategoryId || subCategoryId || mainCategoryId;
  const selectedCategory = categories.flatMap(c => [c, ...(c.subcategories || [])]).flatMap((c: any) => [c, ...(c.subcategories || [])]).find((c: any) => c.id === selectedCategoryId);

  useEffect(() => {
    fetchSettingsAndCategories();
  }, []);

  // Uppdatera customPrice-fältet när vald kategori ändras
  useEffect(() => {
    if (selectedCategory) {
      setCustomPrice(selectedCategory.customPrice === null ? "" : selectedCategory.customPrice);
    } else {
      setCustomPrice("");
    }
  }, [selectedCategoryId, selectedCategory]);

  const fetchSettingsAndCategories = async () => {
    try {
      const [settingsRes, catRes] = await Promise.all([
        fetch("/api/admin/settings"),
        fetch("/api/categories")
      ]);
      const settings = await settingsRes.json();
      const cats = await catRes.json();
      
      setPaymentsEnabled(settings.paymentsEnabled);
      setDefaultAdPrice(settings.defaultAdPrice);
      setBumpEnabled(settings.bumpEnabled || false);
      setBumpPrice(settings.bumpPrice || 0);
      setSwishMode(settings.swishMode || "TEST");
      setSwishAlias(settings.swishAlias || "");
      setSwishCert(settings.swishCert || "");
      setSwishKey(settings.swishKey || "");
      
      setCategories(cats);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          paymentsEnabled, defaultAdPrice, swishMode, swishAlias, swishCert, swishKey,
          bumpEnabled, bumpPrice
        })
      });
      alert("Inställningar sparade!");
    } catch (e) {
      alert("Kunde inte spara.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCategoryPrice = async () => {
    if (!selectedCategoryId) return;
    try {
      await fetch("/api/admin/categories/price", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId: selectedCategoryId, customPrice: customPrice === "" ? null : Number(customPrice) })
      });
      alert("Kategoripris sparat!");
      fetchSettingsAndCategories(); // Ladda om för att få uppdaterade värden
    } catch (e) {
      alert("Kunde inte spara kategoripriset.");
    }
  };

  if (loading) return <div style={{ padding: "4rem", textAlign: "center" }}>Laddar...</div>;

  return (
    <div style={{ maxWidth: "800px", display: "flex", flexDirection: "column", gap: "2rem" }}>
      <div className="glass-panel" style={{ padding: "2rem" }}>
        <h2 style={{ marginBottom: "1.5rem" }}>Swish & Betalningsinställningar</h2>
        
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontWeight: 600 }}>
            <input 
              type="checkbox" 
              checked={paymentsEnabled} 
              onChange={e => setPaymentsEnabled(e.target.checked)} 
              style={{ width: "1.2rem", height: "1.2rem" }}
            />
            Kräv betalning för att publicera annonser
          </label>
        </div>

        <div className="grid-2-col" style={{ marginBottom: "2rem", paddingBottom: "2rem", borderBottom: "1px solid var(--color-border)" }}>
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>Standardpris (kr) för nya annonser</label>
            <input 
              type="number" 
              className="input-field" 
              value={defaultAdPrice} 
              onChange={e => setDefaultAdPrice(e.target.value === "" ? "" : Number(e.target.value))} 
            />
          </div>
        </div>

        <h3 style={{ marginBottom: "1.5rem" }}>Uppdatera Pris ("Bump")</h3>
        <p style={{ fontSize: "0.9rem", color: "var(--color-text-secondary)", marginBottom: "1rem" }}>
          Låter säljare sänka priset på sin annons och få den att hamna högst upp i flödet igen (som en ny annons) mot en kostnad.
        </p>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontWeight: 600 }}>
            <input 
              type="checkbox" 
              checked={bumpEnabled} 
              onChange={e => setBumpEnabled(e.target.checked)} 
              style={{ width: "1.2rem", height: "1.2rem" }}
            />
            Aktivera funktion för att uppdatera pris & flytta upp
          </label>
        </div>

        <div className="grid-2-col" style={{ marginBottom: "2rem", paddingBottom: "2rem", borderBottom: "1px solid var(--color-border)" }}>
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>Kostnad (kr) för att flytta upp annons</label>
            <input 
              type="number" 
              className="input-field" 
              value={bumpPrice} 
              onChange={e => setBumpPrice(e.target.value === "" ? "" : Number(e.target.value))} 
            />
          </div>
        </div>

        <h3 style={{ marginBottom: "1rem" }}>Swish Handel Integration</h3>
        
        <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
          <button 
            className={swishMode === "TEST" ? "btn-primary" : "btn-secondary"} 
            onClick={() => setSwishMode("TEST")}
            style={{ flex: 1 }}
          >
            TEST-läge
          </button>
          <button 
            className={swishMode === "LIVE" ? "btn-primary" : "btn-secondary"} 
            onClick={() => setSwishMode("LIVE")}
            style={{ flex: 1 }}
          >
            LIVE-läge (Riktiga betalningar)
          </button>
        </div>
        <p style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)", marginBottom: "1.5rem" }}>
          I TEST-läget används Swish simulator-API (ingen app krävs). I LIVE-läget sker riktiga dragningar.
        </p>

        {swishMode === "LIVE" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem" }}>Swish-nummer (Alias)</label>
              <input type="text" className="input-field" value={swishAlias} onChange={e => setSwishAlias(e.target.value)} placeholder="T.ex. 1234567890" />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem" }}>Klientcertifikat (PEM)</label>
              <textarea className="input-field" rows={4} value={swishCert} onChange={e => setSwishCert(e.target.value)} placeholder="Klistra in certifikatet här..." />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem" }}>Privat nyckel (PEM)</label>
              <textarea className="input-field" rows={4} value={swishKey} onChange={e => setSwishKey(e.target.value)} placeholder="Klistra in nyckeln här..." />
            </div>
          </div>
        )}

        <button onClick={handleSaveSettings} disabled={saving} className="btn-primary" style={{ marginTop: "2rem" }}>
          {saving ? "Sparar..." : "Spara Allmänna Inställningar"}
        </button>
      </div>

      {/* Ny sektion för kategorispecifika priser */}
      <div className="glass-panel" style={{ padding: "2rem" }}>
        <h2 style={{ marginBottom: "1.5rem" }}>Specialpris per Kategori</h2>
        <p style={{ fontSize: "0.9rem", color: "var(--color-text-secondary)", marginBottom: "1.5rem" }}>
          Här kan du sätta ett specifikt pris för att publicera en annons i en viss kategori (t.ex. om bilar ska kosta 50 kr). Lämnas fältet tomt används standardpriset ({defaultAdPrice} kr).
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", marginBottom: "2rem" }}>
          <div className="responsive-flex">
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>Huvudkategori</label>
              <select className="input-field" value={mainCategoryId} onChange={e => { setMainCategoryId(e.target.value); setSubCategoryId(""); setSubSubCategoryId(""); }}>
                <option value="">Välj huvudkategori</option>
                {categories.map(mainCat => (
                  <option key={mainCat.id} value={mainCat.id}>{mainCat.name}</option>
                ))}
              </select>
            </div>

            {mainCategoryId && categories.find(c => c.id === mainCategoryId)?.subcategories?.length > 0 && (
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>Underkategori</label>
                <select className="input-field" value={subCategoryId} onChange={e => { setSubCategoryId(e.target.value); setSubSubCategoryId(""); }}>
                  <option value="">Välj underkategori</option>
                  {categories.find(c => c.id === mainCategoryId)?.subcategories.map((sub: any) => (
                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                  ))}
                </select>
              </div>
            )}

            {subCategoryId && categories.find(c => c.id === mainCategoryId)?.subcategories?.find((s: any) => s.id === subCategoryId)?.subcategories?.length > 0 && (
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>Detaljerad Kategori</label>
                <select className="input-field" value={subSubCategoryId} onChange={e => setSubSubCategoryId(e.target.value)}>
                  <option value="">Välj specifik kategori</option>
                  {categories.find(c => c.id === mainCategoryId)?.subcategories?.find((s: any) => s.id === subCategoryId)?.subcategories.map((sub: any) => (
                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {selectedCategoryId && (
            <div style={{ padding: "1.5rem", backgroundColor: "var(--color-bg-subtle)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)" }}>
              <h3 style={{ marginBottom: "1rem", color: "var(--color-primary)" }}>
                Prissättning för: {selectedCategory?.name}
              </h3>
              <div className="responsive-flex" style={{ alignItems: "flex-end" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>Specialpris (kr)</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    value={customPrice} 
                    onChange={e => setCustomPrice(e.target.value === "" ? "" : Number(e.target.value))} 
                    placeholder="Lämna tomt för standardpris"
                  />
                </div>
                <div>
                  <button onClick={handleSaveCategoryPrice} className="btn-primary">Spara kategoripris</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Lista med aktiva specialpriser */}
        <div style={{ marginTop: "3rem" }}>
          <h3 style={{ marginBottom: "1rem", borderBottom: "1px solid var(--color-border)", paddingBottom: "0.5rem" }}>Aktiva Specialpriser</h3>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-border)", textAlign: "left" }}>
                <th style={{ padding: "0.5rem" }}>Kategori</th>
                <th style={{ padding: "0.5rem", width: "150px" }}>Specialpris (kr)</th>
                <th style={{ padding: "0.5rem", width: "150px", textAlign: "right" }}>Åtgärd</th>
              </tr>
            </thead>
            <tbody>
              {categories.flatMap(main => {
                let items = [];
                if (main.customPrice !== null) items.push({ id: main.id, path: main.name, price: main.customPrice });
                (main.subcategories || []).forEach((sub: any) => {
                  if (sub.customPrice !== null) items.push({ id: sub.id, path: `${main.name} > ${sub.name}`, price: sub.customPrice });
                  (sub.subcategories || []).forEach((subsub: any) => {
                    if (subsub.customPrice !== null) items.push({ id: subsub.id, path: `${main.name} > ${sub.name} > ${subsub.name}`, price: subsub.customPrice });
                  });
                });
                return items;
              }).map(cat => (
                <tr key={cat.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                  <td style={{ padding: "0.5rem", fontWeight: 500 }}>{cat.path}</td>
                  <td style={{ padding: "0.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <input 
                        type="number" 
                        className="input-field" 
                        defaultValue={cat.price} 
                        id={`edit-price-${cat.id}`}
                        style={{ width: "100px", padding: "0.3rem" }}
                      />
                      <span>kr</span>
                    </div>
                  </td>
                  <td style={{ padding: "0.5rem", textAlign: "right" }}>
                    <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                      <button 
                        className="btn-primary" 
                        style={{ fontSize: "0.8rem", padding: "0.3rem 0.6rem" }}
                        onClick={async () => {
                          const val = (document.getElementById(`edit-price-${cat.id}`) as HTMLInputElement).value;
                          if (val === "") return;
                          try {
                            await fetch("/api/admin/categories/price", {
                              method: "PUT",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ categoryId: cat.id, customPrice: Number(val) })
                            });
                            alert("Priset uppdaterades!");
                            fetchSettingsAndCategories();
                          } catch (e) {
                            alert("Kunde inte ändra priset.");
                          }
                        }}
                      >
                        Ändra
                      </button>
                      <button 
                        className="btn-secondary" 
                        style={{ fontSize: "0.8rem", padding: "0.3rem 0.6rem" }}
                        onClick={async () => {
                          try {
                            await fetch("/api/admin/categories/price", {
                              method: "PUT",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ categoryId: cat.id, customPrice: null })
                            });
                            fetchSettingsAndCategories();
                          } catch (e) {
                            alert("Kunde inte ta bort priset.");
                          }
                        }}
                      >
                        Ta bort
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {categories.flatMap(main => {
                let items = [];
                if (main.customPrice !== null) items.push(main);
                (main.subcategories || []).forEach((sub: any) => {
                  if (sub.customPrice !== null) items.push(sub);
                  (sub.subcategories || []).forEach((subsub: any) => {
                    if (subsub.customPrice !== null) items.push(subsub);
                  });
                });
                return items;
              }).length === 0 && (
                <tr>
                  <td colSpan={3} style={{ padding: "1rem", textAlign: "center", color: "var(--color-text-secondary)" }}>
                    Inga specialpriser satta. Standardpriset används för alla kategorier.
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
