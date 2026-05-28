"use client";

import { useRouter } from "next/navigation";

export default function BackButton({ label = "Tillbaka", style = {} }: { label?: string; style?: React.CSSProperties }) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="btn-secondary back-button"
      style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem", ...style }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
      </svg>
      {label}
    </button>
  );
}
