"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setError("Fel e-post eller lösenord.");
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '65vh', position: 'relative' }}>
      <div style={{ position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)', width: '100vw', height: '80vh', background: 'radial-gradient(ellipse at top, rgba(59, 130, 246, 0.15) 0%, transparent 70%)', zIndex: -1, pointerEvents: 'none' }}></div>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '420px', padding: '3rem 2.5rem', boxShadow: 'var(--shadow-lg)' }}>
        <h1 style={{ fontSize: "2rem", textAlign: "center", marginBottom: "2rem", color: "var(--color-primary)", fontWeight: 800 }}>Logga in</h1>
        
        {error && (
          <div style={{ padding: "0.75rem", backgroundColor: "rgba(239, 68, 68, 0.1)", color: "var(--color-error)", borderRadius: "var(--radius-md)", marginBottom: "1rem", textAlign: "center" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>E-post</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field" 
              placeholder="din@epost.se" 
              required 
            />
          </div>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <label style={{ fontWeight: 500 }}>Lösenord</label>
              <a href="/glomt-losenord" style={{ color: "var(--color-primary)", fontSize: "0.85rem", textDecoration: "none" }}>Glömt lösenord?</a>
            </div>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field" 
              placeholder="••••••••" 
              required 
            />
          </div>
          <button type="submit" className="btn-primary" style={{ marginTop: "1rem", width: "100%" }}>
            Logga in
          </button>
        </form>
        
        <div style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.9rem", color: "var(--color-text-secondary)" }}>
          Har du inget konto? <a href="/register" style={{ color: "var(--color-primary)", fontWeight: 600 }}>Registrera dig här</a>
        </div>
      </div>
    </div>
  );
}
