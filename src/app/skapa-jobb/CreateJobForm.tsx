"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateJobForm({ settings }: { settings: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    industry: "",
    location: "",
    scope: "Heltid",
    duration: "Tillsvidare",
    description: "",
    requirements: "",
    merits: "",
    deadline: "",
    applyUrl: "",
    contactPerson: "",
    contactEmail: ""
  });

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/jobb", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Gick inte att publicera jobbannonsen");
      }

      router.push(`/jobb/${data.id}`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {error && <div style={{ color: "var(--color-error)", padding: "1rem", background: "rgba(239, 68, 68, 0.1)", borderRadius: "var(--radius-md)" }}>{error}</div>}

      <div>
        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Jobbtitel *</label>
        <input required name="title" value={formData.title} onChange={handleChange} className="input-field" placeholder="T.ex. Fullstack Utvecklare" />
      </div>

      <div className="grid-2-col">
        <div>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Bransch *</label>
          <select required name="industry" value={formData.industry} onChange={handleChange} className="input-field">
            <option value="">Välj bransch</option>
            <option value="IT & Teknik">IT & Teknik</option>
            <option value="Försäljning">Försäljning</option>
            <option value="Bygg & Anläggning">Bygg & Anläggning</option>
            <option value="Sjukvård">Sjukvård</option>
            <option value="Ekonomi">Ekonomi</option>
            <option value="Transport">Transport</option>
            <option value="Hotell & Restaurang">Hotell & Restaurang</option>
            <option value="Övrigt">Övrigt</option>
          </select>
        </div>
        <div>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Ort / Län *</label>
          <input required name="location" value={formData.location} onChange={handleChange} className="input-field" placeholder="T.ex. Stockholm eller Distans" />
        </div>
      </div>

      <div className="grid-2-col">
        <div>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Omfattning *</label>
          <select required name="scope" value={formData.scope} onChange={handleChange} className="input-field">
            <option value="Heltid">Heltid</option>
            <option value="Deltid">Deltid</option>
            <option value="Behovsanställning">Behovsanställning</option>
            <option value="Sommarjobb">Sommarjobb</option>
          </select>
        </div>
        <div>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Anställningsform *</label>
          <select required name="duration" value={formData.duration} onChange={handleChange} className="input-field">
            <option value="Tillsvidare">Tillsvidare (Fast)</option>
            <option value="Tidsbegränsad">Tidsbegränsad / Vikariat</option>
            <option value="Frilans">Frilans / Konsult</option>
            <option value="Praktik">Praktik</option>
          </select>
        </div>
      </div>

      <div>
        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Sista ansökningsdag *</label>
        <input required type="date" name="deadline" value={formData.deadline} onChange={handleChange} className="input-field" />
      </div>

      <div>
        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Arbetsbeskrivning *</label>
        <textarea required name="description" value={formData.description} onChange={handleChange} className="input-field" rows={6} placeholder="Beskriv rollen, företaget och arbetsuppgifterna..." />
      </div>

      <div>
        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Krav *</label>
        <textarea required name="requirements" value={formData.requirements} onChange={handleChange} className="input-field" rows={4} placeholder="Vad måste kandidaten kunna?" />
      </div>

      <div>
        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Meriterande (Frivilligt)</label>
        <textarea name="merits" value={formData.merits} onChange={handleChange} className="input-field" rows={3} placeholder="Vad är ett plus om de kan?" />
      </div>

      <hr style={{ borderTop: "1px solid var(--color-border)" }} />

      <div className="grid-2-col">
        <div>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Kontaktperson (Namn)</label>
          <input name="contactPerson" value={formData.contactPerson} onChange={handleChange} className="input-field" placeholder="T.ex. Anna Andersson" />
        </div>
        <div>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Kontaktperson (E-post)</label>
          <input type="email" name="contactEmail" value={formData.contactEmail} onChange={handleChange} className="input-field" placeholder="anna@företag.se" />
        </div>
      </div>

      <div>
        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Extern länk för ansökan (Frivilligt)</label>
        <input type="url" name="applyUrl" value={formData.applyUrl} onChange={handleChange} className="input-field" placeholder="https://..." />
        <p style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)", marginTop: "0.3rem" }}>
          Om du vill att kandidater ansöker på er egna hemsida, lägg in länken här.
        </p>
      </div>

      <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: "1rem", padding: "1rem", fontSize: "1.1rem" }}>
        {loading ? "Publicerar..." : "Publicera Jobbannons"}
      </button>
    </form>
  );
}
