# Guide: Aktivera Stripe (Steg-för-steg)

Denna guide beskriver **exakt** hur du går från noll till att kunna ta emot riktiga kortbetalningar och automatiska månadsdragningar (1500 kr/månad) från dina företagskunder.

---

## STEG 1: Skapa ditt Stripe-konto
1. Gå till [Stripe.com](https://stripe.com) och klicka på **"Start now"**.
2. Fyll i din e-post, namn och ett lösenord.
3. Stripe kommer be dig verifiera din e-postadress. Gå till din inkorg och klicka på verifieringslänken.
4. Väl inne i din nya Stripe Dashboard kommer det stå *"Activate payments"* högst upp. Klicka där och fyll i dina riktiga företagsuppgifter (organisationsnummer, bankkonto dit pengarna ska betalas ut, etc). *Detta kan ta en liten stund att fylla i, men är obligatoriskt för att du ska få ta emot riktiga pengar.*

---

## STEG 2: Skapa Företagsprodukten (Prislappen)
Systemet behöver veta vad det är företagen köper när de klickar på "Aktivera annonsering". 

1. I vänstermenyn på Stripe, klicka på **"Product Catalog"** (eller Produkter).
2. Klicka på den lila knappen **"Add Product"** (Skapa produkt) uppe till höger.
3. Fyll i formuläret:
   - **Name:** *Annonsen Företagspaket* (Detta namn syns på kundens kvitto).
   - **Description:** *Obegränsad annonsering för företag.*
4. Skrolla ner till sektionen **Pricing** (Prissättning):
   - **Pricing model:** Standard pricing
   - **Price:** `1500` (och kontrollera att valutan är SEK)
   - **Billing period:** `Monthly` (Månadsvis)
5. Klicka på **"Save product"** (Spara).

> [!IMPORTANT]
> **Kopiera Pris-ID:t!**
> När produkten är sparad kommer du se en sektion som heter "Pricing". Där under står ett ID som börjar på `price_` (t.ex. `price_1P3x9aL...`). Markera detta och **kopiera det**. Du kommer behöva det i nästa steg.

---

## STEG 3: Koppla Stripe till Annonsen (Miljövariabler)
Nu måste vi berätta för din Vercel-server vilka nycklar den ska använda.

1. Gå till din Stripe Dashboard igen. Längst ner i vänstermenyn, klicka på **"Developers"** och sedan på fliken **"API keys"**.
2. Du letar efter den nyckel som heter **Secret key** (Den börjar på `sk_live_...`). Klicka på *"Reveal test/live key"* och kopiera den.
3. Öppna en ny flik i webbläsaren och logga in på **Vercel.com**.
4. Klicka på ditt projekt (*Annonsen*), gå till fliken **"Settings"** och välj **"Environment Variables"** i vänstermenyn.
5. Lägg till följande två variabler en i taget:
   - **Key:** `STRIPE_SECRET_KEY`
     **Value:** (Klistra in din `sk_live_...` nyckel)
     Klicka *Save*.
   - **Key:** `NEXT_PUBLIC_STRIPE_PRICE_ID`
     **Value:** (Klistra in det `price_...` ID du kopierade i Steg 2).
     Klicka *Save*.

---

## STEG 4: Sätt upp Webhooks (Låt Stripe prata med Annonsen)
För att Annonsen.se ska veta *när* en faktura har betalats eller om ett kort har blivit nekat, måste Stripe skicka en signal (Webhook) tillbaka till systemet.

1. Gå tillbaka till Stripe och klicka på **"Developers"** -> **"Webhooks"**.
2. Klicka på **"Add endpoint"**.
3. I fältet **Endpoint URL**, skriv in exakt detta:
   `https://www.din-doman.se/api/payments/stripe-webhook` *(Byt ut "din-doman.se" mot din faktiska live-hemsida!)*
4. Klicka på knappen **"Select events"** (Välj händelser).
5. Kryssa för dessa två specifika händelser i listan:
   - `checkout.session.completed` (Söks enklast upp via sökfältet)
   - `invoice.payment_succeeded`
   - Klicka sedan "Add events".
6. Längst ner, klicka **"Add endpoint"** för att spara.
7. Väl inne på din nyskapade webhook ser du en ruta där det står **"Signing secret"**. Klicka på *"Reveal"* (den börjar på `whsec_...`) och kopiera koden.
8. Gå tillbaka till Vercel -> Environment Variables och lägg in en tredje nyckel:
   - **Key:** `STRIPE_WEBHOOK_SECRET`
   - **Value:** (Din `whsec_...` kod).
   Klicka *Save*.

---

## STEG 5: Uppdatera din Admin-panel
Slutligen måste vi synka gränssnittet så att dina företag vet vad som gäller.

1. **Deploya Vercel:** Eftersom du precis lagt in nya miljövariabler i Vercel måste du göra en ny "Redeploy" eller helt enkelt ladda upp din senaste kod från VS Code så att Vercel startar om med de nya inställningarna.
2. Logga in på din plattform med ditt Root/Admin-konto.
3. Gå till **`/admin/kostnad`**.
4. Sätt **"Standardpris för nya annonser"** till **0**. (Detta gäller privatpersoner om du inte vill ta betalt av dem än).
5. Sätt **"Företagsannons (Jobb/Vanlig)"** till **0**. *(Systemet bryr sig nu enbart om månadsavgiften, företagen slipper betala per styck)*.
6. Sätt fältet **"Företag: Prenumeration (kr/mån)"** till **1500**.
7. Klicka Spara!

---

## Klart! 🚀 Så här ser flödet ut för kunden nu:
1. Ett nytt företag registrerar sig på plattformen.
2. Du loggar in som admin och "godkänner" deras företagssida.
3. Företaget loggar in, vill publicera en annons, men formuläret är låst med texten *"Aktivering krävs"*.
4. De går till Inställningar och ser din snygga knapp: **"💳 Aktivera Annonsering (1500 kr / månad)"**.
5. De klickar, tas till Stripes kassa, betalar.
6. Stripe skickar i hemlighet en signal till din Webhook. Systemet sätter omedelbart företagets `canPublishAds` till `true`.
7. Företaget skickas tillbaka till Annonsen.se, låsen försvinner, och de kan nu lägga ut hur många annonser de vill.
8. Nästa månad drar Stripe 1500 kr automatiskt. Om kortet studsar (inga pengar), märker din Webhook det och sätter automatiskt `canPublishAds = false` och låser ute dem igen tills de uppdaterar sitt kort!
