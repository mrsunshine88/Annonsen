"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

type NotificationType = "success" | "error" | "info";

interface Notification {
  id: string;
  message: string;
  type: NotificationType;
}

interface ConfirmOptions {
  message: string;
  title?: string;
  confirmText?: string;
  cancelText?: string;
}

interface NotificationContextType {
  showNotification: (message: string, type?: NotificationType) => void;
  showConfirm: (options: ConfirmOptions) => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<(ConfirmOptions & { resolve: (value: boolean) => void }) | null>(null);

  const showNotification = useCallback((message: string, type: NotificationType = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications(prev => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  }, []);

  const showConfirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setConfirmDialog({ ...options, resolve });
    });
  }, []);

  const handleConfirmAction = (result: boolean) => {
    if (confirmDialog) {
      confirmDialog.resolve(result);
      setConfirmDialog(null);
    }
  };

  return (
    <NotificationContext.Provider value={{ showNotification, showConfirm }}>
      {children}
      
      {/* Toasts Container */}
      <div style={{ position: "fixed", bottom: "20px", right: "20px", zIndex: 9999, display: "flex", flexDirection: "column", gap: "10px" }}>
        {notifications.map(n => (
          <div 
            key={n.id} 
            className="glass-panel"
            style={{ 
              padding: "1rem 1.5rem", 
              background: n.type === "error" ? "rgba(239, 68, 68, 0.95)" : n.type === "success" ? "rgba(34, 197, 94, 0.95)" : "var(--color-bg)",
              color: (n.type === "error" || n.type === "success") ? "white" : "var(--color-primary)",
              backdropFilter: "blur(10px)",
              boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
              borderRadius: "var(--radius-md)",
              animation: "fadeInUp 0.3s ease-out",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              minWidth: "250px",
              fontWeight: 500,
              border: n.type === "info" ? "1px solid var(--color-primary)" : "none"
            }}
          >
            {n.type === "success" && <span style={{fontSize: "1.2rem"}}>✓</span>}
            {n.type === "error" && <span style={{fontSize: "1.2rem"}}>!</span>}
            {n.type === "info" && <span style={{fontSize: "1.2rem"}}>ℹ</span>}
            {n.message}
          </div>
        ))}
      </div>

      {/* Confirm Modal Backdrop */}
      {confirmDialog && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
          <div className="glass-panel" style={{ width: "90%", maxWidth: "400px", padding: "2rem", animation: "scaleIn 0.2s ease-out" }}>
            <h3 style={{ marginBottom: "1rem", color: "var(--color-primary)" }}>{confirmDialog.title || "Bekräfta"}</h3>
            <p style={{ marginBottom: "2rem", lineHeight: 1.5 }}>{confirmDialog.message}</p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
              <button 
                onClick={() => handleConfirmAction(false)}
                className="btn-secondary"
              >
                {confirmDialog.cancelText || "Avbryt"}
              </button>
              <button 
                onClick={() => handleConfirmAction(true)}
                className="btn-primary"
                style={{ background: "var(--color-error)" }}
              >
                {confirmDialog.confirmText || "Fortsätt"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}} />
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
}
