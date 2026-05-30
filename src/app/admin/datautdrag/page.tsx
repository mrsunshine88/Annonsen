"use client";

import { useState, useEffect } from "react";
import { useNotification } from "@/components/NotificationProvider";

export default function DatautdragPage() {
  const { showNotification } = useNotification();
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(true);
  
  const [loadingExtract, setLoadingExtract] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);

  // Hämta alla användare vid laddning
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/admin/users");
        if (!res.ok) throw new Error("Kunde inte hämta användare");
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error(err);
        showNotification("Gick inte att ladda användarlistan", "error");
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  const handleExtract = async (email: string) => {
    setLoadingExtract(email);
    setUserData(null);
    try {
      const res = await fetch(`/api/admin/extract?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Kunde inte hämta utdrag");
      
      setUserData(data.data);
      showNotification("Utdrag hämtat", "success");
      
      // Scrolla ner smidigt till resultatet
      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }, 100);
      
    } catch (err: any) {
      console.error(err);
      showNotification(err.message, "error");
    } finally {
      setLoadingExtract(null);
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

  const filteredUsers = users.filter(u => 
    (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div style={{ padding: "1rem" }}>
      <h1 style={{ marginBottom: "0.5rem", color: "var(--color-primary)" }}>Polis- & Datautdrag</h1>
      <p style={{ color: "var(--color-text-secondary)", marginBottom: "2rem" }}>
        Sök efter en användare och klicka på "Hämta utdrag" för att få ut en komplett logg över deras aktivitet och raderade meddelanden.
      </p>

      {/* Sökfältet */}
      <div className="glass-panel" style={{ padding: "1.5rem", marginBottom: "2rem" }}>
        <label style={{ fontWeight: 600, display: "block", marginBottom: "0.5rem" }}>Filtrera användare (Namn eller E-post)</label>
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", opacity: 0.5 }}>🔍</span>
          <input 
            type="text" 
            className="input-field" 
            placeholder="Sök..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: "2.5rem" }}
          />
        </div>
      </div>

      {/* Användarlistan */}
      <div className="glass-panel" style={{ padding: "0", marginBottom: "2rem", overflow: "hidden" }}>
        {loadingUsers ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "var(--color-text-secondary)" }}>Laddar användare...</div>
        ) : filteredUsers.length === 0 ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "var(--color-text-secondary)" }}>Inga användare hittades.</div>
        ) : (
          <div style={{ maxHeight: "400px", overflowY: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ backgroundColor: "var(--color-bg-subtle)", position: "sticky", top: 0, zIndex: 10 }}>
                <tr>
                  <th style={{ padding: "1rem", textAlign: "left", borderBottom: "1px solid var(--color-border)" }}>Användare</th>
                  <th style={{ padding: "1rem", textAlign: "left", borderBottom: "1px solid var(--color-border)" }}>Typ</th>
                  <th style={{ padding: "1rem", textAlign: "right", borderBottom: "1px solid var(--color-border)" }}>Åtgärd</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id} style={{ borderBottom: "1px solid var(--color-border)", transition: "background-color 0.2s" }} className="chat-list-item">
                    <td style={{ padding: "1rem" }}>
                      <div style={{ fontWeight: 600 }}>{user.name || "Inget namn"}</div>
                      <div style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)" }}>{user.email}</div>
                    </td>
                    <td style={{ padding: "1rem" }}>
                      <span style={{ padding: "0.2rem 0.6rem", borderRadius: "100px", backgroundColor: "var(--color-bg-subtle)", fontSize: "0.85rem" }}>
                        {user.accountType}
                      </span>
                    </td>
                    <td style={{ padding: "1rem", textAlign: "right" }}>
                      <button 
                        onClick={() => handleExtract(user.email)} 
                        className="btn-primary"
                        disabled={loadingExtract === user.email}
                        style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}
                      >
                        {loadingExtract === user.email ? "Hämtar..." : "Hämta utdrag"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Resultatet av utdraget */}
      {userData && (
        <div className="glass-panel animate-fade-in" style={{ padding: "2rem", border: "2px solid var(--color-primary)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <h2 style={{ margin: "0 0 0.5rem 0", color: "var(--color-primary)" }}>Utdrag för: {userData.email}</h2>
              <p style={{ margin: 0, color: "var(--color-text-secondary)" }}>
                <strong>ID:</strong> {userData.id} <br/>
                <strong>Konto:</strong> {userData.accountType} <br/>
                <strong>Medlem sedan:</strong> {new Date(userData.createdAt).toLocaleDateString("sv-SE")}
              </p>
            </div>
            <button onClick={handleDownload} className="btn-secondary" style={{ backgroundColor: "var(--color-bg-surface)" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "0.5rem" }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              Ladda ner som JSON (För polis)
            </button>
          </div>

          <div className="grid-2-col">
            {/* Skickade meddelanden */}
            <div style={{ backgroundColor: "var(--color-bg-subtle)", padding: "1.5rem", borderRadius: "12px" }}>
              <h3 style={{ borderBottom: "1px solid var(--color-border)", paddingBottom: "0.5rem", marginBottom: "1rem", color: "var(--color-text)" }}>
                Skickade meddelanden ({userData.sentMessages.length})
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {userData.sentMessages.map((msg: any) => (
                  <div key={msg.id} style={{ 
                    padding: "1rem", 
                    backgroundColor: "var(--color-bg-surface)", 
                    borderRadius: "8px", 
                    border: "1px solid var(--color-border)",
                    boxShadow: "var(--shadow-sm)"
                  }}>
                    <div style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)", marginBottom: "0.5rem", paddingBottom: "0.5rem", borderBottom: "1px solid var(--color-bg-subtle)" }}>
                      <strong>Mottagare:</strong> {msg.receiver.email} <br/>
                      <strong>Datum:</strong> {new Date(msg.createdAt).toLocaleString("sv-SE")}
                      {msg.deletedBySender && <div style={{ color: "var(--color-error)", marginTop: "0.2rem", fontWeight: "bold" }}>⚠️ Dolt för avsändaren (Raderat)</div>}
                    </div>
                    <div style={{ whiteSpace: "pre-wrap" }}>{msg.content}</div>
                  </div>
                ))}
                {userData.sentMessages.length === 0 && <p style={{ color: "var(--color-text-secondary)" }}>Inga skickade meddelanden.</p>}
              </div>
            </div>

            {/* Mottagna meddelanden */}
            <div style={{ backgroundColor: "var(--color-bg-subtle)", padding: "1.5rem", borderRadius: "12px" }}>
              <h3 style={{ borderBottom: "1px solid var(--color-border)", paddingBottom: "0.5rem", marginBottom: "1rem", color: "var(--color-text)" }}>
                Mottagna meddelanden ({userData.receivedMessages.length})
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {userData.receivedMessages.map((msg: any) => (
                  <div key={msg.id} style={{ 
                    padding: "1rem", 
                    backgroundColor: "var(--color-bg-surface)", 
                    borderRadius: "8px", 
                    border: "1px solid var(--color-border)",
                    boxShadow: "var(--shadow-sm)"
                  }}>
                    <div style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)", marginBottom: "0.5rem", paddingBottom: "0.5rem", borderBottom: "1px solid var(--color-bg-subtle)" }}>
                      <strong>Avsändare:</strong> {msg.sender.email} <br/>
                      <strong>Datum:</strong> {new Date(msg.createdAt).toLocaleString("sv-SE")}
                      {msg.deletedByReceiver && <div style={{ color: "var(--color-error)", marginTop: "0.2rem", fontWeight: "bold" }}>⚠️ Dolt för mottagaren (Raderat)</div>}
                    </div>
                    <div style={{ whiteSpace: "pre-wrap" }}>{msg.content}</div>
                  </div>
                ))}
                {userData.receivedMessages.length === 0 && <p style={{ color: "var(--color-text-secondary)" }}>Inga mottagna meddelanden.</p>}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
