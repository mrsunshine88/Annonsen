# Systemarkitektur: Annonsen

Detta dokument fungerar som en ritning ("blueprint") för hela systemet bakom marknadsplatsen **Annonsen**. Det är skrivet för att en senior utvecklare snabbt ska kunna sätta sig in i projektet, förstå alla komponenter, varför vissa beslut har tagits och hur allt hänger ihop.

---

## 1. Systemöversikt
**Annonsen** är en modern marknadsplats (likt Blocket) kombinerat med en jobbportal. Plattformen stöder privatpersoner, företag (med egna butikssidor) och arbetsgivare. Applikationen är byggd med server-side rendering (SSR) för blixtsnabb prestanda och bra SEO, samt klientside-interaktivitet där det behövs.

## 2. Teknikstack
Vi har valt en extremt modern och robust stack:
- **Ramverk:** Next.js (App Router, React)
- **Språk:** TypeScript (för typsäkerhet över hela linjen)
- **Databas:** PostgreSQL (hostad på Supabase)
- **ORM:** Prisma (för smidiga databasanrop och typsäkert schema)
- **Autentisering:** NextAuth.js (Credentials-provider med bcrypt för lösenordskryptering)
- **Styling:** Vanilla CSS (`globals.css`) utan tunga ramverk, optimerat med CSS-variabler för färgteman och responsiva verktygsklasser (t.ex. `.glass-panel`, `.grid-2-col`).
- **Realtid:** Supabase Realtime-kanaler (WebSockets) används för chattmeddelanden.

---

## 3. Databasarkitektur (Prisma Schema)
All data definieras i `prisma/schema.prisma`. Relationen är byggd med `onDelete: Cascade` på de flesta ställen för att undvika föräldralösa rader (ex. om en användare raderas försvinner deras annonser och meddelanden).

### 3.1 Viktiga Modeller
- **User:** Kärnan i systemet. Hanterar inloggning (`email`, `password`), roller (`isAdmin`, `isRoot`, `isBlocked`) och kontotyper (`Privat`, `Företag`, `Arbetsgivare`). Innehåller även fält för företagsinformation (ex. `companyName`, `companyOrgNr`).
- **Category & Ad:** Annonserna. Varje `Ad` tillhör en `Category` (vilka stöder sub-kategorier via `parentId`). Annonsmodellen har både generella fält (pris, titel, ort) och fordonsspecifika fält (miltal, växellåda, m.m.).
- **JobAd & JobApplication:** En separat tabellstruktur från vanliga annonser för att hålla domänerna rena. `JobAd` innehåller fält som `requirements`, `merits`, `scope`, `deadline` och `vacancies` (som gör det möjligt för arbetsgivaren att ange exakt hur många platser som finns att söka). `JobApplication` sparar CV/Personligt brev-URL:er och kopplar sökanden till jobbannonsen.
- **Message:** Inbyggd chatt. Varje meddelande har `senderId` och `receiverId`. För att koppla chatten till en specifik kontext finns två *valfria* fält: `adId` (för varuannonser) och `jobAdId` (för platsannonser). Ett boolean-fält `isJobMessage` används för UI-märkning. Meddelanden stöder "ensidig radering" via fälten `deletedBySender` och `deletedByReceiver`, vilket innebär att om ena parten raderar ett meddelande så finns det ändå kvar för den andra.
- **Settings:** En singleton-modell (id = "default") som håller systeminställningar. Används för prissättning, Swish-inställningar (`swishAlias`, `swishCert`) och aktivering av betalningar.
- **Favorite, Follow, AdReport:** Modeller för att bokmärka annonser, följa företag/säljare och anmäla opassande annonser till admin. `AdReport` har bland annat ett fält `adminViewed` för att hålla koll på om en notis ska visas för administratörerna.

---

## 4. Roller och Säkerhet

### 4.1 Kontotyper
Vi har implementerat tre huvudspår för användare (styrs via fältet `accountType`):
1. **Privat:** Standardanvändare. Kan lägga upp vanliga annonser.
2. **Företag:** Har en egen "butikssida" (`/butik/[id]`). Kan prenumerera mot en månadskostnad och har ofta specialpriser på fordonsannonser.
3. **Arbetsgivare:** Kan komma åt Jobb-dashboardet för att lägga ut platsannonser (`JobAd`) och ta emot/hantera `JobApplication`. Kan ha separat prissättning (per månad / per platsannons).

### 4.2 Admin, RBAC och Godkännanden
- **Admin (`isAdmin: true`):** Har tillgång till `/admin/*`. Kan redigera andras annonser, blockera konton, tömma uppladdade bilder från regelbrytande annonser och sätta priser (Settings).
- **Godkännandesystem (RBAC):** Företag och Arbetsgivare publiceras *inte* automatiskt. I tabellen `User` finns två kritiska fält:
  - `companyPageApproved`: Styr om deras publika butikssida (`/butik/[id]`) är synlig för allmänheten.
  - `canPublishAds`: Styr om de överhuvudtaget får skapa nya annonser och om deras befintliga annonser syns i sökresultaten.
  *Varför?* Detta ger plattformsägaren full kontroll över kvaliteten och säkerställer att B2B-kunder kan faktureras korrekt innan de utnyttjar plattformen. Är man inte godkänd visas tydliga varningar i dashboarden.
- **Root-admin (`isRoot: true`):** Det existerar ett hårdkodat Root-konto (`apersson508@gmail.com`). *Varför?* För att skydda ägaren. Logiken i NextAuth garanterar att detta e-postkonto alltid tilldelas `isAdmin` och `isRoot` vid inloggning. Ett root-konto kan **aldrig** blockeras, få sina rättigheter borttagna, eller raderas av andra admins.

### 4.3 Blockering
När en admin blockerar en användare sätts `isBlocked = true` i databasen. På klientsidan (`Navbar.tsx` polling) och via NextAuths `authorize`-funktion verifieras detta, och den blockerade användaren loggas genast ut och nekas åtkomst.

### 4.4 Dashboard och Navigation
När en användare loggar in sker en initial omdirigering i `app/page.tsx` och via `Navbar`:
- Privatpersoner skickas till Mina Annonser.
- Arbetsgivare tvingas direkt till Jobb-vyn (`/dashboard/jobb`).
- Layouten i `src/app/dashboard/layout.tsx` anpassar menyn till vänster beroende på `accountType`, så att Arbetsgivare t.ex. inte ser "Dina Annonser" (varor) utan enbart "Dina Jobb". 
- Företag och Arbetsgivare har en intern länk till "Din Företagssida" (`/dashboard/foretagssida`) där de kan förhandsgranska exakt hur deras butik/profil ser ut för omvärlden utan att lämna systemet. Inga externa fönster (`target="_blank"`) öppnas, allt renderas integrerat.

### 4.6 Följ-systemet och Det Gemensamma Flödet
Användare kan klicka på "Följ" på både Företag (butiker) och Arbetsgivare. 
Under `/dashboard/flodet` hämtas sedan både vanliga Varuannonser och Jobbannonser från de konton användaren följer. Algoritmen slår ihop dessa två helt olika datatyper och sorterar dem kronologiskt, vilket ger en modern "social-media"-liknande feed. Jobbannonserna får en specifik visuell "Jobb"-kortdesign för att passa in bland bildtunga varuannonser.

### 4.5 Admin Notifikationer
Ett smart notissystem är implementerat för att snabbt uppmärksamma administratörer på nya anmälningar (`AdReport`):
- När en användare skapar en anmälan sparas den med `adminViewed = false`.
- En lättviktig polling var 10:e sekund via `/api/auth/status` (inbyggd i `Navbar`) räknar ut antalet olästa anmälningar och renderar dynamiskt en röd notisbubbla intill "Admin" i huvudmenyn.
- Inne i admin-layouten används den frikopplade klientkomponenten `AdminSidebar.tsx` som lyssnar på samma status och visar bubblan intill "Anmälningar".
- **UX (User Experience):** Så fort administratören klickar på "Anmälningar" och besöker sidan, anropas en bakgrundsroute (`POST /api/admin/anmalningar/mark-viewed`) som sätter `adminViewed = true` på alla aktuella anmälningar. Detta gör att notisbubblorna försvinner omedelbart överallt utan att admin behöver markera varje anmälan som "Hanterad" individuellt.

---

## 5. Kärnfunktioner & Flöden

### 5.1 Annonsflödet (Skapa och Söka)
- **Skapa:** Formuläret (`/skapa`) känner av vilken kategori som valts. Om "Bilar" väljs renderas extra input-fält för bilens specifikationer. Sidan hämtar `autoLocation` från användaren.
- **Sök (`/sok`):** En robust sökmotor med Prisma's `contains` och `mode: "insensitive"`. Den hanterar söksträngar, kategorifiltrering, max/min-pris och plats.

### 5.2 Jobbportalen
En helt isolerad portal byggd sida-vid-sida med varuannonserna:
- **Publikt (`/jobb` & `/jobb/[id]`):** Besökare kan söka och läsa platsannonser. *Teknisk detalj:* Dessa sidor använder `export const dynamic = 'force-dynamic';` och awaitar `searchParams` enligt Next.js 15-standard. *Varför?* För att förhindra att Next.js statiskt cachar en tom jobblista. Detta garanterar att sökningarna alltid hämtar dagsfärsk data från databasen.
- **Ansökan:** (`/jobb/[id]/ansok`) Användaren måste ladda upp CV och brev, vilka sedan skapar en `JobApplication` kopplad till annonsen. Tidigare skickades ansökningar in som chattmeddelanden, men för att inte skräpa ner inkorgen sparas de nu **enbart** som ansökningar i databasen. För att hantera problem med mobila uppladdningar (där t.ex. iPhone strippar filändelser för `.docx`) lyssnar backend på filens MIME-typ istället för enbart filändelsen vid uppladdning till Vercel Blob.
- **Arbetsgivare (`/dashboard/ansokningar`):** Här ser arbetsgivaren alla inkomna ansökningar strukturerat per jobb. Arbetsgivaren kan ladda ner dokumenten (PDF/Word). När de vill gå vidare klickar de "Gå till meddelanden" för att starta en separat, renodlad konversation med sökanden i chatten.
  * **Detalj kring Meddelandeflödet för Jobb:** När arbetsgivaren klickar på "Gå till meddelanden" från ansökan skickas specifika URL-parametrar (`newChat=true`, `adId`, `isJob=true`, `applicantId`, `applicantName`). Meddelandesidan (`/meddelanden`) plockar upp dessa, slår mot databasen och kontrollerar om det redan finns en existerande konversation gällande denna annons och just denna sökande. Om inte, renderas direkt en tillfällig vy (ett "spök"-chatt-state) där arbetsgivaren kan skriva det allra första meddelandet direkt till sökanden. *Varför?* Tidigare länkade knappen bara till meddelandesidan utan kontext, vilket gjorde det omöjligt att veta vem man skulle svara. Detta löser problemet dynamiskt och bygger en stark bro mellan ansökningar och chattsystemet. De kan även radera och hantera sina annonser från Jobb-dashboarden.

### 5.3 Meddelandesystem (Chatt)
Chatten (`/dashboard/meddelanden`) bygger på en kombination av realtidsuppdateringar och HTTP-anrop för notiser:
- **Arkitektur:** När ett meddelande skickas via `POST /api/messages` sparas det i databasen. UI:t sorterar in meddelandena i en `Map` baserat på konversation (kombination av `annons-ID` och `motpartens ID`). 
- **Notiser:** I `Navbar` ligger en lättviktig polling var 10:e sekund mot `/api/auth/status` som räknar `unreadCount` och visar en liten notis-bubbla i huvudmenyn om man fått nya svar.
- **Realtid (Supabase):** Inne på själva meddelandesidan är all "ful-polling" borttagen för att spara på klientens CPU och serverns resurser. Istället används `@supabase/supabase-js` och WebSockets för att enbart lyssna på `INSERT`-events i tabellen `Message`. När ett nytt meddelande anländer renderas det direkt.
- **Integritet och Radering:** Användare har möjlighet att radera specifika meddelanden inuti en konversation (via en papperskorg-ikon). API:et (`DELETE /api/messages/[id]`) sätter då användarens raderings-flagga (`deletedBySender` eller `deletedByReceiver`) till sant. Om *båda* användarna har raderat meddelandet, tar backend-systemet permanent bort raden från databasen för att spara lagringsutrymme.

### 5.4 Inställningar och Swish (Betalning)
Vi har byggt grunden för dynamiska betalningar:
- `Settings`-modellen tillåter admin att sätta ett standardpris per annons.
- Företag och Arbetsgivare har egna specifika fält (både för abonnemang och annonser). Systemet stöder också individuella "custom"-priser på användarnivå som trumfar de globala företagspriserna.
- Admin kan slå på/av betalningskrav. Vid aktivering måste användare verifiera betalning (via Swish-integration framåt) innan annonsen får `isPaid = true`.

---

## 6. Mappstruktur (Next.js App Router)

```text
src/
 ├── app/
 │    ├── admin/            # Alla administrationssidor (konton, annonser, priser)
 │    ├── api/              # Alla backend-rutter (auth, jobb, meddelanden, settings)
 │    ├── dashboard/        # Användarnas egna paneler (mina annonser, meddelanden, etc)
 │    ├── annons/           # Publika varuannonser (/annons/[id])
 │    ├── jobb/             # Publika platsannonser (/jobb/[id])
 │    ├── skapa/            # Skapa varuannons
 │    ├── sok/              # Sökmotor för varuannonser
 │    ├── page.tsx          # Startsidan (Hero & Sök)
 │    └── globals.css       # Enda stilmallen (Vanilla CSS med variabler)
 ├── components/            # Återanvändbara UI-element (Navbar, BackButton, m.fl)
```

---

## 7. Frontend Design & Responsivitet
Vi undvek Tailwind (på beställning) och byggde en ren, egen design med Vanilla CSS i `globals.css`:
- **Glassmorphism:** Vi använder flitigt `.glass-panel` för att skapa kort och containers med frostad glas-effekt (`backdrop-filter`).
- **Företagssidor:** Företagssidor (`/butik/[id]`) har fått en premium-design. Den innefattar en dynamisk CSS-gradient som hero-banner, en överlappande logotyp med skuggning (box-shadow), och kontaktinformation (öppettider, org.nr etc) uppdelade i "piller" (span-element) för maximal läsbarhet och en "premium SaaS"-känsla.
- **Jobb-kort:** Jobbannonser som visas i rutnät (grids), t.ex. på företagssidan eller i flödet, använder en elegant gradient (`linear-gradient(135deg, var(--color-primary), #1e40af)`) i kombination med subtila cirkel-skuggor och explicit vit textskugga för att säkerställa perfekt kontrast och en modern look.
- **Layout:** Klasserna `.grid-2-col` och `.responsive-flex` används rakt igenom hela systemet. På skrivbord visar de side-by-side layouter, men via CSS media-queries (`@media (max-width: 768px)`) faller de automatiskt ner i en enkel kolumn på mobiltelefoner.
- **Teman:** Alla färger hämtas via CSS-variabler (`var(--color-primary)`). Detta gör att det är extremt enkelt att implementera eller finjustera dark mode genom att enbart ändra variablerna i en `@media (prefers-color-scheme: dark)`-block.

---

## 8. Prestanda & Optimeringar
Ett stort fokus har lagts på att optimera applikationens svarstider och datahantering för att den ska kännas blixtsnabb:

- **Databas-indexering (Prisma):** För att undvika "Full Table Scans" (där databasen läser igenom *varje* rad för att hitta en träff), är flertalet sökindex (`@@index`) konfigurerade. Exempelvis indexeras frekvent sökta fält som `categoryId`, `location`, `price`, `authorId` och `createdAt`.
- **API Paginering:** Istället för att ladda ner hela databasen på en gång, bygger Sök-API:et (`/api/search`) på Prisma's `take` och `skip`. API:et returnerar strikt 20 annonser åt gången. I frontend används en "Ladda fler"-knapp som mjukt bygger på listan. Detta sänker minnesanvändningen drastiskt på mobila enheter.
- **Bildoptimering (Next.js Image):** Istället för traditionella, tunga `<img>`-taggar används rakt igenom ramverkets inbyggda `<Image>`-komponent från `next/image`. Detta säkerställer att extremt stora uppladdade bilder per automatik skalas ner och konverteras till webbanpassade format (som `WebP`) med optimala upplösningar (`sizes`) och lazy-loading innan de skickas till klientens webbläsare.

---

## 9. Framtida Utveckling / Att Tänka På
- **Swish Integration:** Backend-rutterna för prishantering finns klara. För nästa steg behövs Swish e-handels-certifikat, vilka läggs in i `Settings`. En webhook (`/api/payments/webhook`) bör byggas för att asynkront ta emot "Betald"-bekräftelsen från Swish och ändra `isPaid` till `true`.
- **Bildhantering & Uppladdningar:** Bilduppladdningar och dokumentuppladdningar (CV/Brev) hanteras fullt ut med **Vercel Blob** (`@vercel/blob`). Den asynkrona backend-routen `/api/upload` genererar unika UUID-filnamn och sparar dem säkert i molnet. Den hanterar även fallback för filtyper ifall mobila webbläsare strippar `.docx` eller `.pdf` från filnamnet.
- **Email:** Det finns inga e-postutskick för återställning av lösenord. Integration mot t.ex. Resend eller SendGrid rekommenderas.

Detta system är 100% dynamiskt och byggt för att enkelt kunna skalas upp både horisontellt (Next.js serverless) och vertikalt (PostgreSQL)!
