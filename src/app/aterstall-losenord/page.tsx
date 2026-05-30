"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useNotification } from "@/components/NotificationProvider";

function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { showNotification } = useNotification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      showNotification("Säkerhetskod (token) saknas.", "error");
      return;
    }

    if (password !== confirmPassword) {
      showNotification("Lösenorden matchar inte.", "error");
      return;
    }

    if (password.length < 6) {
      showNotification("Lösenordet måste vara minst 6 tecken.", "error");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password })
      });

      const data = await res.json();

      if (res.ok) {
        showNotification("Lösenordet är uppdaterat! Logga in.", "success");
        router.push("/login");
      } else {
        showNotification(data.error || "Något gick fel.", "error");
      }
    } catch (err) {
      showNotification("Nätverksfel", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div style={{ textAlign: "center" }}>
        <p style={{ color: "var(--color-text-secondary)", marginBottom: "2rem" }}>
          Länken är ogiltig eller saknar säkerhetskod.
        </p>
        <Link href="/glomt-losenord" className="btn-primary" style={{ padding: "0.8rem 1.5rem" }}>
          Begär ny länk
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <p style={{ color: "var(--color-text-secondary)", marginBottom: "1rem" }}>
        Välj ett nytt, starkt lösenord för ditt konto.
      </p>

      <div className="form-group">
        <label>Nytt lösenord</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Minst 6 tecken"
        />
      </div>

      <div className="form-group">
        <label>Bekräfta nytt lösenord</label>
        <input
          type="password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Minst 6 tecken"
        />
      </div>
      
      <button type="submit" disabled={loading} className="btn-primary" style={{ padding: "0.8rem", marginTop: "1rem" }}>
        {loading ? "Sparar..." : "Spara nytt lösenord"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div style={{ maxWidth: "400px", margin: "4rem auto", padding: "2rem" }} className="glass-panel">
      <h1 style={{ marginBottom: "1rem", color: "var(--color-primary)" }}>Nytt lösenord</h1>
      <Suspense fallback={<div>Laddar formulär...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
