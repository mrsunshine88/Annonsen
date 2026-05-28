"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteAdButton({ adId }: { adId: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Är du säker på att du vill radera annonsen?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/ads?adId=${adId}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh(); // Ladda om server-komponenten
      } else {
        alert("Ett fel uppstod när annonsen skulle raderas.");
      }
    } catch (err) {
      alert("Kunde inte radera annonsen.");
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
