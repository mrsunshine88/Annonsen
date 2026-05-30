"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import BackButton from "@/components/BackButton";
import { useNotification } from "@/components/NotificationProvider";

function PaymentContent({ adId }: { adId: string }) {
  const { showNotification } = useNotification();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [price, setPrice] = useState(0);
  
  const urlAmount = searchParams.get("amount");
  const isBump = searchParams.get("bump") === "true";
  const [swishRef, setSwishRef] = useState<string | null>(null);

  useEffect(() => {
    if (urlAmount) {
      setPrice(Number(urlAmount));
      setLoading(false);
    } else {
      fetchAdPrice(adId);
    }
  }, [adId, urlAmount]);

  const fetchAdPrice = async (id: string) => {
    try {
      const res = await fetch("/api/admin/settings");
      const settings = await res.json();
      setPrice(settings.defaultAdPrice || 25);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const simulateSwish = async () => {
    setPaying(true);
    try {
      // 1. Initiera betalning och få referens
      const res = await fetch("/api/payments/swish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adId })
      });
      const data = await res.json();

      if (data.swishReference) {
        setSwishRef(data.swishReference);
        
        // 2. Simulera att Swish ringer vår Webhook
        setTimeout(async () => {
          const webhookRes = await fetch("/api/payments/webhook", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              swishReference: data.swishReference,
              status: "PAID",
              adId,
              amount: data.amount || price
            })
          });

          if (webhookRes.ok) {
            showNotification("Betalning genomförd via Swish!", "success");
            router.push("/dashboard/annonser");
          } else {
            showNotification("Något gick fel med betalningen.", "error");
            setPaying(false);
          }
        }, 2000);
      } else {
        showNotification(data.error || "Misslyckades att starta Swish", "error");
        setPaying(false);
      }
    } catch (err) {
      console.error(err);
      showNotification("Nätverksfel", "error");
      setPaying(false);
    }
  };

  if (loading) return <div style={{ padding: "4rem", textAlign: "center" }}>Laddar betalning...</div>;

  return (
    <div style={{ maxWidth: "500px", margin: "4rem auto", padding: "2rem", textAlign: "center" }} className="glass-panel">
      <BackButton label="Tillbaka till annonsen" />
      <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>💸</div>
      <h1 style={{ marginBottom: "1rem", color: "var(--color-primary)" }}>Betala med Swish</h1>
      <p style={{ marginBottom: "2rem", color: "var(--color-text-secondary)" }}>
        För att din annons ska publiceras behöver du betala <strong>{price} kr</strong>.
      </p>

      <button 
        onClick={simulateSwish}
        disabled={paying}
        className="btn-primary" 
        style={{ width: "100%", padding: "1rem", fontSize: "1.1rem", marginBottom: "1rem", background: paying ? "gray" : "#2DBA5B" }} // Swish-grön
      >
        {paying ? "Väntar på Swish..." : "Öppna Swish (Test-läge)"}
      </button>
      
      <p style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)" }}>
        Detta är för närvarande inställt på Test-läge. Inga riktiga pengar kommer att dras.
      </p>

      <div style={{ marginTop: "2rem" }}>
        <Link href="/dashboard/annonser" style={{ color: "var(--color-text-secondary)" }}>
          Avbryt och återvänd till panelen
        </Link>
      </div>
    </div>
  );
}

export default function SwishPaymentPage({ params }: { params: Promise<{ id: string }> }) {
  const [adId, setAdId] = useState("");
  
  useEffect(() => {
    params.then(p => setAdId(p.id));
  }, [params]);

  if (!adId) return null;

  return (
    <Suspense fallback={<div style={{ padding: "4rem", textAlign: "center" }}>Laddar betalning...</div>}>
      <PaymentContent adId={adId} />
    </Suspense>
  );
}
