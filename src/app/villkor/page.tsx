export default function VillkorPage() {
  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem 1rem", lineHeight: "1.6" }}>
      <h1 style={{ marginBottom: "2rem", color: "var(--color-primary)" }}>Allmänna Villkor</h1>
      
      <div className="glass-panel" style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <p>Senast uppdaterad: {new Date().toLocaleDateString("sv-SE")}</p>

        <section>
          <h2 style={{ fontSize: "1.3rem", marginBottom: "0.5rem" }}>1. Allmänt</h2>
          <p>
            Dessa allmänna villkor gäller för din användning av plattformen Annonsen.se. Genom att skapa ett konto eller använda tjänsten godkänner du dessa villkor i sin helhet. Om du inte godkänner villkoren får du inte använda tjänsten.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: "1.3rem", marginBottom: "0.5rem" }}>2. Regler för annonsering</h2>
          <p>
            Som användare ansvarar du för att innehållet i dina annonser följer svensk lag och våra riktlinjer. Det är strikt förbjudet att:
          </p>
          <ul style={{ paddingLeft: "1.5rem", marginTop: "0.5rem" }}>
            <li>Publicera annonser för olagliga varor eller tjänster.</li>
            <li>Publicera stötande, diskriminerande eller på annat sätt olämpligt innehåll.</li>
            <li>Skapa annonser med falsk eller vilseledande information.</li>
            <li>Lägga in annonser i fel kategori medvetet för att få mer uppmärksamhet.</li>
          </ul>
          <p style={{ marginTop: "0.5rem" }}>
            Annonsen.se förbehåller sig rätten att utan förvarning radera annonser eller blockera konton som bryter mot dessa regler. Vid radering av annons utgår ingen återbetalning av eventuella annonsavgifter.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: "1.3rem", marginBottom: "0.5rem" }}>3. Ansvarsfriskrivning</h2>
          <p>
            Annonsen.se är uteslutande en plattform som förmedlar kontakt mellan köpare och säljare, samt arbetsgivare och arbetssökande. Vi är inte part i något avtal som sluts mellan användare och tar därmed absolut inget ansvar för:
          </p>
          <ul style={{ paddingLeft: "1.5rem", marginTop: "0.5rem" }}>
            <li>Kvaliteten, säkerheten eller lagligheten i de utannonserade objekten eller tjänsterna.</li>
            <li>Att säljare eller köpare fullföljer sina åtaganden.</li>
            <li>Ekonomiska förluster eller andra skador som uppstår i samband med affärer via plattformen.</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: "1.3rem", marginBottom: "0.5rem" }}>4. Immaterialrätt och Dataskrapning</h2>
          <p>
            Allt innehåll på Annonsen.se (inklusive text, bilder, databaser och design) tillhör plattformsägaren eller respektive annonsör och skyddas av upphovsrättslagen. Det är strikt förbjudet att:
          </p>
          <ul style={{ paddingLeft: "1.5rem", marginTop: "0.5rem" }}>
            <li>Använda bottar, spiders, scrapers eller andra automatiserade verktyg för att extrahera, kopiera eller kompilera data från Annonsen.se.</li>
            <li>Publicera vårt material på andra webbplatser utan skriftligt godkännande.</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: "1.3rem", marginBottom: "0.5rem" }}>5. Betalningar och Avgifter</h2>
          <p>
            Vissa funktioner och annonskategorier kan vara avgiftsbelagda. Priser anges tydligt i samband med publicering eller prenumeration.
          </p>
          <p style={{ marginTop: "0.5rem" }}>
            <strong>För företag/arbetsgivare (Stripe):</strong> Vid prenumerationer dras avgiften i förskott. Ingen bindningstid tillämpas. Vid uppsägning avslutas prenumerationen i slutet av den pågående, betalda perioden. Ingen återbetalning görs för del av månad.
          </p>
          <p style={{ marginTop: "0.5rem", fontWeight: 500 }}>
            <strong>Prisändringar:</strong> Annonsen.se förbehåller sig rätten att när som helst ändra priset för abonnemang och prenumerationer. Vid en prisändring kommer befintliga kunder att meddelas skriftligen via e-post i god tid innan det nya priset träder i kraft, vilket ger kunden möjlighet att avsluta sin prenumeration om det nya priset inte accepteras.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: "1.3rem", marginBottom: "0.5rem" }}>6. Ändringar i villkoren</h2>
          <p>
            Vi förbehåller oss rätten att när som helst ändra dessa villkor. Vid större förändringar kommer du som registrerad användare att meddelas via e-post eller en notis vid inloggning.
          </p>
        </section>

      </div>
    </div>
  );
}
