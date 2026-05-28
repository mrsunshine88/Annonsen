"use client";

import { useState, useEffect } from "react";

export default function AppBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [deviceType, setDeviceType] = useState<"ios" | "android" | "other">("other");
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    
    if (/android/i.test(userAgent)) {
      setDeviceType("android");
    } else if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
      setDeviceType("ios");
    }

    // Lyssna på Androids inbyggda app-installerare
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!sessionStorage.getItem("appBannerClosed")) {
        setShowBanner(true);
      }
    });

    // För iOS där det inte finns någon auto-prompt
    if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).navigator.standalone) {
      if (!sessionStorage.getItem("appBannerClosed")) {
        setShowBanner(true);
      }
    }
  }, []);

  const handleInstallClick = async () => {
    if (deviceType === "ios") {
      alert("Tryck på 'Dela'-knappen längst ner i Safari (fyrkanten med en pil) och välj 'Lägg till på hemskärmen' för att installera appen!");
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    } else {
      alert("Du kan lägga till denna app på din hemskärm via webbläsarens meny ('Lägg till på startskärmen').");
    }
  };

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
        <img 
          src="/icon-192x192.png" 
          alt="Annonsen App Ikon" 
          style={{ width: "48px", height: "48px", borderRadius: "12px", objectFit: "cover" }} 
        />
        <div>
          <h4 style={{ margin: 0, fontSize: "1rem" }}>Annonsen</h4>
          <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--color-text-secondary)" }}>
            Lägg till appen på din startskärm
          </p>
        </div>
      </div>

      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
        <button 
          onClick={handleInstallClick}
          className="btn-primary" 
          style={{ padding: "0.5rem 1rem", fontSize: "0.9rem" }}
        >
          {deviceType === "ios" ? "Installera" : "Hämta"}
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
