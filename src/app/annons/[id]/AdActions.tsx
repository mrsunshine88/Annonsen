"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface AdActionsProps {
  adId: string;
  authorId: string;
  authorName: string;
  initialIsFavorite: boolean;
  initialIsFollowing: boolean;
  isLoggedIn: boolean;
}

export default function AdActions({ adId, authorId, authorName, initialIsFavorite, initialIsFollowing, isLoggedIn }: AdActionsProps) {
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reporting, setReporting] = useState(false);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Kolla in denna annons!',
        url: window.location.href
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Länken har kopierats!");
    }
  };

  const handleFavorite = async () => {
    if (!isLoggedIn) return alert("Logga in för att spara favoriter.");
    setIsFavorite(!isFavorite);
    try {
      await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adId, action: isFavorite ? 'remove' : 'add' })
      });
      router.refresh();
    } catch (e) {
      console.error(e);
      setIsFavorite(isFavorite);
    }
  };

  const handleFollow = async () => {
    if (!isLoggedIn) return alert("Logga in för att följa användare.");
    setIsFollowing(!isFollowing);
    try {
      await fetch('/api/follows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followedId: authorId, action: isFollowing ? 'remove' : 'add' })
      });
      router.refresh();
    } catch (e) {
      console.error(e);
      setIsFollowing(isFollowing);
    }
  };

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) return alert("Logga in för att anmäla.");
    setReporting(true);
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adId, reason: reportReason })
      });
      if (res.ok) {
        alert("Annonsen har anmälts. Tack!");
        setShowReportModal(false);
        setReportReason("");
      } else {
        alert("Något gick fel.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setReporting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1.5rem' }}>
      <button onClick={handleShare} className="btn-secondary" style={{ width: '100%', padding: '0.75rem' }}>Dela annons</button>
      <button onClick={handleFavorite} className="btn-secondary" style={{ width: '100%', padding: '0.75rem', background: isFavorite ? 'var(--color-primary)' : '', color: isFavorite ? 'white' : '' }}>
        {isFavorite ? 'Sparad som favorit' : 'Lägg till som favorit'}
      </button>
      <button onClick={handleFollow} className="btn-secondary" style={{ width: '100%', padding: '0.75rem', background: isFollowing ? 'var(--color-primary)' : '', color: isFollowing ? 'white' : '' }}>
        {isFollowing ? `Följer ${authorName}` : `Följ ${authorName}`}
      </button>
      <button onClick={() => setShowReportModal(true)} style={{ width: '100%', padding: '0.75rem', color: 'var(--color-error)', border: '1px solid var(--color-error)', background: 'transparent', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 'bold' }}>
        Anmäl annons
      </button>

      {showReportModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <form onSubmit={handleReport} className="glass-panel" style={{ padding: '2rem', width: '100%', maxWidth: '400px', backgroundColor: 'white' }}>
            <h3 style={{ marginBottom: '1rem' }}>Anmäl annons</h3>
            <textarea 
              required
              rows={4}
              placeholder="Varför anmäler du denna annons?"
              value={reportReason}
              onChange={e => setReportReason(e.target.value)}
              className="input-field"
              style={{ marginBottom: '1rem', width: '100%' }}
            />
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="button" onClick={() => setShowReportModal(false)} className="btn-secondary" style={{ flex: 1 }}>Avbryt</button>
              <button type="submit" disabled={reporting} className="btn-primary" style={{ flex: 1, backgroundColor: 'var(--color-error)' }}>{reporting ? 'Skickar...' : 'Skicka anmälan'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
