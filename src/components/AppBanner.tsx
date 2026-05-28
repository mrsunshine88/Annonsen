"use client";

import { useState, useEffect } from "react";

export default function AppBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [deviceType, setDeviceType] = useState<"ios" | "android" | "other">("other");

  useEffect(() => {
    // Kontrollera om användaren är på mobil och vilket OS
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    
    if (/android/i.test(userAgent)) {
      setDeviceType("android");
      setShowBanner(true);
    } else if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
      setDeviceType("ios");
      setShowBanner(true);
    }
    
    // Har användaren redan stängt bannern under denna session?
    if (sessionStorage.getItem("appBannerClosed")) {
      setShowBanner(false);
    }
  }, []);

  if (!showBanner) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: "var(--color-bg-surface)",
      borderTop: "1px solid var(--color-border)",
      padding: "1rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      zIndex: 9999,
      boxShadow: "0 -4px 20px rgba(0,0,0,0.1)",
      animation: "slideUp 0.5s ease forwards"
    }}>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
      
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <div style={{ 
          width: "48px", 
          height: "48px", 
          backgroundColor: "var(--color-primary)", 
          borderRadius: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontWeight: "bold",
          fontSize: "24px"
        }}>
          A
        </div>
        <div>
          <h4 style={{ margin: 0, fontSize: "1rem" }}>Ladda ner Annonsen</h4>
          <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--color-text-secondary)" }}>
            Bättre upplevelse i appen
          </p>
        </div>
      </div>

      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
        <button 
          onClick={() => alert(`Laddar ner från ${deviceType === 'ios' ? 'App Store' : 'Google Play'}... (Kräver riktig applänk)`)}
          className="btn-primary" 
          style={{ padding: "0.5rem 1rem", fontSize: "0.9rem" }}
        >
          Hämta
        </button>
        <button 
          onClick={() => {
            setShowBanner(false);
            sessionStorage.setItem("appBannerClosed", "true");
          }}
          style={{ 
            background: "none", 
            border: "none", 
            cursor: "pointer", 
            fontSize: "1.5rem", 
            color: "var(--color-text-secondary)",
            padding: "0 0.5rem"
          }}
        >
          &times;
        </button>
      </div>
    </div>
  );
}
