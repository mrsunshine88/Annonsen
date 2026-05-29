"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useNotification } from "@/components/NotificationProvider";

export default function DeleteJobButton({ jobId }: { jobId: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const { showNotification, showConfirm } = useNotification();

  const handleDelete = async () => {
    const confirmed = await showConfirm({ message: "Är du säker på att du vill radera denna jobbannons? Detta går inte att ångra." });
    if (!confirmed) {
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`/api/jobb/${jobId}`, {
        method: "DELETE"
      });

      if (res.ok) {
        showNotification("Jobbannonsen har raderats", "success");
        router.refresh();
      } else {
        showNotification("Gick inte att radera jobbannonsen.", "error");
        setDeleting(false);
      }
    } catch (err) {
      console.error(err);
      showNotification("Ett fel uppstod.", "error");
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
