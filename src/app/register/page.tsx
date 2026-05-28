"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import BackButton from "@/components/BackButton";

export default function RegisterPage() {
  const router = useRouter();
  
  const [accountType, setAccountType] = useState<"Privat" | "Företag">("Privat");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Gemensamma fält
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(""); // Privat förnamn/efternamn, eller kontaktperson för företag
  
  // Företagsfält
  const [companyName, setCompanyName] = useState("");
  const [companyOrgNr, setCompanyOrgNr] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [companyZipCode, setCompanyZipCode] = useState("");
  const [companyCity, setCompanyCity] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [companyOpeningHours, setCompanyOpeningHours] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountType,
          email,
          password,
          name,
          companyName,
          companyOrgNr,
          companyAddress,
          companyZipCode,
          companyCity,
          companyWebsite,
          companyOpeningHours
        })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Något gick fel vid registreringen");
      }
      
      // Gå till inloggning vid framgång
      router.push("/login?registered=true");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "3rem auto" }}>
      <BackButton label="Tillbaka" />
      <div className="glass-panel" style={{ padding: "2rem", marginTop: "1rem" }}>
        <h1 style={{ fontSize: "1.8rem", textAlign: "center", marginBottom: "1.5rem" }}>Skapa konto</h1>
        
        {/* Toggle Privat / Företag */}
        <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
          <button 
            type="button"
            className={accountType === "Privat" ? "btn-primary" : "btn-secondary"}
            style={{ flex: 1 }}
            onClick={() => setAccountType("Privat")}
          >
            Privatperson
          </button>
          <button 
            type="button"
            className={accountType === "Företag" ? "btn-primary" : "btn-secondary"}
            style={{ flex: 1 }}
            onClick={() => setAccountType("Företag")}
          >
            Företag
          </button>
        </div>

        {error && (
          <div style={{ padding: "0.75rem", backgroundColor: "rgba(239, 68, 68, 0.1)", color: "var(--color-error)", borderRadius: "var(--radius-md)", marginBottom: "1rem", textAlign: "center" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
          
          <div className="grid-2-col">
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>E-post</label>
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input-field" 
                placeholder="din@epost.se" 
                required 
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Lösenord</label>
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input-field" 
                placeholder="••••••••" 
                required 
                minLength={6}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>
              {accountType === "Privat" ? "För- och efternamn" : "Kontaktperson (För- och efternamn)"}
            </label>
            <input 
              type="text" 
              value={name}
              onChange={e => setName(e.target.value)}
              className="input-field" 
              placeholder="Sven Svensson" 
              required 
            />
          </div>

          {accountType === "Företag" && (
            <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--color-border)" }}>
              <h3 style={{ marginBottom: "1rem" }}>Företagsuppgifter</h3>
              
              <div className="grid-2-col" style={{ marginBottom: "1.2rem" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Företagsnamn</label>
                  <input 
                    type="text" 
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    className="input-field" 
                    placeholder="Bilfirma AB" 
                    required={accountType === "Företag"} 
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Organisationsnummer</label>
                  <input 
                    type="text" 
                    value={companyOrgNr}
                    onChange={e => setCompanyOrgNr(e.target.value)}
                    className="input-field" 
                    placeholder="556XXX-XXXX" 
                    required={accountType === "Företag"} 
                  />
                </div>
              </div>

              <div style={{ marginBottom: "1.2rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Gatuadress</label>
                <input 
                  type="text" 
                  value={companyAddress}
                  onChange={e => setCompanyAddress(e.target.value)}
                  className="input-field" 
                  placeholder="Storgatan 1" 
                  required={accountType === "Företag"} 
                />
              </div>

              <div className="grid-2-col" style={{ marginBottom: "1.2rem" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Postnummer</label>
                  <input 
                    type="text" 
                    value={companyZipCode}
                    onChange={e => setCompanyZipCode(e.target.value)}
                    className="input-field" 
                    placeholder="123 45" 
                    required={accountType === "Företag"} 
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Ort</label>
                  <input 
                    type="text" 
                    value={companyCity}
                    onChange={e => setCompanyCity(e.target.value)}
                    className="input-field" 
                    placeholder="Stockholm" 
                    required={accountType === "Företag"} 
                  />
                </div>
              </div>

              <div className="grid-2-col" style={{ marginBottom: "1.2rem" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Hemsida (Frivilligt)</label>
                  <input 
                    type="url" 
                    value={companyWebsite}
                    onChange={e => setCompanyWebsite(e.target.value)}
                    className="input-field" 
                    placeholder="https://www.bilfirma.se" 
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Öppettider (Frivilligt)</label>
                  <input 
                    type="text" 
                    value={companyOpeningHours}
                    onChange={e => setCompanyOpeningHours(e.target.value)}
                    className="input-field" 
                    placeholder="Mån-Fre 09-18" 
                  />
                </div>
              </div>
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: "1.5rem", width: "100%", padding: "0.8rem", fontSize: "1.1rem" }}>
            {loading ? "Skapar konto..." : "Skapa konto"}
          </button>
        </form>
        
        <div style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.9rem", color: "var(--color-text-secondary)" }}>
          Har du redan ett konto? <Link href="/login" style={{ color: "var(--color-primary)", fontWeight: 600 }}>Logga in här</Link>
        </div>
      </div>
    </div>
  );
}
