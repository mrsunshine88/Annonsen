"use client";

import { useState, useEffect } from "react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleStatus = async (userId: string, action: string, value: boolean) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action, value })
      });
      if (res.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm("Är du helt säker på att du vill radera denna användare och ALLA dess annonser?")) return;
    try {
      const res = await fetch(`/api/admin/users?userId=${userId}`, { method: "DELETE" });
      if (res.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <p>Laddar konton...</p>;

  const filteredUsers = users.filter(user => 
    (user.name && user.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div>
      <h1 style={{ marginBottom: "2rem", color: "var(--color-primary)" }}>Hantera Konton</h1>
      
      <div style={{ marginBottom: "1.5rem" }}>
        <input 
          type="text" 
          placeholder="Sök på namn eller e-post..." 
          className="input-field" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ maxWidth: "400px" }}
        />
      </div>

      <div className="glass-panel" style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--color-border)", textAlign: "left" }}>
              <th style={{ padding: "1rem" }}>Användare</th>
              <th style={{ padding: "1rem" }}>Annonser</th>
              <th style={{ padding: "1rem" }}>Registrerad</th>
              <th style={{ padding: "1rem" }}>Status</th>
              <th style={{ padding: "1rem", textAlign: "right" }}>Åtgärder</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                <td style={{ padding: "1rem" }}>
                  <strong>{user.name || "Inget namn"}</strong>
                  <div style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)" }}>{user.email}</div>
                  {user.isAdmin && <span style={{ fontSize: "0.75rem", background: "var(--color-primary)", color: "white", padding: "0.1rem 0.4rem", borderRadius: "var(--radius-sm)", marginTop: "0.25rem", display: "inline-block" }}>Admin</span>}
                  
                  {(user.accountType === "Företag" || user.accountType === "Arbetsgivare") && (
                    <div style={{ marginTop: "0.5rem", fontSize: "0.8rem", background: "var(--color-bg-subtle)", padding: "0.5rem", borderRadius: "var(--radius-sm)" }}>
                      <strong>Konto:</strong> <span style={{ color: "var(--color-primary)" }}>{user.accountType}</span><br />
                      <strong>Företag:</strong> {user.companyName || "-"}<br />
                      <strong>Företagssida:</strong> {user.companyPageApproved ? <span style={{color: 'var(--color-success)', fontWeight: 'bold'}}>Godkänd</span> : <span style={{color: 'var(--color-error)', fontWeight: 'bold'}}>Väntar</span>}<br />
                      <strong>Annonsering:</strong> {user.canPublishAds ? <span style={{color: 'var(--color-success)', fontWeight: 'bold'}}>Godkänd</span> : <span style={{color: 'var(--color-error)', fontWeight: 'bold'}}>Väntar</span>}
                    </div>
                  )}
                </td>
                <td style={{ padding: "1rem" }}>{user._count.ads}</td>
                <td style={{ padding: "1rem" }}>{new Date(user.createdAt).toLocaleDateString("sv-SE")}</td>
                <td style={{ padding: "1rem" }}>
                  {user.isBlocked ? (
                    <span style={{ color: "var(--color-error)", fontWeight: 600 }}>Blockerad</span>
                  ) : (
                    <span style={{ color: "var(--color-success)" }}>Aktiv</span>
                  )}
                </td>
                <td style={{ padding: "1rem", textAlign: "right", display: "flex", gap: "0.5rem", justifyContent: "flex-end", flexWrap: "wrap", minWidth: "300px" }}>
                  {user.isRoot || user.email === 'apersson508@gmail.com' ? (
                    <span style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)", fontStyle: "italic", padding: "0.4rem 0.8rem", display: "inline-block", background: "var(--color-bg-subtle)", borderRadius: "var(--radius-md)" }}>
                      Root-konto (Skyddat)
                    </span>
                  ) : (
                    <>
                      <button 
                        onClick={() => toggleStatus(user.id, "toggleBlock", !user.isBlocked)}
                        className="btn-secondary"
                        style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}
                      >
                        {user.isBlocked ? "Avblockera" : "Blockera"}
                      </button>
                      <button 
                        onClick={() => toggleStatus(user.id, "toggleAdmin", !user.isAdmin)}
                        className="btn-secondary"
                        style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}
                      >
                        {user.isAdmin ? "Ta bort Admin" : "Gör till Admin"}
                      </button>

                      {(user.accountType === "Företag" || user.accountType === "Arbetsgivare") && (
                        <>
                          <button 
                            onClick={() => toggleStatus(user.id, "toggleCompanyPage", !user.companyPageApproved)}
                            className="btn-secondary"
                            style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}
                          >
                            {user.companyPageApproved ? "Dölj Företagssida" : "Godkänn Företagssida"}
                          </button>
                          <button 
                            onClick={() => toggleStatus(user.id, "togglePublishAds", !user.canPublishAds)}
                            className="btn-secondary"
                            style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}
                          >
                            {user.canPublishAds ? "Stoppa Annonsering" : "Godkänn Annonsering"}
                          </button>
                        </>
                      )}

                      <button 
                        onClick={() => deleteUser(user.id)}
                        className="btn-primary"
                        style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem", background: "var(--color-error)" }}
                      >
                        Radera
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: "var(--color-text-secondary)" }}>
                  Inga konton hittades.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
