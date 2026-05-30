# Guide: Aktivera och ställa in Stripe för Annonsen

Denna guide förklarar steg-för-steg hur du aktiverar Stripe, sätter upp dina prenumerationer för Företag och Arbetsgivare, och kopplar ihop allt med Vercel.

## Steg 1: Skapa ett Stripe-konto
1. Gå till [Stripe.com](https://stripe.com/se) och skapa ett gratiskonto.
2. När du loggat in befinner du dig i din **Dashboard**.
3. **Tips:** Om du bara vill testa hur allt fungerar utan riktiga pengar, klicka på knappen **"Test mode"** (Testläge) uppe i högra hörnet innan du går vidare till Steg 2. Allt du gör i testläget sparas separat och påverkar inte din riktiga lansering!

---

## Steg 2: Skapa dina Prenumerationsprodukter (Prices)
Du vill ha ett pris för "Företag/Bilhandlare" (t.ex. 2500 kr) och ett för "Arbetsgivare/Jobb" (t.ex. 1500 kr).

1. Klicka på **Product catalog** (Produkter) i sidomenyn och välj **Add product** (Lägg till produkt).
2. Fyll i detaljerna för Företag:
   - **Name:** "Prenumeration - Företag & Bilhandlare"
   - **Description:** "Obegränsad tillgång till att publicera företags- och fordonsannonser."
   - Scrolla ner till "Pricing":
   - **Price model:** Standard pricing
   - **Price:** `2500` (och kontrollera att valutan är SEK)
   - **Billing period:** Monthly (Månadsvis)
3. Klicka på **Save product**.
4. På nästa sida, leta upp rubriken **Pricing** och kopiera ditt **API ID** (Detta ID börjar alltid på `price_...`, t.ex. `price_1P3zQsL...`). **Spara denna kod i ett anteckningsblock!**

5. Klicka på **Add product** igen och gör samma sak för arbetsgivare:
   - **Name:** "Prenumeration - Arbetsgivare & Jobb"
   - **Price:** `1500` (SEK)
   - **Billing period:** Monthly
   - Spara produkten och kopiera även detta **API ID** (t.ex. `price_1P5bAqL...`) till ditt anteckningsblock.

---

## Steg 3: Hämta dina Hemliga Nycklar
För att din sajt ska få prata med Stripe behöver du dina API-nycklar.

1. Klicka på **Developers** (Utvecklare) uppe till höger i Stripe.
2. Klicka på fliken **API keys**.
3. Kopiera **Publishable key** (Börjar på `pk_...`).
4. Klicka på "Reveal test/live key" och kopiera **Secret key** (Börjar på `sk_...`).
5. Spara båda dessa i ditt anteckningsblock.

---

## Steg 4: Lägg in allt i Vercel (Livesidan)
Nu ska vi ge din kod tillgång till nycklarna och priserna!

1. Logga in på [Vercel](https://vercel.com) och gå in på ditt projekt ("Annonsen").
2. Klicka på fliken **Settings** -> **Environment Variables**.
3. Du ska nu lägga till 4 stycken variabler (en i taget):

   * **Key:** `STRIPE_SECRET_KEY`
     * **Value:** *(Din Secret key som börjar på `sk_...`)*

   * **Key:** `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
     * **Value:** *(Din Publishable key som börjar på `pk_...`)*

   * **Key:** `NEXT_PUBLIC_STRIPE_PRICE_ID_COMPANY`
     * **Value:** *(Ditt Price-ID för 2500kr som börjar på `price_...`)*

   * **Key:** `NEXT_PUBLIC_STRIPE_PRICE_ID_EMPLOYER`
     * **Value:** *(Ditt Price-ID för 1500kr som börjar på `price_...`)*

4. När alla 4 är tillagda, gå till fliken **Deployments** i Vercel.
5. Klicka på de tre prickarna (...) vid din senaste deployment och välj **Redeploy**. Detta startar om servrarna så att de nya nycklarna laddas in.

---

## Steg 5: Ställ in display-priset i din Admin-panel
Som en sista finish måste du ställa in så att rätt summor syns för användarna i din plattform.

1. Logga in på Annonsen som admin (Root).
2. Gå till sidomenyn och klicka på **Kostnad**.
3. Under rutan "Företag: Prenumeration (kr/mån)", skriv in `2500`.
4. Under rutan "Arbetsgivare: Prenumeration (kr/mån)", skriv in `1500`.
5. Klicka på "Spara Allmänna Inställningar".

**Klart! 🎉**
Nu är hela flödet sammankopplat. När ett företag klickar "Aktivera annonsering" skickas de automatiskt till Stripes kassa för 2500 kr. När de har betalat aktiveras deras konto direkt av systemet.
