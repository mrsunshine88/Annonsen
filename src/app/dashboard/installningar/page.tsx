"use client";

import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import { useNotification } from "@/components/NotificationProvider";

export default function SettingsPage() {
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [autoLocation, setAutoLocation] = useState(true);
  const [defaultLocation, setDefaultLocation] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const { showNotification, showConfirm } = useNotification();

  const [accountType, setAccountType] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyOrgNr, setCompanyOrgNr] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [companyZipCode, setCompanyZipCode] = useState("");
  const [companyCity, setCompanyCity] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [companyOpeningHours, setCompanyOpeningHours] = useState("");
  const [companyDescription, setCompanyDescription] = useState("");
  const [companyLogoUrl, setCompanyLogoUrl] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [canPublishAds, setCanPublishAds] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    fetch("/api/user/settings")
      .then(res => res.json())
      .then(data => {
        if (data.autoLocation !== undefined) setAutoLocation(data.autoLocation);
        if (data.defaultLocation !== undefined && data.defaultLocation !== null) setDefaultLocation(data.defaultLocation);
        
        if (data.accountType) setAccountType(data.accountType);
        if (data.companyName) setCompanyName(data.companyName);
        if (data.companyOrgNr) setCompanyOrgNr(data.companyOrgNr);
        if (data.companyAddress) setCompanyAddress(data.companyAddress);
        if (data.companyZipCode) setCompanyZipCode(data.companyZipCode);
        if (data.companyCity) setCompanyCity(data.companyCity);
        if (data.companyWebsite) setCompanyWebsite(data.companyWebsite);
        if (data.companyOpeningHours) setCompanyOpeningHours(data.companyOpeningHours);
        if (data.companyDescription) setCompanyDescription(data.companyDescription);
        if (data.companyLogoUrl) setCompanyLogoUrl(data.companyLogoUrl);
        if (data.companyPhone) setCompanyPhone(data.companyPhone);
        
        if (data.hasActiveSubscription !== undefined) setHasActiveSubscription(data.hasActiveSubscription);
        if (data.canPublishAds !== undefined) setCanPublishAds(data.canPublishAds);
      });
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ text: "Uppdaterar...", type: "info" });
    
    try {
      const payload: any = { autoLocation, defaultLocation };
      
      if (accountType === "Företag" || accountType === "Arbetsgivare") {
        payload.companyName = companyName;
        payload.companyOrgNr = companyOrgNr;
        payload.companyAddress = companyAddress;
        payload.companyZipCode = companyZipCode;
        payload.companyCity = companyCity;
        payload.companyWebsite = companyWebsite;
        payload.companyOpeningHours = companyOpeningHours;
        payload.companyDescription = companyDescription;
        payload.companyLogoUrl = companyLogoUrl;
        payload.companyPhone = companyPhone;
      }

      const res = await fetch("/api/user/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error("Gick inte att spara");
      setMessage({ text: "Inställningar uppdaterade!", type: "success" });
    } catch (err) {
      setMessage({ text: "Ett fel uppstod.", type: "error" });
    }
  };

  const handleDelete = async () => {
    const confirmed = await showConfirm({ message: "Är du helt säker på att du vill ta bort ditt konto? Detta går inte att ångra." });
    if (confirmed) {
      showNotification("Konto borttaget. (Demo)", "success");
      signOut({ callbackUrl: "/" });
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploadingLogo(true);
    
    let fileToUpload = e.target.files[0];
    
    try {
      const imageCompression = (await import("browser-image-compression")).default;
      const options = {
        maxSizeMB: 0.5, // Företagsloggor kan vara små (max 500kb)
        maxWidthOrHeight: 800,
        useWebWorker: true
      };
      fileToUpload = await imageCompression(fileToUpload, options);
    } catch (err) {
      console.warn("Bildkomprimering misslyckades", err);
    }

    const formData = new FormData();
    formData.append("files", fileToUpload);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Kunde inte ladda upp bilden");
      const data = await res.json();
      if (data.urls && data.urls.length > 0) {
        setCompanyLogoUrl(data.urls[0]);
      }
    } catch (err) {
      showNotification("Fel vid uppladdning av bild.", "error");
    } finally {
      setUploadingLogo(false);
    }
  };

  const startSubscription = async () => {
    setPaymentLoading(true);
    try {
      const res = await fetch("/api/payments/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID || "mock_price" })
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        showNotification(data.error || "Gick inte att starta betalning", "error");
      }
    } catch (err) {
      showNotification("Ett nätverksfel uppstod", "error");
    } finally {
      setPaymentLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "800px" }}>
      <h2 style={{ marginBottom: '2rem' }}>Inställningar</h2>
      
      {message.text && (
        <div style={{ 
          padding: "1rem", 
          marginBottom: "2rem",
          backgroundColor: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)',
          color: message.type === 'success' ? 'var(--color-success)' : 'var(--color-primary)',
          borderRadius: "var(--radius-md)"
        }}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginBottom: '3rem' }}>
        
        {/* Kontoinställningar */}
        <div style={{ padding: "1.5rem", backgroundColor: "var(--color-bg-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)" }}>
          <h3 style={{ marginBottom: "1.5rem" }}>Kontouppgifter</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Ny E-postadress</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field" 
                placeholder="Lämna tomt för att behålla nuvarande" 
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Nuvarande Lösenord (krävs för ändringar)</label>
              <input 
                type="password" 
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="input-field" 
                placeholder="••••••••" 
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Nytt Lösenord</label>
              <input 
                type="password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input-field" 
                placeholder="Lämna tomt för att behålla nuvarande" 
              />
            </div>
          </div>
        </div>

        {/* Fakturering och Prenumeration (Endast Företag/Arbetsgivare) */}
        {(accountType === "Företag" || accountType === "Arbetsgivare") && (
          <div style={{ padding: "1.5rem", backgroundColor: "var(--color-bg-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)" }}>
            <h3 style={{ marginBottom: "1.5rem" }}>Fakturering & Prenumeration</h3>
            
            {hasActiveSubscription ? (
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem", backgroundColor: "rgba(16, 185, 129, 0.1)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-success)" }}>
                <span style={{ fontSize: "1.5rem" }}>✅</span>
                <div>
                  <h4 style={{ margin: "0 0 0.25rem 0", color: "var(--color-success)" }}>Aktiv Prenumeration</h4>
                  <p style={{ margin: 0, color: "var(--color-text-secondary)", fontSize: "0.9rem" }}>Ditt konto är aktivt och du kan publicera annonser. Annonser faktureras automatiskt i slutet av månaden enligt din plan.</p>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem", padding: "1.5rem", backgroundColor: "var(--color-bg-subtle)", borderRadius: "var(--radius-md)" }}>
                <div>
                  <h4 style={{ margin: "0 0 0.5rem 0" }}>Aktivering krävs</h4>
                  <p style={{ margin: 0, color: "var(--color-text-secondary)", fontSize: "0.9rem", lineHeight: "1.5" }}>
                    För att kunna publicera annonser måste du aktivera företagets prenumeration via Stripe. Ditt kort debiteras inte direkt för annonser, utan kostnaderna samlas ihop och faktureras automatiskt.
                  </p>
                </div>
                <button 
                  type="button"
                  onClick={startSubscription} 
                  disabled={paymentLoading}
                  className="btn-primary" 
                  style={{ width: "fit-content", display: "flex", alignItems: "center", gap: "0.5rem" }}
                >
                  {paymentLoading ? "Laddar..." : "💳 Aktivera Annonsering (Stripe)"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Företagsprofil */}
        {(accountType === "Företag" || accountType === "Arbetsgivare") && (
          <div style={{ padding: "1.5rem", backgroundColor: "var(--color-bg-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
              <h3 style={{ margin: 0 }}>Din Företagsprofil</h3>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div className="grid-2-col">
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Företagsnamn</label>
                  <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} className="input-field" required />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Organisationsnummer</label>
                  <input type="text" value={companyOrgNr} onChange={e => setCompanyOrgNr(e.target.value)} className="input-field" required />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Gatuadress</label>
                <input type="text" value={companyAddress} onChange={e => setCompanyAddress(e.target.value)} className="input-field" required />
              </div>

              <div className="grid-2-col">
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Postnummer</label>
                  <input type="text" value={companyZipCode} onChange={e => setCompanyZipCode(e.target.value)} className="input-field" required />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Ort</label>
                  <input type="text" value={companyCity} onChange={e => setCompanyCity(e.target.value)} className="input-field" required />
                </div>
              </div>

              <div className="grid-2-col">
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Hemsida</label>
                  <input type="url" value={companyWebsite} onChange={e => setCompanyWebsite(e.target.value)} className="input-field" placeholder="https://" />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Företagstelefon</label>
                  <input type="tel" value={companyPhone} onChange={e => setCompanyPhone(e.target.value)} className="input-field" placeholder="0455-12345" />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Öppettider</label>
                <input type="text" value={companyOpeningHours} onChange={e => setCompanyOpeningHours(e.target.value)} className="input-field" placeholder="T.ex. Mån-Fre 09-18" />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Logotyp</label>
                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                  {companyLogoUrl && (
                    <div style={{ width: "80px", height: "80px", backgroundColor: "var(--color-bg-subtle)", borderRadius: "var(--radius-md)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={companyLogoUrl} alt="Logotyp" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="input-field" 
                      style={{ marginBottom: "0.5rem" }}
                      disabled={uploadingLogo}
                    />
                    {uploadingLogo && <span style={{ fontSize: "0.85rem", color: "var(--color-primary)" }}>Laddar upp...</span>}
                    <p style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)", margin: 0 }}>Välj en bildfil (t.ex. PNG eller JPG). Rekommenderad storlek 400x400px.</p>
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Beskrivning av företaget</label>
                <textarea 
                  value={companyDescription} 
                  onChange={e => setCompanyDescription(e.target.value)} 
                  className="input-field" 
                  rows={4}
                  placeholder="Kort presentation om er butik och vad ni erbjuder..."
                  style={{ resize: "vertical" }}
                />
              </div>

            </div>
          </div>
        )}

        {/* Platsinställningar */}
        <div style={{ padding: "1.5rem", backgroundColor: "var(--color-bg-subtle)", borderRadius: "var(--radius-lg)" }}>
          <h3 style={{ marginBottom: "1rem" }}>Standardplats</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Spara min plats (Län)</label>
              <select 
                className="input-field" 
                value={defaultLocation} 
                onChange={e => setDefaultLocation(e.target.value)}
                style={{ maxWidth: "300px" }}
              >
                <option value="">Använd inte sparat Län</option>
                {["Blekinge", "Dalarna", "Gotland", "Gävleborg", "Halland", "Jämtland", "Jönköping", "Kalmar", "Kronoberg", "Norrbotten", "Skåne", "Stockholm", "Södermanland", "Uppsala", "Värmland", "Västerbotten", "Västernorrland", "Västmanland", "Västra Götaland", "Örebro", "Östergötland"].map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
              <p style={{ marginTop: "0.5rem", fontSize: "0.85rem", color: "var(--color-text-secondary)" }}>
                Om du väljer ett län här så kommer det alltid att vara förvalt på söksidan och när du skapar annonser.
              </p>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', fontWeight: 500 }}>
              <input 
                type="checkbox" 
                checked={autoLocation}
                onChange={(e) => setAutoLocation(e.target.checked)}
                style={{ width: "20px", height: "20px" }}
                disabled={!!defaultLocation}
              />
              <span style={{ opacity: defaultLocation ? 0.5 : 1 }}>Tillåt att sidan gissar min plats (län) via min IP-adress</span>
            </label>
          </div>
        </div>

        <button type="submit" className="btn-primary" style={{ width: 'fit-content' }}>Spara ändringar</button>
      </form>

      <hr style={{ border: 0, borderTop: '1px solid var(--color-border)', marginBottom: '2rem' }} />

      <div>
        <h3 style={{ color: 'var(--color-error)', marginBottom: '1rem' }}>Farlig zon</h3>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
          När du tar bort ditt konto försvinner alla dina annonser och meddelanden permanent.
        </p>
        <button onClick={handleDelete} className="btn-secondary" style={{ color: 'var(--color-error)', borderColor: 'var(--color-error)' }}>
          Ta bort mitt konto
        </button>
      </div>
    </div>
  );
}
