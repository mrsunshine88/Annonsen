"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HandleApplicationButton({ applicationId, currentStatus }: { applicationId: string, currentStatus: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const isHandled = currentStatus === "Hanterad";

  const toggleStatus = async () => {
    setLoading(true);
    try {
      const newStatus = isHandled ? "Ny" : "Hanterad";
      const res = await fetch(`/api/jobb/ansokningar/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        router.refresh();
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Gick inte att uppdatera ansökan.");
      }
    } catch (error) {
      console.error(error);
      alert("Ett fel uppstod.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={toggleStatus} 
      disabled={loading}
      className="btn-secondary"
      style={{ 
        padding: '0.4rem 0.8rem', 
        fontSize: '0.85rem',
        opacity: loading ? 0.7 : 1,
        backgroundColor: isHandled ? "transparent" : undefined,
        border: isHandled ? "1px solid var(--color-border)" : undefined,
        color: isHandled ? "var(--color-text-secondary)" : undefined
      }}
    >
      {loading ? "..." : isHandled ? "Ångra (Märk som Ny)" : "Markera som hanterad"}
    </button>
  );
}
