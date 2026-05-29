"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

export default function BackButton({ label = "Tillbaka", style = {}, href }: { label?: string; style?: React.CSSProperties; href?: string }) {
  const router = useRouter();

  const buttonStyle = { display: "inline-flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem", ...style };
  
  const icon = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12"></line>
      <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
  );

  if (href) {
    return (
      <Link href={href} className="btn-secondary back-button" style={buttonStyle}>
        {icon}
        {label}
      </Link>
    );
  }

  return (
    <button
      onClick={() => router.back()}
      className="btn-secondary back-button"
      style={buttonStyle}
    >
      {icon}
      {label}
    </button>
  );
}
