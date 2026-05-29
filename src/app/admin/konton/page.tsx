"use client";

import { useState, useEffect } from "react";
import { useNotification } from "@/components/NotificationProvider";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"privat" | "foretag">("privat");
  const { showConfirm } = useNotification();

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
    const confirmed = await showConfirm({ message: "Är du helt säker på att du vill radera denna användare och ALLA dess annonser?" });
    if (!confirmed) return;
    try {
      const res = await fetch(`/api/admin/users?userId=${userId}`, { method: "DELETE" });
      if (res.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div style={{ padding: "4rem", textAlign: "center" }}>Laddar konton...</div>;

  const filteredUsers = users.filter(user => 
    (user.name && user.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const privatUsers = filteredUsers.filter(u => u.accountType === "Privat" || !u.accountType);
  const foretagUsers = filteredUsers.filter(u => u.accountType === "Företag" || u.accountType === "Arbetsgivare");

  const currentList = activeTab === "privat" ? privatUsers : foretagUsers;

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "1.5rem", color: "var(--color-primary)" }}>Hantera Konton</h1>
      
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", marginBottom: "2rem" }}>
        <input 
          type="text" 
          placeholder="Sök på namn eller e-post..." 
          className="input-field" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ maxWidth: "400px" }}
        />

        <div style={{ display: "flex", gap: "1rem", borderBottom: "2px solid var(--color-border)", overflowX: "auto" }}>
          <button 
            onClick={() => setActiveTab("privat")}
            style={{ 
              padding: "0.75rem 1.5rem", 
              background: "none", 
              border: "none", 
              borderBottom: activeTab === "privat" ? "3px solid var(--color-primary)" : "3px solid transparent",
              fontWeight: activeTab === "privat" ? 700 : 500,
              color: activeTab === "privat" ? "var(--color-primary)" : "var(--color-text-secondary)",
              cursor: "pointer",
              fontSize: "1.05rem",
              whiteSpace: "nowrap"
            }}
          >
            Privatpersoner ({privatUsers.length})
          </button>
          <button 
            onClick={() => setActiveTab("foretag")}
            style={{ 
              padding: "0.75rem 1.5rem", 
              background: "none", 
              border: "none", 
              borderBottom: activeTab === "foretag" ? "3px solid var(--color-primary)" : "3px solid transparent",
              fontWeight: activeTab === "foretag" ? 700 : 500,
              color: activeTab === "foretag" ? "var(--color-primary)" : "var(--color-text-secondary)",
              cursor: "pointer",
              fontSize: "1.05rem",
              whiteSpace: "nowrap"
            }}
          >
            Företag / Arbetsgivare ({foretagUsers.length})
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {currentList.length === 0 ? (
          <div className="glass-panel" style={{ padding: "3rem", textAlign: "center", color: "var(--color-text-secondary)" }}>
            Inga konton hittades.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {/* Header för Desktop */}
            <div className="admin-table-header" style={{ display: "none", gridTemplateColumns: activeTab === "foretag" ? "2fr 1.5fr 1fr 2fr" : "2fr 1fr 2fr", gap: "1rem", padding: "0 1.5rem", color: "var(--color-text-secondary)", fontSize: "0.9rem", fontWeight: 600 }}>
              <div>Användare</div>
              {activeTab === "foretag" && <div>Företagsinfo</div>}
              <div>Status</div>
              <div style={{ textAlign: "right" }}>Åtgärder</div>
            </div>

            {currentList.map(user => (
              <div key={user.id} className="admin-user-card glass-panel" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1rem", alignItems: "center" }} className={`admin-user-grid ${activeTab === "foretag" ? "is-foretag" : "is-privat"}`}>
                  
                  {/* Column 1: User Info */}
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div style={{ width: "45px", height: "45px", borderRadius: "50%", background: "var(--color-primary)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", fontWeight: "bold", flexShrink: 0 }}>
                      {user.name ? user.name.charAt(0).toUpperCase() : "?"}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                        {user.name || "Inget namn"}
                        {user.isAdmin && <span style={{ fontSize: "0.7rem", background: "var(--color-primary)", color: "white", padding: "0.1rem 0.4rem", borderRadius: "4px" }}>Admin</span>}
                        {user.isRoot && <span style={{ fontSize: "0.7rem", background: "var(--color-text)", color: "var(--color-bg)", padding: "0.1rem 0.4rem", borderRadius: "4px" }}>Root</span>}
                      </div>
                      <div style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)", wordBreak: "break-all" }}>{user.email}</div>
                      <div style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", marginTop: "0.2rem" }}>
                        Annonser: {user._count.ads} st
                      </div>
                    </div>
                  </div>

                  {/* Column 2: Företagsinfo (Only for Företag) */}
                  {activeTab === "foretag" && (
                    <div style={{ fontSize: "0.85rem", padding: "0.5rem 0", borderTop: "1px solid var(--color-border)", borderBottom: "1px solid var(--color-border)" }} className="admin-company-col">
                      <div style={{ marginBottom: "0.4rem" }}><strong>{user.companyName || "Ej angivet"}</strong> ({user.accountType})</div>
                      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                        <div>Sida: {user.companyPageApproved ? <span style={{color: 'var(--color-success)', fontWeight: 600}}>Godkänd</span> : <span style={{color: 'var(--color-error)', fontWeight: 600}}>Väntar</span>}</div>
                        <div>Annonsera: {user.canPublishAds ? <span style={{color: 'var(--color-success)', fontWeight: 600}}>Godkänd</span> : <span style={{color: 'var(--color-error)', fontWeight: 600}}>Väntar</span>}</div>
                      </div>
                    </div>
                  )}

                  {/* Column 3: Status */}
                  <div style={{ display: "flex", alignItems: "center" }}>
                    {user.isBlocked ? (
                      <span style={{ background: "rgba(239, 68, 68, 0.1)", color: "var(--color-error)", padding: "0.3rem 0.8rem", borderRadius: "100px", fontSize: "0.8rem", fontWeight: 600 }}>Blockerad</span>
                    ) : (
                      <span style={{ background: "rgba(34, 197, 94, 0.1)", color: "var(--color-success)", padding: "0.3rem 0.8rem", borderRadius: "100px", fontSize: "0.8rem", fontWeight: 600 }}>Aktiv</span>
                    )}
                  </div>

                  {/* Column 4: Actions */}
                  <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", flexWrap: "wrap" }} className="admin-actions-col">
                    {user.isRoot || user.email === 'apersson508@gmail.com' ? (
                      <span style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", fontStyle: "italic" }}>Skyddad</span>
                    ) : (
                      <>
                        <button 
                          onClick={() => toggleStatus(user.id, "toggleBlock", !user.isBlocked)}
                          className="btn-secondary"
                          style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem", flex: "1 1 auto", textAlign: "center" }}
                        >
                          {user.isBlocked ? "Avblockera" : "Blockera"}
                        </button>
                        
                        <button 
                          onClick={() => toggleStatus(user.id, "toggleAdmin", !user.isAdmin)}
                          className="btn-secondary"
                          style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem", flex: "1 1 auto", textAlign: "center" }}
                        >
                          {user.isAdmin ? "- Admin" : "+ Admin"}
                        </button>

                        {activeTab === "foretag" && (
                          <>
                            <button 
                              onClick={() => toggleStatus(user.id, "toggleCompanyPage", !user.companyPageApproved)}
                              className="btn-secondary"
                              style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem", flex: "1 1 auto", textAlign: "center", borderColor: user.companyPageApproved ? "var(--color-success)" : "var(--color-border)", color: user.companyPageApproved ? "var(--color-success)" : "inherit" }}
                            >
                              {user.companyPageApproved ? "Dölj Sida" : "Godkänn Sida"}
                            </button>
                            <button 
                              onClick={() => toggleStatus(user.id, "togglePublishAds", !user.canPublishAds)}
                              className="btn-secondary"
                              style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem", flex: "1 1 auto", textAlign: "center", borderColor: user.canPublishAds ? "var(--color-success)" : "var(--color-border)", color: user.canPublishAds ? "var(--color-success)" : "inherit" }}
                            >
                              {user.canPublishAds ? "Stoppa Annons" : "Godkänn Annons"}
                            </button>
                          </>
                        )}

                        <button 
                          onClick={() => deleteUser(user.id)}
                          className="btn-secondary"
                          style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem", flex: "1 1 auto", textAlign: "center", color: "var(--color-error)", borderColor: "rgba(239, 68, 68, 0.3)" }}
                        >
                          Radera
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx global>{`
        /* Responsive Grid for Admin Users */
        @media (min-width: 900px) {
          .admin-table-header {
            display: grid !important;
          }
          .admin-user-grid {
            grid-template-columns: 2fr 1fr 2fr !important;
            border-top: none !important;
            border-bottom: none !important;
          }
          .admin-user-grid.is-foretag {
            grid-template-columns: 2fr 1.5fr 1fr 2fr !important;
          }
          .admin-company-col {
            border: none !important;
            padding: 0 !important;
          }
          .admin-actions-col {
            justify-content: flex-end !important;
          }
          .admin-actions-col button {
            flex: 0 1 auto !important;
          }
        }
      `}</style>
    </div>
  );
}
