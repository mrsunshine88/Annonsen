"use client";

import { useState } from "react";
import { useNotification } from "@/components/NotificationProvider";

export default function KontaktPage() {
  const { showNotification } = useNotification();
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      showNotification("Fyll i alla obligatoriska fält", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error("Kunde inte skicka meddelande");
      setSuccess(true);
      showNotification("Tack! Ditt meddelande har skickats.", "success");
      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch (error) {
      console.error(error);
      showNotification("Något gick fel, försök igen senare.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "2rem 1rem" }}>
      <h1 style={{ marginBottom: "1rem", color: "var(--color-primary)", textAlign: "center" }}>Kontakta Oss</h1>
      <p style={{ textAlign: "center", marginBottom: "2rem", color: "var(--color-text-secondary)" }}>
        Har du frågor, funderingar eller behöver du hjälp med något på plattformen? Fyll i formuläret nedan så återkommer vi så snart vi kan.
      </p>

      {success ? (
        <div className="glass-panel" style={{ padding: "3rem 2rem", textAlign: "center", border: "1px solid var(--color-success)" }}>
          <h2 style={{ color: "var(--color-success)", margin: "0 0 1rem 0" }}>Meddelande skickat!</h2>
          <p style={{ margin: 0 }}>Tack för att du kontaktar oss. Vi har tagit emot ditt ärende och en administratör kommer att återkoppla till dig kort.</p>
          <button onClick={() => setSuccess(false)} className="secondary-btn" style={{ marginTop: "2rem" }}>Skicka ett nytt meddelande</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label style={{ fontWeight: 500 }}>Namn *</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="Ditt fullständiga namn"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label style={{ fontWeight: 500 }}>E-post *</label>
            <input 
              type="email" 
              className="input-field" 
              placeholder="din@epost.se"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label style={{ fontWeight: 500 }}>Telefonnummer</label>
            <input 
              type="tel" 
              className="input-field" 
              placeholder="Frivilligt, om du vill bli uppringd"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label style={{ fontWeight: 500 }}>Meddelande *</label>
            <textarea 
              className="input-field" 
              placeholder="Hur kan vi hjälpa dig?"
              rows={5}
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              required
              style={{ resize: "vertical" }}
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: "1rem" }}>
            {loading ? "Skickar..." : "Skicka meddelande"}
          </button>
        </form>
      )}
    </div>
  );
}
