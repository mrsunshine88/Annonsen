"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ContactSellerForm({ adId, receiverId, loggedInUserId }: { adId: string, receiverId: string, loggedInUserId?: string }) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const [showModal, setShowModal] = useState(false);

  if (!loggedInUserId) {
    return (
      <div style={{ textAlign: "center", marginTop: "1rem" }}>
        <p style={{ fontSize: "0.9rem", color: "var(--color-text-secondary)" }}>Logga in för att kontakta säljaren</p>
        <button onClick={() => router.push(`/login?callbackUrl=/annons/${adId}`)} className="btn-primary" style={{ width: "100%", marginTop: "0.5rem" }}>
          Logga in
        </button>
      </div>
    );
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setStatus("sending");
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adId, receiverId, content })
      });

      if (res.ok) {
        setStatus("success");
        setTimeout(() => {
          setShowModal(false);
          router.push(`/dashboard/meddelanden`);
        }, 1500);
      } else {
        setStatus("error");
      }
    } catch (error) {
      setStatus("error");
    }
  };

  return (
    <button 
      onClick={() => router.push(`/dashboard/meddelanden?newChat=true&adId=${adId}`)} 
      className="btn-primary" 
      style={{ width: "100%", marginTop: "1rem", padding: "0.8rem", fontSize: "1.1rem" }}
    >
      Skicka meddelande
    </button>
  );
}
