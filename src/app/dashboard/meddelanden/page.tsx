"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

// Initiera Supabase-klient (endast på klientsidan)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export default function MessagesPage() {
  const searchParams = useSearchParams();
  const preselectAdId = searchParams.get("adId");
  const isNewChat = searchParams.get("newChat") === "true";

  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [newChatAdData, setNewChatAdData] = useState<any>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const sessRes = await fetch("/api/auth/session");
      const sessData = await sessRes.json();
      let loggedInUser = null;
      if (sessData?.user?.id) {
        loggedInUser = sessData.user.id;
        setCurrentUser(loggedInUser);
      }

      const res = await fetch("/api/messages");
      const data = await res.json();
      setMessages(data);

      // Om vi kom hit via "Skicka Meddelande" och vill skapa en ny chatt
      if (isNewChat && preselectAdId && loggedInUser) {
        // Kontrollera om konversationen redan existerar
        const existingMsg = data.find((m: any) => m.adId === preselectAdId);
        
        if (existingMsg) {
          const otherUserId = existingMsg.senderId === loggedInUser ? existingMsg.receiverId : existingMsg.senderId;
          setSelectedChat(`${preselectAdId}_${otherUserId}`);
        } else {
          // Konversationen finns inte, hämta annonsdata
          const adRes = await fetch(`/api/ads/single?id=${preselectAdId}`);
          if (adRes.ok) {
            const adData = await adRes.json();
            setNewChatAdData(adData);
            setSelectedChat(`new_${preselectAdId}`);
          }
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    
    // Sätt upp Supabase Realtime om nycklar finns
    let channel: any;
    if (supabase) {
      channel = supabase
        .channel('public:Message')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'Message' },
          (payload) => {
            // När ett nytt meddelande skapas i databasen, hämta alla meddelanden igen
            // (Eller lägg till i state manuellt, men fetchMessages är enklast för att få med relationer)
            fetchMessages();
          }
        )
        .subscribe();
    }

    // Fallback till polling om Supabase inte är konfigurerat (eller som extra säkerhet)
    const interval = setInterval(fetchMessages, 15000);
    
    return () => {
      clearInterval(interval);
      if (channel) supabase?.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedChat]);

  if (loading) return <p>Laddar meddelanden...</p>;
  if (!currentUser) return <p>Du måste vara inloggad.</p>;

  const conversationsMap = new Map<string, { ad: any, isJob: boolean, otherUser: any, messages: any[], lastUpdated: Date }>();

  messages.forEach(msg => {
    const isSender = msg.senderId === currentUser;
    const otherUser = isSender ? msg.receiver : msg.sender;
    const isJob = msg.isJobMessage;
    const adObj = isJob ? msg.jobAd : msg.ad;
    
    // Om annonsen har raderats kan adObj vara null
    if (!adObj) return;

    const key = `${isJob ? 'job_' : 'ad_'}${adObj.id}_${otherUser.id}`;

    if (!conversationsMap.has(key)) {
      conversationsMap.set(key, {
        ad: adObj,
        isJob,
        otherUser: otherUser,
        messages: [],
        lastUpdated: new Date(msg.createdAt)
      });
    }
    
    const conv = conversationsMap.get(key)!;
    conv.messages.push(msg);
    if (new Date(msg.createdAt) > conv.lastUpdated) {
      conv.lastUpdated = new Date(msg.createdAt);
    }
  });

  // Lägg till den temporära nya chatten i mapen om vi har den
  if (newChatAdData && selectedChat === `new_${preselectAdId}`) {
    const seller = newChatAdData.author;
    conversationsMap.set(`new_${preselectAdId}`, {
      ad: newChatAdData,
      otherUser: { ...seller, name: seller.accountType === "Företag" ? seller.companyName : seller.name },
      messages: [],
      lastUpdated: new Date()
    });
  }

  const conversations = Array.from(conversationsMap.entries())
    .sort((a, b) => b[1].lastUpdated.getTime() - a[1].lastUpdated.getTime());

  const activeChatData = selectedChat ? conversationsMap.get(selectedChat) : null;

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || !activeChatData) return;

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adId: activeChatData.isJob ? null : activeChatData.ad.id,
          jobAdId: activeChatData.isJob ? activeChatData.ad.id : null,
          isJobMessage: activeChatData.isJob,
          receiverId: activeChatData.otherUser.id,
          content: replyContent
        })
      });
      if (res.ok) {
        setReplyContent("");
        // Efter första meddelandet i en ny chatt byter vi till den riktiga chatt-nyckeln
        if (selectedChat === `new_${preselectAdId}`) {
          setSelectedChat(`${activeChatData.ad.id}_${activeChatData.otherUser.id}`);
          setNewChatAdData(null);
        }
        fetchMessages();
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="meddelanden-wrapper" style={{ display: "flex", gap: "2rem", height: "75vh" }}>
      {/* Vänsterspalt: Konversationer */}
      <aside className="glass-panel meddelanden-sidebar" style={{ width: "300px", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <h3 style={{ padding: "1.5rem", margin: 0, borderBottom: "1px solid var(--color-border)" }}>Inkorg</h3>
        <div style={{ overflowY: "auto", flex: 1 }}>
          {conversations.length === 0 ? (
            <p style={{ padding: "1.5rem", color: "var(--color-text-secondary)", fontSize: "0.9rem" }}>Inga meddelanden ännu.</p>
          ) : (
            conversations.map(([key, conv]) => (
              <div 
                key={key} 
                onClick={() => setSelectedChat(key)}
                className="chat-list-item"
                style={{ 
                  padding: "1rem", 
                  borderBottom: "2px solid var(--color-text-muted)",
                  borderLeft: selectedChat === key ? "4px solid var(--color-primary)" : "4px solid transparent",
                  cursor: "pointer",
                  backgroundColor: selectedChat === key ? "rgba(59, 130, 246, 0.05)" : "var(--color-bg-surface)",
                  transition: "all 0.2s"
                }}
              >
                <div style={{ fontWeight: 600, fontSize: "0.95rem", marginBottom: "0.25rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  {conv.isJob && <span style={{ backgroundColor: "var(--color-primary)", color: "white", padding: "0.1rem 0.4rem", borderRadius: "var(--radius-sm)", fontSize: "0.7rem", fontWeight: "bold" }}>JOBB</span>}
                  {conv.ad.title}
                </div>
                <div style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)", display: "flex", justifyContent: "space-between" }}>
                  <span>{conv.otherUser.name || "Anonym"}</span>
                  <span>{conv.lastUpdated.toLocaleDateString("sv-SE")}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Högerspalt: Aktiv Chatt */}
      <main className="glass-panel" style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {activeChatData ? (
          <>
            {/* Header */}
            <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--color-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <h3 style={{ margin: "0 0 0.25rem 0" }}>{activeChatData.otherUser.name || "Anonym"}</h3>
                  {activeChatData.isJob && <span style={{ backgroundColor: "var(--color-primary)", color: "white", padding: "0.1rem 0.4rem", borderRadius: "var(--radius-sm)", fontSize: "0.75rem", fontWeight: "bold" }}>JOBB</span>}
                </div>
                <div style={{ fontSize: "0.9rem", color: "var(--color-text-secondary)" }}>
                  Gällande: <Link href={activeChatData.isJob ? `/jobb/${activeChatData.ad.id}` : `/annons/${activeChatData.ad.id}`} style={{ color: "var(--color-primary)" }}>{activeChatData.ad.title}</Link>
                </div>
              </div>
            </div>

            {/* Meddelanden */}
            <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
              {activeChatData.messages.map((msg: any) => {
                const isMe = msg.senderId === currentUser;
                return (
                  <div key={msg.id} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start" }}>
                    <div style={{ 
                      maxWidth: "70%", 
                      padding: "0.75rem 1rem", 
                      borderRadius: isMe ? "var(--radius-md) var(--radius-md) 0 var(--radius-md)" : "var(--radius-md) var(--radius-md) var(--radius-md) 0",
                      backgroundColor: isMe ? "var(--color-primary)" : "var(--color-border)",
                      color: isMe ? "white" : "inherit"
                    }}>
                      <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{msg.content}</div>
                      <div style={{ fontSize: "0.7rem", marginTop: "0.5rem", textAlign: "right", opacity: 0.7 }}>
                        {new Date(msg.createdAt).toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Skrivruta */}
            <form onSubmit={sendMessage} style={{ padding: "1.5rem", borderTop: "1px solid var(--color-border)", display: "flex", gap: "1rem" }}>
              <input 
                type="text" 
                className="input-field" 
                placeholder="Skriv ett meddelande..." 
                value={replyContent}
                onChange={e => setReplyContent(e.target.value)}
                style={{ flex: 1 }}
              />
              <button type="submit" className="btn-primary">Skicka</button>
            </form>
          </>
        ) : (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-secondary)" }}>
            Välj en konversation i menyn för att visa meddelanden.
          </div>
        )}
      </main>
    </div>
  );
}
