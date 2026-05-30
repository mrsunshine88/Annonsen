"use client";

import { useState } from "react";
import { useNotification } from "@/components/NotificationProvider";

export default function DatautdragPage() {
  const { showNotification } = useNotification();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setUserData(null);
    try {
      const res = await fetch(`/api/admin/extract?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Kunde inte hämta utdrag");
      
      setUserData(data.data);
      showNotification("Utdrag hämtat", "success");
    } catch (err: any) {
      console.error(err);
      showNotification(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!userData) return;
    const blob = new Blob([JSON.stringify(userData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `datautdrag_${userData.email}_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h1 style={{ marginBottom: "0.5rem", color: "var(--color-primary)" }}>Polis- & Datautdrag</h1>
      <p style={{ color: "var(--color-text-secondary)", marginBottom: "2rem" }}>
        Sök på en användares e-post för att se hela deras aktivitet. Meddelanden märkta som "raderade" visas här, men är dolda för användarna.
      </p>

      <form onSubmit={handleSearch} className="glass-panel" style={{ padding: "2rem", display: "flex", gap: "1rem", alignItems: "flex-end", marginBottom: "2rem" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <label style={{ fontWeight: 500 }}>Sök Användare (E-post)</label>
          <input 
            type="email" 
            className="form-input" 
            placeholder="exempel@domän.se"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="primary-btn" disabled={loading}>
          {loading ? "Söker..." : "Hämta utdrag"}
        </button>
      </form>

      {userData && (
        <div className="glass-panel" style={{ padding: "2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <h2 style={{ margin: "0 0 0.5rem 0" }}>Resultat för: {userData.email}</h2>
              <p style={{ margin: 0, color: "var(--color-text-secondary)" }}>
                ID: {userData.id} <br/>
                Konto: {userData.accountType} <br/>
                Medlem sedan: {new Date(userData.createdAt).toLocaleDateString("sv-SE")}
              </p>
            </div>
            <button onClick={handleDownload} className="secondary-btn">
              ⬇️ Ladda ner som JSON (Säker export)
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem" }}>
            
            {/* Skickade meddelanden */}
            <div>
              <h3 style={{ borderBottom: "1px solid var(--color-border)", paddingBottom: "0.5rem", marginBottom: "1rem" }}>
                Skickade ({userData.sentMessages.length})
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {userData.sentMessages.map((msg: any) => (
                  <div key={msg.id} style={{ 
                    padding: "1rem", 
                    backgroundColor: "var(--color-bg)", 
                    borderRadius: "8px", 
                    border: "1px solid var(--color-border)",
                    opacity: msg.deletedBySender ? 0.6 : 1
                  }}>
                    <div style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)", marginBottom: "0.5rem" }}>
                      Till: {msg.receiver.email} <br/>
                      {new Date(msg.createdAt).toLocaleString("sv-SE")}
                      {msg.deletedBySender && <span style={{ color: "var(--color-danger)", marginLeft: "0.5rem", fontWeight: "bold" }}>(Raderat av avsändare)</span>}
                    </div>
                    <div>{msg.content}</div>
                  </div>
                ))}
                {userData.sentMessages.length === 0 && <p>Inga skickade meddelanden.</p>}
              </div>
            </div>

            {/* Mottagna meddelanden */}
            <div>
              <h3 style={{ borderBottom: "1px solid var(--color-border)", paddingBottom: "0.5rem", marginBottom: "1rem" }}>
                Mottagna ({userData.receivedMessages.length})
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {userData.receivedMessages.map((msg: any) => (
                  <div key={msg.id} style={{ 
                    padding: "1rem", 
                    backgroundColor: "var(--color-bg)", 
                    borderRadius: "8px", 
                    border: "1px solid var(--color-border)",
                    opacity: msg.deletedByReceiver ? 0.6 : 1
                  }}>
                    <div style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)", marginBottom: "0.5rem" }}>
                      Från: {msg.sender.email} <br/>
                      {new Date(msg.createdAt).toLocaleString("sv-SE")}
                      {msg.deletedByReceiver && <span style={{ color: "var(--color-danger)", marginLeft: "0.5rem", fontWeight: "bold" }}>(Raderat av mottagare)</span>}
                    </div>
                    <div>{msg.content}</div>
                  </div>
                ))}
                {userData.receivedMessages.length === 0 && <p>Inga mottagna meddelanden.</p>}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
