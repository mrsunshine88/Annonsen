"use client";

import { useState } from "react";
import Link from "next/link";
import { useNotification } from "@/components/NotificationProvider";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { showNotification } = useNotification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (res.ok) {
        setSubmitted(true);
      } else {
        showNotification(data.error || "Något gick fel.", "error");
      }
    } catch (err) {
      showNotification("Nätverksfel", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "4rem auto", padding: "2rem" }} className="glass-panel">
      <h1 style={{ marginBottom: "1rem", color: "var(--color-primary)" }}>Glömt lösenord</h1>
      
      {submitted ? (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✉️</div>
          <p style={{ color: "var(--color-text-secondary)", marginBottom: "2rem" }}>
            Om din e-postadress finns registrerad hos oss har vi skickat instruktioner för att återställa ditt lösenord.
          </p>
          <Link href="/login" style={{ color: "var(--color-primary)", fontWeight: "bold" }}>
            Tillbaka till inloggning
          </Link>
        </div>
      ) : (
        <>
          <p style={{ color: "var(--color-text-secondary)", marginBottom: "2rem" }}>
            Fyll i din e-postadress så skickar vi en länk för att återställa ditt lösenord.
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div className="form-group">
              <label>E-postadress</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="namn@exempel.se"
              />
            </div>
            
            <button type="submit" disabled={loading} className="btn-primary" style={{ padding: "0.8rem", marginTop: "1rem" }}>
              {loading ? "Skickar..." : "Återställ lösenord"}
            </button>
          </form>

          <div style={{ marginTop: "2rem", textAlign: "center", fontSize: "0.9rem" }}>
            <Link href="/login" style={{ color: "var(--color-text-secondary)" }}>
              Avbryt och återvänd till inloggning
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
