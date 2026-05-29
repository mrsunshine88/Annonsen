"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function AdminAdsPage() {
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchAds = async () => {
    try {
      const res = await fetch("/api/admin/ads");
      const data = await res.json();
      setAds(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const clearImages = async (adId: string) => {
    if (!confirm("Vill du verkligen ta bort alla bilder på denna annons? (Den får då en grå rutan)")) return;
    try {
      const res = await fetch("/api/admin/ads", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adId, action: "clearImages" })
      });
      if (res.ok) fetchAds();
    } catch (error) {
      console.error(error);
    }
  };

  const deleteAd = async (adId: string) => {
    if (!confirm("Är du helt säker på att du vill radera denna annons permanent?")) return;
    try {
      const res = await fetch(`/api/admin/ads?adId=${adId}`, { method: "DELETE" });
      if (res.ok) fetchAds();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <p>Laddar annonser...</p>;

  const filteredAds = ads.filter(ad => 
    (ad.title && ad.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (ad.author?.name && ad.author.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (ad.author?.email && ad.author.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div>
      <h1 style={{ marginBottom: "2rem", color: "var(--color-primary)" }}>Hantera Annonser</h1>
      
      <div style={{ marginBottom: "1.5rem" }}>
        <input 
          type="text" 
          placeholder="Sök på annonsens titel eller användarens namn/e-post..." 
          className="input-field" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ maxWidth: "400px" }}
        />
      </div>

      <div className="glass-panel" style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--color-border)", textAlign: "left" }}>
              <th style={{ padding: "1rem" }}>Annons</th>
              <th style={{ padding: "1rem" }}>Användare</th>
              <th style={{ padding: "1rem" }}>Bilder</th>
              <th style={{ padding: "1rem" }}>Datum</th>
              <th style={{ padding: "1rem", textAlign: "right" }}>Åtgärder</th>
            </tr>
          </thead>
          <tbody>
            {filteredAds.map(ad => (
              <tr key={ad.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                <td style={{ padding: "1rem" }}>
                  <strong>{ad.title}</strong>
                  <div style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)" }}>
                    {ad.category.name} | {ad.price} kr
                  </div>
                </td>
                <td style={{ padding: "1rem" }}>
                  <div>{ad.author.name || "Inget namn"}</div>
                  <div style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)" }}>{ad.author.email}</div>
                </td>
                <td style={{ padding: "1rem" }}>{ad.imageUrls?.length || 0} st</td>
                <td style={{ padding: "1rem" }}>{new Date(ad.createdAt).toLocaleDateString("sv-SE")}</td>
                <td style={{ padding: "1rem", textAlign: "right", display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                  <Link 
                    href={`/annons/${ad.id}`}
                    target="_blank"
                    className="btn-secondary"
                    style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem", textDecoration: "none" }}
                  >
                    Visa
                  </Link>
                  <Link 
                    href={`/admin/annonser/${ad.id}`}
                    className="btn-secondary"
                    style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem", textDecoration: "none" }}
                  >
                    Redigera
                  </Link>
                  <button 
                    onClick={() => clearImages(ad.id)}
                    className="btn-secondary"
                    style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}
                    disabled={!ad.imageUrls || ad.imageUrls.length === 0}
                  >
                    Töm bilder
                  </button>
                  <button 
                    onClick={() => deleteAd(ad.id)}
                    className="btn-primary"
                    style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem", background: "var(--color-error)" }}
                  >
                    Radera
                  </button>
                </td>
              </tr>
            ))}
            {filteredAds.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: "var(--color-text-secondary)" }}>
                  Inga annonser hittades.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
