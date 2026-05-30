"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import BackButton from "@/components/BackButton";
import { useNotification } from "@/components/NotificationProvider";

export default function CreateJobAdPage() {
  const { showNotification } = useNotification();
  const router = useRouter();
  const { data: session } = useSession();

  const [loading, setLoading] = useState(false);
  const [canPublish, setCanPublish] = useState<boolean | null>(null);
  const [accountType, setAccountType] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [industry, setIndustry] = useState("");
  const [location, setLocation] = useState("");
  const [scope, setScope] = useState("Heltid");
  const [duration, setDuration] = useState("Tillsvidare");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [merits, setMerits] = useState("");
  const [deadline, setDeadline] = useState("");
  const [applyUrl, setApplyUrl] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  import("react").then(({ useEffect }) => {
    // Endast ladda om vi inte har hämtat
    if (canPublish === null && typeof window !== "undefined") {
      fetch("/api/user/settings")
        .then(res => res.json())
        .then(data => {
          setCanPublish(data.canPublishAds ?? true); // Default true för säkert fall ifall fältet saknas
          setAccountType(data.accountType);
        })
        .catch(() => setCanPublish(true));
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/jobb", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title, industry, location, scope, duration, description, 
          requirements, merits, deadline, applyUrl, contactPerson, contactEmail
        })
      });
      const data = await res.json();
      
      if (res.ok) {
        showNotification("Jobbannonsen har skapats!", "success");
        router.push("/jobb");
      } else {
        showNotification(data.error || "Något gick fel", "error");
      }
    } catch (error) {
      showNotification("Något gick fel vid publiceringen", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "800px", margin: "2rem auto", padding: "1rem" }}>
      <BackButton label="Tillbaka" />
      <div className="glass-panel" style={{ padding: "2rem", marginTop: "1rem" }}>
        <h1 style={{ fontSize: "1.8rem", color: "var(--color-primary)", marginBottom: "1.5rem" }}>Skapa Jobbannons</h1>
        
        {canPublish === false && (accountType === "Företag" || accountType === "Arbetsgivare") ? (
          <div style={{ padding: "2rem", backgroundColor: "var(--color-bg-surface)", border: "1px solid var(--color-error)", borderRadius: "var(--radius-lg)", textAlign: "center" }}>
            <h2 style={{ color: "var(--color-error)", marginBottom: "1rem" }}>Aktivering krävs</h2>
            <p style={{ color: "var(--color-text-secondary)", marginBottom: "2rem" }}>
              Ditt konto måste aktiveras innan du kan publicera jobbannonser. Om du precis har skapat kontot väntar det på godkännande. Om du har blivit godkänd behöver du aktivera annonseringen under dina inställningar.
            </p>
            <button onClick={() => router.push("/dashboard/installningar")} className="btn-primary" style={{ display: "inline-block" }}>Gå till inställningar</button>
          </div>
        ) : (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          
          <section>
            <h3 style={{ borderBottom: "1px solid var(--color-border)", paddingBottom: "0.5rem", marginBottom: "1rem" }}>Grundläggande Info</h3>
            <div className="grid-2-col">
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Jobbtitel *</label>
                <input type="text" className="input-field" value={title} onChange={e => setTitle(e.target.value)} required placeholder="t.ex. Kundtjänstmedarbetare" />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Bransch *</label>
                <input type="text" className="input-field" value={industry} onChange={e => setIndustry(e.target.value)} required placeholder="t.ex. IT, Försäljning" />
              </div>
            </div>
          </section>

          <section>
            <h3 style={{ borderBottom: "1px solid var(--color-border)", paddingBottom: "0.5rem", marginBottom: "1rem" }}>Om Tjänsten</h3>
            <div className="grid-2-col" style={{ marginBottom: "1rem" }}>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Plats *</label>
                <input type="text" className="input-field" value={location} onChange={e => setLocation(e.target.value)} required placeholder="Ort eller Distans" />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Sista ansökningsdag *</label>
                <input type="date" className="input-field" value={deadline} onChange={e => setDeadline(e.target.value)} required />
              </div>
            </div>
            <div className="grid-2-col">
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Omfattning *</label>
                <select className="input-field" value={scope} onChange={e => setScope(e.target.value)} required>
                  <option value="Heltid">Heltid</option>
                  <option value="Deltid">Deltid</option>
                  <option value="Extrajobb">Extrajobb</option>
                  <option value="Projekt">Projekt</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Varaktighet *</label>
                <select className="input-field" value={duration} onChange={e => setDuration(e.target.value)} required>
                  <option value="Tillsvidare">Tillsvidare (Fast)</option>
                  <option value="Vikariat">Vikariat</option>
                  <option value="Visstid">Visstid</option>
                  <option value="Provanställning">Provanställning</option>
                </select>
              </div>
            </div>
          </section>

          <section>
            <h3 style={{ borderBottom: "1px solid var(--color-border)", paddingBottom: "0.5rem", marginBottom: "1rem" }}>Beskrivning och Krav</h3>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Om jobbet *</label>
              <textarea className="input-field" rows={5} value={description} onChange={e => setDescription(e.target.value)} required placeholder="Beskriv arbetsuppgifterna och arbetsplatsen..."></textarea>
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Ska-krav *</label>
              <textarea className="input-field" rows={3} value={requirements} onChange={e => setRequirements(e.target.value)} required placeholder="Måste-krav (t.ex. körkort, specifika språk)..."></textarea>
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Meriterande (Frivilligt)</label>
              <textarea className="input-field" rows={3} value={merits} onChange={e => setMerits(e.target.value)} placeholder="Vad är ett plus i kanten?"></textarea>
            </div>
          </section>

          <section>
            <h3 style={{ borderBottom: "1px solid var(--color-border)", paddingBottom: "0.5rem", marginBottom: "1rem" }}>Ansökan & Kontakt</h3>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Extern ansökningslänk (Frivilligt)</label>
              <input type="url" className="input-field" value={applyUrl} onChange={e => setApplyUrl(e.target.value)} placeholder="https://..." />
              <small style={{ color: "var(--color-text-secondary)" }}>Om du fyller i denna kommer användarna tas till din externa sida för att ansöka. Lämnas blankt tar de emot ansökningar i din inkorg här på sidan.</small>
            </div>
            <div className="grid-2-col">
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Kontaktperson (Frivilligt)</label>
                <input type="text" className="input-field" value={contactPerson} onChange={e => setContactPerson(e.target.value)} />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Kontakt e-post (Frivilligt)</label>
                <input type="email" className="input-field" value={contactEmail} onChange={e => setContactEmail(e.target.value)} />
              </div>
            </div>
          </section>

          <button type="submit" disabled={loading} className="btn-primary" style={{ padding: "1rem", fontSize: "1.1rem" }}>
            {loading ? "Publicerar..." : "Publicera Jobbannons"}
          </button>
        </form>
        )}
      </div>
    </div>
  );
}
