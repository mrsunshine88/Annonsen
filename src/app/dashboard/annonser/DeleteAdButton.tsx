"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useNotification } from "@/components/NotificationProvider";

export default function DeleteAdButton({ adId }: { adId: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const { showNotification, showConfirm } = useNotification();

  const handleDelete = async () => {
    const confirmed = await showConfirm({ message: "Är du säker på att du vill radera annonsen?" });
    if (!confirmed) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/ads?adId=${adId}`, { method: "DELETE" });
      if (res.ok) {
        showNotification("Annonsen har raderats", "success");
        router.refresh(); // Ladda om server-komponenten
      } else {
        showNotification("Ett fel uppstod när annonsen skulle raderas.", "error");
      }
    } catch (err) {
      showNotification("Kunde inte radera annonsen.", "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <button onClick={handleDelete} disabled={deleting} className="btn-secondary" style={{ color: 'var(--color-error)' }}>
      {deleting ? "Raderar..." : "Ta bort"}
    </button>
  );
}
