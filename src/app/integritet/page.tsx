export default function IntegritetPage() {
  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem 1rem", lineHeight: "1.6" }}>
      <h1 style={{ marginBottom: "2rem", color: "var(--color-primary)" }}>Integritetspolicy (GDPR)</h1>
      
      <div className="glass-panel" style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <p>Senast uppdaterad: {new Date().toLocaleDateString("sv-SE")}</p>
        
        <p>
          Din personliga integritet är viktig för oss på Annonsen.se. Denna policy förklarar hur vi samlar in, använder och skyddar dina personuppgifter i enlighet med Dataskyddsförordningen (GDPR).
        </p>

        <section>
          <h2 style={{ fontSize: "1.3rem", marginBottom: "0.5rem" }}>1. Vilka uppgifter vi samlar in</h2>
          <p>Vi samlar in information för att kunna tillhandahålla en säker och fungerande marknadsplats. Följande uppgifter behandlas:</p>
          <ul style={{ paddingLeft: "1.5rem", marginTop: "0.5rem" }}>
            <li><strong>Konto- och profilinformation:</strong> Din e-postadress, lösenord (krypterat) och eventuellt namn eller telefonnummer om du väljer att ange detta.</li>
            <li><strong>Företagsinformation:</strong> För företag/arbetsgivare samlar vi in org.nummer, företagsnamn och adress.</li>
            <li><strong>Annonsdata & Chatt:</strong> Innehållet i dina upplagda annonser, bilder, sökord och meddelanden som skickas via vår inbyggda chatt. Jobbansökningar och CV-dokument behandlas konfidentiellt.</li>
            <li><strong>Teknisk data:</strong> IP-adress och webbläsardata för att underhålla säkerheten och för att via automatik (om du godkänner) erbjuda sökningar nära dig.</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: "1.3rem", marginBottom: "0.5rem" }}>2. Hur vi använder uppgifterna</h2>
          <p>Dina uppgifter används exklusivt för att:</p>
          <ul style={{ paddingLeft: "1.5rem", marginTop: "0.5rem" }}>
            <li>Låta dig logga in och publicera annonser.</li>
            <li>Sköta kommunikationen (chatt) mellan köpare och säljare.</li>
            <li>Fakturera tjänster via våra betalningspartners.</li>
            <li>Förebygga bedrägerier och upprätthålla plattformens säkerhet.</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: "1.3rem", marginBottom: "0.5rem" }}>3. Delning till tredjepart</h2>
          <p>Vi säljer <strong>aldrig</strong> dina personuppgifter till tredje part för marknadsföringssyften. Vi delar endast uppgifter med tjänsteleverantörer som är absolut nödvändiga för driften:</p>
          <ul style={{ paddingLeft: "1.5rem", marginTop: "0.5rem" }}>
            <li><strong>Stripe:</strong> Används för säkra kortbetalningar och abonnemang.</li>
            <li><strong>Vercel / Supabase:</strong> Serverdrift, databaslagring och bilduppladdningar.</li>
            <li><strong>Resend:</strong> För att skicka transaktionella e-postmeddelanden (t.ex. glömt lösenord, notiser om jobbansökningar).</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: "1.3rem", marginBottom: "0.5rem" }}>4. Dina Rättigheter & Radering av Data</h2>
          <p>Enligt GDPR har du rätt att:</p>
          <ul style={{ paddingLeft: "1.5rem", marginTop: "0.5rem" }}>
            <li>Få ett utdrag på den data vi har om dig.</li>
            <li>Rätta felaktiga uppgifter direkt i dina inställningar.</li>
            <li>Bli bortglömd.</li>
          </ul>
          <p style={{ marginTop: "0.5rem" }}>
            Inne i dina kontoinställningar finns en knapp för att radera ditt konto. Om du använder denna funktion raderas dina personuppgifter, dina annonser och dina skickade chattmeddelanden permanent från våra databaser.
            <br/><br/>
            Vi har dessutom automatiserade processer (Cron-jobb) som ser till att utlöpta jobbansökningar (och därmed tillhörande CV-filer) raderas per automatik efter 6 månader för att minska datalagringen.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: "1.3rem", marginBottom: "0.5rem" }}>5. Kontakt</h2>
          <p>
            Har du frågor angående vår hantering av personuppgifter? Använd vårt <a href="/kontakt" style={{ color: "var(--color-primary)" }}>kontaktformulär</a> så hjälper vi dig.
          </p>
        </section>

      </div>
    </div>
  );
}
