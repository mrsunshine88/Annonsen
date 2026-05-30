import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function SystemStatusPage() {
  const session: any = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  // Endast admin får se denna sida
  if (!user || (!user.isAdmin && !user.isRoot)) {
    redirect("/dashboard");
  }

  const isProduction = process.env.NODE_ENV === "production";
  const hasStripeKey = !!process.env.STRIPE_SECRET_KEY;
  const isStripeLive = hasStripeKey && !process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_");
  
  const hasResendKey = !!process.env.RESEND_API_KEY;

  return (
    <div>
      <h2 style={{ marginBottom: "2rem", color: "var(--color-primary)" }}>⚙️ Systemstatus & API-nycklar</h2>
      
      <p style={{ color: "var(--color-text-secondary)", marginBottom: "2rem" }}>
        Här kan du snabbt kontrollera om systemet körs i mock-läge eller om det är anslutet till de skarpa tredjepartstjänsterna. Observera att du inte kan ändra värdena härifrån, de måste ändras i din <code>.env</code>-fil eller i Vercels inställningar.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        
        {/* Stripe Status */}
        <div className="glass-panel" style={{ padding: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", borderLeft: hasStripeKey ? "4px solid var(--color-success, #22c55e)" : "4px solid var(--color-error, #ef4444)" }}>
          <div>
            <h3 style={{ margin: "0 0 0.5rem 0" }}>Stripe Betalningar</h3>
            <div style={{ fontSize: "0.9rem", color: "var(--color-text-secondary)" }}>
              {hasStripeKey 
                ? (isStripeLive ? "Ansluten till Stripe Live" : "Ansluten till Stripe Test-läge") 
                : "Körs i internt MOCK-läge (gratiskonton)"}
            </div>
          </div>
          <div style={{ padding: "0.5rem 1rem", borderRadius: "100px", fontWeight: "bold", fontSize: "0.85rem", backgroundColor: hasStripeKey ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)", color: hasStripeKey ? "var(--color-success, #16a34a)" : "var(--color-error, #dc2626)" }}>
            {hasStripeKey ? "AKTIVERAD" : "AVAKTIVERAD (MOCK)"}
          </div>
        </div>

        {/* Resend Email Status */}
        <div className="glass-panel" style={{ padding: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", borderLeft: hasResendKey ? "4px solid var(--color-success, #22c55e)" : "4px solid var(--color-warning, #f59e0b)" }}>
          <div>
            <h3 style={{ margin: "0 0 0.5rem 0" }}>Resend E-post</h3>
            <div style={{ fontSize: "0.9rem", color: "var(--color-text-secondary)" }}>
              {hasResendKey 
                ? "Ansluten till Resend API för att skicka e-post" 
                : "Körs i internt MOCK-läge (inga riktiga mejl skickas)"}
            </div>
          </div>
          <div style={{ padding: "0.5rem 1rem", borderRadius: "100px", fontWeight: "bold", fontSize: "0.85rem", backgroundColor: hasResendKey ? "rgba(34, 197, 94, 0.1)" : "rgba(245, 158, 11, 0.1)", color: hasResendKey ? "var(--color-success, #16a34a)" : "var(--color-warning, #d97706)" }}>
            {hasResendKey ? "AKTIVERAD" : "AVAKTIVERAD (MOCK)"}
          </div>
        </div>

        {/* Miljö */}
        <div className="glass-panel" style={{ padding: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", borderLeft: isProduction ? "4px solid var(--color-primary)" : "4px solid var(--color-text-secondary)" }}>
          <div>
            <h3 style={{ margin: "0 0 0.5rem 0" }}>Servermiljö (NODE_ENV)</h3>
            <div style={{ fontSize: "0.9rem", color: "var(--color-text-secondary)" }}>
              {isProduction ? "Applikationen körs i skarp produktionsmiljö." : "Applikationen körs i lokal utvecklingsmiljö."}
            </div>
          </div>
          <div style={{ padding: "0.5rem 1rem", borderRadius: "100px", fontWeight: "bold", fontSize: "0.85rem", backgroundColor: isProduction ? "rgba(37, 99, 235, 0.1)" : "var(--color-bg-subtle)", color: isProduction ? "var(--color-primary)" : "var(--color-text-secondary)" }}>
            {isProduction ? "PRODUCTION" : "DEVELOPMENT"}
          </div>
        </div>

      </div>
    </div>
  );
}
