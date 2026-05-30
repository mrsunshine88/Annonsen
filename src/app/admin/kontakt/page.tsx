"use client";

import { useState, useEffect } from "react";
import { useNotification } from "@/components/NotificationProvider";

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  isRead: boolean;
  createdAt: string;
};

export default function AdminContactPage() {
  const { showNotification } = useNotification();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    try {
      const res = await fetch("/api/admin/contact");
      if (!res.ok) throw new Error("Kunde inte hämta meddelanden");
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error(err);
      showNotification("Kunde inte ladda meddelanden", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const toggleReadStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/admin/contact", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isRead: !currentStatus })
      });
      if (!res.ok) throw new Error("Kunde inte uppdatera status");
      
      setMessages(messages.map(msg => 
        msg.id === id ? { ...msg, isRead: !currentStatus } : msg
      ));
    } catch (err) {
      console.error(err);
      showNotification("Ett fel uppstod", "error");
    }
  };

  if (loading) {
    return <div style={{ padding: "2rem" }}>Laddar...</div>;
  }

  return (
    <div style={{ padding: "1rem" }}>
      <h1 style={{ marginBottom: "2rem", color: "var(--color-primary)" }}>Kundtjänst & Kontakt</h1>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {messages.length === 0 ? (
          <p className="glass-panel" style={{ padding: "2rem", textAlign: "center" }}>Inga meddelanden ännu.</p>
        ) : (
          messages.map(msg => (
            <div key={msg.id} className="glass-panel" style={{ 
              padding: "1.5rem", 
              borderLeft: msg.isRead ? "4px solid transparent" : "4px solid var(--color-primary)",
              opacity: msg.isRead ? 0.7 : 1
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap", marginBottom: "1rem" }}>
                <div>
                  <h3 style={{ margin: "0 0 0.5rem 0" }}>{msg.name}</h3>
                  <div style={{ fontSize: "0.9rem", color: "var(--color-text-secondary)", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                    <span>✉️ <a href={`mailto:${msg.email}`} style={{ color: "inherit" }}>{msg.email}</a></span>
                    {msg.phone && <span>📞 <a href={`tel:${msg.phone}`} style={{ color: "inherit" }}>{msg.phone}</a></span>}
                    <span>🕒 {new Date(msg.createdAt).toLocaleString("sv-SE")}</span>
                  </div>
                </div>
                <button 
                  onClick={() => toggleReadStatus(msg.id, msg.isRead)}
                  className={msg.isRead ? "secondary-btn" : "primary-btn"}
                  style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}
                >
                  {msg.isRead ? "Markera som oläst" : "Markera som läst"}
                </button>
              </div>

              <div style={{ padding: "1rem", backgroundColor: "var(--color-bg)", borderRadius: "8px", border: "1px solid var(--color-border)", whiteSpace: "pre-wrap" }}>
                {msg.message}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
