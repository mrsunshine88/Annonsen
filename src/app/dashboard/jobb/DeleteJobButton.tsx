"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteJobButton({ jobId }: { jobId: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Är du säker på att du vill radera denna jobbannons? Detta går inte att ångra.")) {
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`/api/jobb/${jobId}`, {
        method: "DELETE"
      });

      if (res.ok) {
        router.refresh();
      } else {
        alert("Gick inte att radera jobbannonsen.");
        setDeleting(false);
      }
    } catch (err) {
      console.error(err);
      alert("Ett fel uppstod.");
      setDeleting(false);
    }
  };

  return (
    <button 
      onClick={handleDelete} 
      disabled={deleting}
      className="btn-secondary" 
      style={{ padding: "0.5rem 1rem", fontSize: "0.9rem", color: "var(--color-error)", borderColor: "var(--color-error)", opacity: deleting ? 0.5 : 1 }}
    >
      {deleting ? "Raderar..." : "Radera"}
    </button>
  );
}
