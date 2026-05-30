export default function CookiesPage() {
  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem 1rem", lineHeight: "1.6" }}>
      <h1 style={{ marginBottom: "2rem", color: "var(--color-primary)" }}>Cookiepolicy</h1>
      
      <div className="glass-panel" style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <p>Senast uppdaterad: {new Date().toLocaleDateString("sv-SE")}</p>
        
        <p>
          För att Annonsen.se ska fungera optimalt använder vi små textfiler, kallade cookies, som sparas på din enhet. 
          Vi värdesätter din integritet och tillämpar en "privacy first"-filosofi. Det innebär att vi prioriterar funktionella, nödvändiga cookies framför onödig spårning.
        </p>

        <section>
          <h2 style={{ fontSize: "1.3rem", marginBottom: "0.5rem" }}>1. Strikt Nödvändiga Cookies</h2>
          <p>Dessa cookies är grundläggande för att sidan ska fungera och kan inte stängas av. De sätts vanligtvis som ett svar på åtgärder du gör, såsom att logga in eller fylla i formulär.</p>
          <ul style={{ paddingLeft: "1.5rem", marginTop: "0.5rem" }}>
            <li><strong>NextAuth Session Token:</strong> En krypterad cookie som talar om för våra servrar vem du är när du loggat in. Den raderas när du loggar ut eller när din session löper ut.</li>
            <li><strong>Säkerhetscookies:</strong> För att skydda plattformen och API-anrop från attacker (t.ex. CSRF-tokens).</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: "1.3rem", marginBottom: "0.5rem" }}>2. Analys och Prestanda</h2>
          <p>
            Vi strävar efter att förstå hur plattformen används utan att spåra dig personligen. Om vi integrerar besöksstatistik så anonymiseras din IP-adress, vilket innebär att vi mäter den generella trafiken på sidan snarare än ditt individuella beteende.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: "1.3rem", marginBottom: "0.5rem" }}>3. Hur hanterar jag cookies?</h2>
          <p>
            Eftersom de cookies vi använder i dagsläget är klassade som <em>Strikt Nödvändiga</em> för att du överhuvudtaget ska kunna använda plattformens inloggade läge, krävs inget samtyckes-banner för riktad reklam (då vi inte sysslar med det). 
          </p>
          <p style={{ marginTop: "0.5rem" }}>
            Om du trots detta vill blockera alla cookies kan du göra detta via inställningarna i din webbläsare (Google Chrome, Safari, Edge, etc.). Var dock medveten om att du då inte kommer kunna logga in, skicka meddelanden eller skapa annonser på Annonsen.se.
          </p>
        </section>

      </div>
    </div>
  );
}
