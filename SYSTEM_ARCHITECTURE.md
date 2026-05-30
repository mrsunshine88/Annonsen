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
- **Transaction (Swish):** En dedikerad modell för att förbereda systemet för Swish e-handel. Den använder ett unikt fält `swishReference @unique` för att garantera idempotens (förhindrar dubbelbetalningar på databasnivå).
- **VerificationToken:** En säkerhetsmodell för "Glömt lösenord"-flödet. Använder ett sammansatt index (`@@unique([identifier, token])`) för extrema uppslagshastigheter och innehåller `expires` för att se till att länkar automatiskt blir ogiltiga efter 1 timme.
- **Favorite, Follow, AdReport:** Modeller för att bokmärka annonser, följa företag/säljare och anmäla opassande annonser till admin. `AdReport` har bland annat ett fält `adminViewed` för att hålla koll på om en notis ska visas för administratörerna.
- **ContactMessage:** En modell för det inbyggda kundtjänstsystemet. Sparar namn, e-post, telefon och det faktiska meddelandet när besökare kontaktar admin via `/kontakt`. Har fältet `isRead` för att admin ska kunna pricka av hanterade ärenden.

---

## 4. Roller och Säkerhet

### 4.1 Kontotyper
Vi har implementerat tre huvudspår för användare (styrs via fältet `accountType`):
1. **Privat:** Standardanvändare. Kan lägga upp vanliga annonser.
2. **Företag:** Har en egen "butikssida" (`/butik/[id]`). Kan prenumerera mot en månadskostnad och har ofta specialpriser på fordonsannonser.
3. **Arbetsgivare:** Kan komma åt Jobb-dashboardet för att lägga ut platsannonser (`JobAd`) och ta emot/hantera `JobApplication`. Kan ha separat prissättning (per månad / per platsannons).

### 4.2 Admin, RBAC och Godkännanden
- **Admin (`isAdmin: true`):** Har tillgång till `/admin/*`. Kan redigera andras annonser, blockera konton, tömma uppladdade bilder från regelbrytande annonser och sätta priser (Settings).
- **Moderering och Godkännanden (RBAC):** Företag och Arbetsgivare har två kritiska rättighetsfält i tabellen `User`:
  - `companyPageApproved`: Styr om deras publika butikssida (`/butik/[id]`) är synlig för allmänheten.
  - `canPublishAds`: Styr om de överhuvudtaget får skapa nya annonser.
  *Hur det fungerar i praktiken:* När ett B2B-konto betalar sin prenumeration via Stripe, slår systemet **automatiskt** över dessa fält till `true` så de kan börja direkt. Administratörernas roll (under `/admin/konton`) är numera **modererande**. Om ett företag missköter sig använder admin knapparna "Dölj Sida" och "Stoppa Annons" som en nödspärr för att stänga ner dem omedelbart.
- **Root-admin (`isRoot: true`):** Root-användarens e-post identifieras numera via miljövariabeln `ROOT_ADMIN_EMAIL` i `.env` (tidigare hårdkodad för enklare MVP-stadiet). *Varför?* Att hårdkoda administratörers mailadresser är en säkerhetsrisk. Genom miljövariabler skyddas identiteten från obehöriga utvecklare och plattformsägaren kan dynamiskt byta root-konto i Vercel utan att göra en ny kod-release. Logiken i NextAuth garanterar att e-posten i variabeln alltid tilldelas `isAdmin` och `isRoot` vid inloggning. Denna logik använder även `.toLowerCase()` för att göra matchningen skiftlägesoberoende, vilket eliminerar risken att plattformsägaren låser sig ute vid en felskrivning. Ett root-konto kan **aldrig** blockeras, få sina rättigheter borttagna, eller raderas av andra admins.

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

### 4.7 API-Säkerhet och Rate Limiting
Eftersom vi inte har ett externt CDN som hanterar allt brandväggsskydd ligger mycket av ansvaret i koden. I `middleware.ts` har vi implementerat IP-baserad "Rate Limiting" via **Upstash Redis**.
- Om en användare (IP) försöker skicka 100 inloggningsförsök eller skapa 50 annonser på en minut, blockeras IP-adressen automatiskt med ett HTTP 429-fel.

### 4.8 Uppladdningssäkerhet (Anti-Malware)
Eftersom `browser-image-compression` sker på klienten kan en skicklig användare kringgå det formuläret. Därför har vi byggt ett sista försvar i `/api/upload`:
- **Storleksspärr:** Servern tvärstoppar filer som är över 5 MB.
- **Magic Numbers Validation:** Istället för att lita på filändelser (t.ex. att någon döpt sin .exe-fil till .jpg) inspekterar servern filens faktiska binära *header-bytes*. Endast filer som faktiskt "börjar" som JPEG (`FF D8 FF`), PNG eller WEBP accepteras och skickas vidare till Vercel Blob.

### 4.9 Bevissparning (Soft Delete) & Polisutdrag
För att skydda användare vid bedrägerier på marknadsplatsen tillämpar vi "Soft Delete" för chattmeddelanden.
- Om en användare klickar på "Ta bort konversation" tas meddelandet bara bort visuellt för dem (`deletedBySender = true`). Det stannar kvar i databasen.
- **Datautdrag:** Endast administratörer med rättigheten `isAdmin` har tillgång till `/admin/datautdrag`. Sidan laddar numera in **alla** registrerade användare i en interaktiv lista där admin kan fritextsöka på namn eller e-post i realtid. Vid ett klick på "Hämta utdrag" vid en användare får man direkt ut en total logg över skickade/mottagna meddelanden (inklusive de som är märkta som "raderade"). Anledningen till att vi bytte från ett enkelt inmatningsfält till en live-lista var för att optimera arbetsflödet för admin – man ska slippa sitta och chansa på exakta mailadresser vid misstänkt bedrägeri.
- **Cron Jobb:** För att följa GDPR (minimering av data) och inte lagra gigantiska mängder gammal data har vi ett automatiserat jobb (`/api/cron/clean-messages`) som körs i bakgrunden. Det raderar fysiskt alla meddelanden ur databasen som **båda parter** markerat som raderade, men **först när 30 dagar har passerat**.

### 4.10 Admin Notifikationer
Ett smart notissystem är implementerat för att snabbt uppmärksamma administratörer på nya anmälningar (`AdReport`):
- När en användare skapar en anmälan sparas den med `adminViewed = false`.
- En lättviktig polling var 10:e sekund via `/api/auth/status` (inbyggd i `Navbar`) räknar ut antalet olästa anmälningar och renderar dynamiskt en röd notisbubbla intill "Admin" i huvudmenyn.
- Inne i admin-layouten används den frikopplade klientkomponenten `AdminSidebar.tsx` som lyssnar på samma status och visar bubblan intill "Anmälningar".
- **UX (User Experience):** Så fort administratören klickar på "Anmälningar" och besöker sidan, anropas en bakgrundsroute (`POST /api/admin/anmalningar/mark-viewed`) som sätter `adminViewed = true` på alla aktuella anmälningar. Detta gör att notisbubblorna försvinner omedelbart överallt utan att admin behöver markera varje anmälan som "Hanterad" individuellt.

---

## 5. Nyckelfunktioner och Flöden

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
Chatten (`/dashboard/meddelanden`) bygger på en sofistikerad kombination av databaslagring, realtidsuppdateringar och flyktiga nätverkssignaler för att skapa en modern "SaaS-känsla" à la iMessage:
- **Arkitektur:** När ett meddelande skickas via `POST /api/messages` sparas det i databasen. UI:t sorterar in meddelandena i en `Map` baserat på konversation (kombination av `annons-ID` och `motpartens ID`). 
- **Notiser:** I `Navbar` ligger en lättviktig polling var 60:e sekund mot `/api/auth/status` som räknar `unreadCount` och visar en liten notis-bubbla i huvudmenyn om man fått nya svar.
- **Realtid (Supabase):** Inne på själva meddelandesidan används `@supabase/supabase-js` och WebSockets. Systemet lyssnar på `INSERT`-events i tabellen `Message` för att automatiskt ladda in nya meddelanden utan att sidladdning krävs.
- **"Skriver..."-indikatorer (Typing):** För att indikera att motparten skriver skickas *inga* anrop till databasen, då detta hade sänkt prestandan totalt. Istället fångar klientsidan tangenttryck via en throttlad event-listener (debouncing) och skjuter ut en flyktig nätverkssignal (`typing: true`) över en dedikerad `Supabase Broadcast`-kanal. Mottagarens UI fångar denna och renderar tre pulserande punkter. Systemet har en inbyggd 4-sekunders auto-fallback som automatiskt döljer indikatorn ifall avsändarens uppkoppling dör eller stänger fliken, vilket garanterar att texten aldrig fryser.
- **Läst/Oläst-status (Read Receipts):** Modellen använder fältet `readAt DateTime?`. När en användare öppnar en chatt med olästa meddelanden anropas routen `/api/messages/mark-read`. *Varför är det robust?* API:et använder Prisma's `updateMany` för att med ett enda optimerat anrop stämpla nuvarande tid på alla olästa rader samtidigt. Därefter skjuts en nätverkssignal (`read`) ut via WebSockets, vilket gör att avsändaren, om de sitter och kollar på skärmen, omedelbart ser texten ändras från "✓ Levererat" till "Läst hh:mm".
- **Integritet och Radering:** Användare har möjlighet att radera specifika meddelanden inuti en konversation (via en papperskorg-ikon). API:et (`DELETE /api/messages/[id]`) sätter då användarens raderings-flagga (`deletedBySender` eller `deletedByReceiver`) till sant. Om *båda* användarna har raderat meddelandet, tar backend-systemet permanent bort raden från databasen för att spara lagringsutrymme.

### 5.4 Inställningar, Swish och Stripe B2B (Betalning)
Betalningsflödet är helt dynamiskt och konfigureras i adminpanelen (`/admin/kostnad`). 

#### Swish för Privatpersoner
- **Global Aktivering:** Om en admin stänger av `paymentsEnabled` blir alla nya annonser omedelbart gratis (isPaid = true) för alla användare.
- **Swish Integration:** Swish-betalningar är helt integrerade med Merchant API via `/api/payments/swish` och webhooken `/api/payments/webhook`. Denna process utnyttjar en idempotent databasmodell (`Transaction` med unikt `swishReference`) för att garantera att dubbelbetalningar är omöjliga.

#### Stripe för B2B (Företag och Arbetsgivare)
För företagskonton används **Stripe Usage-based (Metered) Billing** kombinerat med fasta månadsavgifter för att eliminera manuell fakturering. Detta hanteras i följande steg:

1. **Kund och Abonnemang:** I `User`-modellen sparas `stripeCustomerId` och `stripeSubscriptionItemId`. Systemet stöder separata prislappar (`companySubscriptionPrice` och `employerSubscriptionPrice`) i adminpanelen.
2. **Dynamisk Onboarding (UX):** Inställningssidan (`/dashboard/installningar`) känner automatiskt av om användaren är av `accountType === "Företag"` eller `"Arbetsgivare"`. Den visar rätt prislapp och anpassar marknadsföringstexten (t.ex. visar "företagsannonser" för bilhandlare och "jobbannonser" för rekryterare). Dessutom har den en inbyggd FAQ-sektion via knappen "ℹ️ Läs mer" som minskar friktionen innan betalning.
3. **Aktivering:** När kunden klickar på aktiveringsknappen triggas `/api/payments/create-checkout-session` och slussar användaren till Stripe. Om Stripe-nycklar saknas fångas anropet upp av en felsäker "Mock" som publicerar annonser direkt.
4. **Metered Billing (Rörligt):** När företaget skapar en ny annons eller jobbannons registreras annonsen omedelbart som `isPaid = true` lokalt, samtidigt som ett `usage record` trycks upp till Stripe.
5. **Stripe Customer Portal (Självbetjäning):** När en användare *har* en aktiv prenumeration ändras UI:t, och de får en knapp för att "Hantera prenumeration". Den anropar `/api/payments/create-portal-session` och skickar användaren till Stripes säkra kundportal. Där kan de uppdatera kortuppgifter, ladda ner kvitton eller säga upp sin prenumeration med ett knapptryck.
6. **Auto-avstängning och Uppsägningar (Webhooks):** Den dygnet-runt-vakande `/api/payments/stripe-webhook` lyssnar ständigt efter händelser från Stripe.
   - *Studsande kort:* Vid `invoice.payment_failed` sätts `canPublishAds = false` och annonser döljs tills fakturan är betald.
   - *Uppsägning:* Om en användare säger upp avtalet i portalen triggas eventet `customer.subscription.deleted`. Webhooken fångar detta och stänger omedelbart av företagets möjligheter att annonsera vidare (`hasActiveSubscription = false`). Allt detta sker utan manuell inblandning från plattformsägaren.
7. **Admin Stripe-Vy:** För att administratören ska ha full kontroll finns en dedikerad sida (`/admin/stripe`). Den anropar `/api/admin/stripe` för att lista alla B2B-konton, deras nuvarande prenumerationsstatus (Aktiv/Ej aktiv) och deras unika `Stripe Customer ID` paketerat i klickbara länkar som tar admin direkt in till rätt kundprofil i Stripe Dashboard.

### 5.5 E-post och Transaktionell Kommunikation
Plattformen använder **Resend** (branschstandard för Next.js) via en isolerad centraltjänst i `src/lib/email.ts`. För att underlätta utveckling finns en smart fallback-logik: Om `RESEND_API_KEY` saknas i miljövariablerna, så "skickas" mejlet ut som en tydlig logg i terminalen istället för att krascha systemet. HTML-mallarna är skrivna i ren Vanilla-kod med inline-CSS som matchar "Glassmorphism"-designen.
Mejl skickas automatiserat vid tre viktiga knutpunkter:
1. **Jobbansökningar:** När ett CV laddas upp får arbetsgivaren direkt ett mejl. *Varför är det smart?* Mejlet skickas med en `replyTo`-header konfigurerad till kandidatens e-post. Detta låter arbetsgivaren klicka "Svara" i Gmail och omedelbart börja prata med sökanden utanför plattformen om de föredrar det.
2. **Onboarding:** När en admin trycker "Godkänn" på ett B2B-konto skjuts ett välkomstmejl iväg med länk direkt till skapande av annonser.
3. **Glömt Lösenord:** Sidan för att återställa lösenord genererar en kryptografisk token (via inbyggda modulen `crypto`) och sparar den i `VerificationToken`. *Varför är det säkert?* API-routen (`/api/auth/forgot-password`) returnerar *alltid* HTTP 200 OK och ett standardmeddelande oavsett om mejladressen fanns i databasen eller ej. Detta är ett försvar mot "User Enumeration", vilket hindrar botar från att lista ut vilka som har konton. När token sedan valideras vid uppdateringen av lösenordet används en ACID-transaktion för att samtidigt byta lösenord (krypterat med bcrypt) och permanent radera token-koden från databasen.

### 5.6 GDPR och Tvingande Villkor (Säker Onboarding)
För att säkerställa 100% efterlevnad av svensk lag och GDPR använder vi oss av en tvingande "Interceptor"-modal (`TermsModal.tsx`).
- När en användare loggar in kontrolleras databasfältet `termsAccepted`.
- Om detta fält är `false` (vilket det är för alla nya och gamla konton som inte godkänt ännu), läggs en oundviklig, skärmtäckande modal ovanpå hela gränssnittet. Användaren tvingas läsa och kryssa i att de accepterar våra **Användarvillkor** och **Integritetspolicy** innan de kan göra något alls på plattformen.
- Vid klick på "Jag godkänner" anropas `/api/user/accept-terms` som sätter `termsAccepted = true` varpå modalen stängs permanent. Sessionen uppdateras lokalt via NextAuths `update`-funktion för att slippa ladda om sidan.

### 5.7 Inbyggd Kundtjänst (Kontaktformulär)
Plattformen har ett inbyggt CRM-liknande kundtjänstflöde:
1. **Publik Sida:** På `/kontakt` kan besökare fylla i namn, e-post, telefon och ett meddelande.
2. **Databas (ContactMessage):** Meddelandet sparas i en separat databas-tabell (`ContactMessage`), istället för att skicka ett osäkert mail direkt.
3. **Admin Panel & Låsning:** Administratörer navigerar till `/admin/kontakt` för att läsa alla inkomna meddelanden. När admin klickar på "Markera som hanterad", ändras ärendets status permanent. Knappen försvinner och ersätts av en grön "✅ Hanterad"-etikett. Detta fungerar som ett oföränderligt CRM-lås så att kollegor aldrig råkar klicka tillbaka ärendet till ohanterat av misstag.

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
- **Premium UI & Glassmorphism:** Vi använder flitigt `.glass-panel` för att skapa kort och containers med frostad glas-effekt (`backdrop-filter`). Gränssnittet genomsyras av "SaaS Billion-dollar"-estetik. Det innefattar mjuka pillerformade knappar (`.dashboard-link`), logotyper i "linear-gradient" med clip-maskning, och välavvägd färgpalett där ren svärta byts ut mot professionella mjukare nyanser (`--color-text-secondary`, `--color-bg-subtle`).
- **Solid Navigation (Undvikande av färgblödning):** Huvudmenyn (`Navbar`) var ursprungligen byggd med Glassmorphism (transparent blur). Men eftersom plattformen använder tunga mörka kontraster (t.ex. i hero-sektionen), orsakade transparensen en grådassig/smutsig genomblödning när man scrollade. Menyn gjordes därför om till en **solid** vit yta med krispig skugga. Detta säkerställer hög kontrast och perfekt läsbarhet oavsett var på sidan besökaren befinner sig.
- **Företagssidor:** Företagssidor (`/butik/[id]`) har fått en premium-design. Den innefattar en dynamisk CSS-gradient som hero-banner, en överlappande logotyp med skuggning (box-shadow), och kontaktinformation (öppettider, org.nr etc) uppdelade i "piller" (span-element) för maximal läsbarhet.
- **Jobb-kort:** Jobbannonser som visas i rutnät (grids), t.ex. på företagssidan eller i flödet, använder en elegant gradient (`linear-gradient(135deg, var(--color-primary), #1e40af)`) i kombination med subtila cirkel-skuggor och explicit vit textskugga för att säkerställa perfekt kontrast och en modern look.
- **Layout:** Klasserna `.grid-2-col` och `.responsive-flex` används rakt igenom hela systemet. På skrivbord visar de side-by-side layouter, men via CSS media-queries (`@media (max-width: 768px)`) faller de automatiskt ner i en enkel kolumn på mobiltelefoner.
- **Teman:** Alla färger hämtas via CSS-variabler (`var(--color-primary)`). Detta gör att det är extremt enkelt att implementera eller finjustera dark mode genom att enbart ändra variablerna i en `@media (prefers-color-scheme: dark)`-block.

---

## 8. Säkerhet, Prestanda & Skalbarhet
Ett enormt fokus har lagts på att optimera applikationens svarstider, säkerhet och lagringskostnader för att plattformen ska klara av hög trafik och efterleva lagkrav:

- **Sökmotorn (Exakt matchning):** Sök-API:et (`/api/search`) är designat för att vara extremt relevant och efterliknar marknadsledare som Blocket. Vid en flerstavad sökning (t.ex. "Volvo V70") splittar backend söksträngen i en array och bygger en dynamisk Prisma `AND`-klausul. Algoritmen kräver att *samtliga* ord måste hittas, men de får befinna sig i antingen `title`, `brand` eller `model`. Den ignorerar medvetet `description`. *Varför?* Detta raderar i stort sett alla "falska träffar" där tillbehörs-säljare spammade beskrivningen med fraser som "Passar Volvo V70".
- **Spam & Bot-skydd (Rate Limiting):** För att skydda plattformens API-rutter mot överbelastningsattacker (DDoS), spam i chatten eller mass-uppladdning av skräpannonser används `src/middleware.ts`. Middlewaret använder `@upstash/ratelimit` kopplat till en Redis-databas (i minnet) för att strypa IP-adresser (via `x-forwarded-for`) som gör fler än 30 anrop per minut mot `/api/*`. De nekas med HTTP Status 429. Vissa kritiska endpoints (som `/api/auth/status` för Navbar-polling) är medvetet vitlistade (exempt) i middlewaret via extremt snäva, exakta matchningar (`pathname === '/api/auth/status'`). *Varför?* För att undvika "False Positives" – om en legitimanvändare öppnade 5 flikar med Annonsen skulle den aggressiva navbar-pollingen omedelbart blockera användaren. Den strikta matchningen skyddar mot att obehöriga skapar fejk-rutter som börjar på samma namn.
- **Prestanda: Client-side Polling vs Realtime:** Navbarens unreadCount-polling (`/api/auth/status`) har strypts från 10 sekunder ner till 60 sekunder. *Varför?* Att ha tusentals aktiva användare som pollar databasen var 10:e sekund för små notiser skapar enorm belastning och API-kostnader. I en marknadsplats är inte en notis i Navbaren tillräckligt verksamhetskritisk för att motivera sekundsnabb polling, speciellt inte när chatten i sig (`/meddelanden`) bygger på blixtsnabba WebSockets via Supabase Realtime.
- **GDPR & Automatiserad Datastädning (Cron Jobs):** Att manuellt rensa gamla dokument håller inte i längden. Ett Vercel Cron-jobb är konfigurerat i `vercel.json` som schemalägger nattliga anrop (kl 03:00) till den skyddade routen `/api/cron/gdpr-cleanup`. Skriptet lokaliserar platsannonser som varit stängda/utlöpta i 6 månader, loggar in mot Vercel Blob och raderar permanent alla länkade CV- och personligt brev-filer (PDF/Word), varpå databasraderna tas bort för full GDPR-efterlevnad.
- **Bildkomprimering på Klientsidan:** Istället för att slösa dyrbar bandbredd och molnlagring (Vercel Blob) på 10MB stora kamera-bilder, används `browser-image-compression` i komponenterna (ex. `CreateAdForm.tsx`). Detta aktiverar en Web Worker i användarens enhet som asynkront skalar ner och komprimerar filerna till under 800 KB *innan* uppladdningen påbörjas.
- **Databas-indexering & Paginering:** För att undvika tunga table-scans i PostgreSQL (`@@index` på flertalet kolumner). Ett "Composite Index" (`@@index([title, brand, model])`) används nu specifikt för sökmotorn, vilket garanterar indexerade och extremt snabba exakt-matchnings-sökningar, även vid 100 000+ annonser. Sökningar returnerar strikt data i set om 20 annonser via Prisma's `take` och `skip`. Klienten sammanfogar listorna asynkront med en "Ladda fler"-knapp vilket sänker mobilers RAM-användning drastiskt.

---

## 9. Framtida Utveckling / Att Tänka På
- **Byte av Swish-certifikat:** Själva logiken, databastransaktionerna och webhooken för Swish är 100% färdigbyggd. Det enda som krävs för en skarp lansering är att byta ut test-koden i klientsidan (`/betala/[id]`) och lägga in riktiga Swish e-handels-certifikat i miljövariablerna, och sedan anropa det riktiga Swish Merchant API:et i backend-routen.
- **Bildhantering & Uppladdningar:** Bilduppladdningar och dokumentuppladdningar (CV/Brev) hanteras fullt ut med **Vercel Blob** (`@vercel/blob`). Den asynkrona backend-routen `/api/upload` genererar unika UUID-filnamn och sparar dem säkert i molnet. Den hanterar även fallback för filtyper ifall mobila webbläsare strippar `.docx` eller `.pdf` från filnamnet.

Detta system är 100% dynamiskt och byggt för att enkelt kunna skalas upp både horisontellt (Next.js serverless) och vertikalt (PostgreSQL)!
