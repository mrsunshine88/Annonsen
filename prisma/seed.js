const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const categories = [
  {
    name: 'Affärsverksamhet',
    subs: ['Butik och detaljhandel', 'Containrar och baracker', 'Domäner och sajter', 'Hälsa och första hjälpen', 'Jordbruk', 'Kontorsutrustning och inredning', 'Last och transport', 'Maskinutrustning och reservdelar', 'Scen', 'Storkök och restaurang', 'Verkstad, bygg och konstruktion', 'Övrigt']
  },
  {
    name: 'Bil',
    subs: ['A-traktorer', 'Bilar', 'Bildelar och tillbehör', 'Släp och trailer', 'Transportbilar']
  },
  {
    name: 'Båt',
    subs: ['Båt', 'Båtdelar och tillbehör', 'Släp och trailer (Båt)']
  },
  {
    name: 'Djur och tillbehör',
    subs: ['Akvarium', 'Burar', 'Fiskar', 'Foder, djurvård, kennlar och stall', 'Fåglar', 'Gnagare och kaniner', 'Hundar', 'Hundtillbehör', 'Häst- och ridutrustning', 'Hästar', 'Katter', 'Kattillbehör', 'Lantbruksdjur', 'Reptiler', 'Spindlar och insekter', 'Övriga djur', 'Övriga djurtillbehör']
  },
  {
    name: 'Elektronik och vitvaror',
    subs: ['Datorer', 'Foto och video', 'Hushållsapparater', 'Ljud och bild', 'Personvård', 'Telefoner och tillbehör', 'TV-spel och spelkonsoler', 'Vitvaror', 'Övrigt (Elektronik)']
  },
  {
    name: 'Entreprenad- och lantbruksmaskiner',
    subs: ['Buss', 'Entreprenad & anläggning', 'Lastbil och släp', 'Skogs- och lantbruksmaskiner', 'Skördetröskor', 'Traktorer']
  },
  {
    name: 'Fordonstillbehör',
    subs: ['ATV-reservdelar', 'Bildelar och tillbehör (Fordon)', 'Båtdelar och tillbehör (Fordon)', 'Husvagns- och husbilsdelar', 'MC-utrustning och reservdelar', 'Släp och trailer (Fordon)', 'Övrigt (Fordonstillbehör)']
  },
  {
    name: 'Fritid, hobby och underhållning',
    subs: ['Biljetter och resor', 'Böcker och tidningar', 'Hantverk', 'Mat och dryck', 'Modeller och byggsatser', 'Musik och film', 'Musikinstrument', 'Radiostyrda enheter', 'Samlarobjekt', 'Sällskaps- och brädspel', 'Övrigt (Fritid)']
  },
  {
    name: 'Föräldrar och barn',
    subs: ['Barnböcker', 'Barnkläder', 'Barnmöbler', 'Barnskor', 'Barntillbehör och säkerhet', 'Barnvagnar', 'Bilbarnstolar och babyskydd', 'Gravidkläder', 'Inredning till barnrum', 'Leksaker', 'Övrigt (Föräldrar)']
  },
  {
    name: 'Husbil och husvagn',
    subs: ['Husbilar', 'Husvagnar', 'Husvagns- och husbilsdelar (Husbil)']
  },
  {
    name: 'Kläder, kosmetika och accessoarer',
    subs: ['Accessoarer', 'Damkläder', 'Glasögon och solglasögon', 'Herrkläder', 'Hud-, hår- och kroppsvård', 'Klockor och armbandsur', 'Kosmetik', 'Maskeradkläder', 'Skor', 'Smycken och smyckesförvaring', 'Väskor och plånböcker', 'Övrigt (Kläder)']
  },
  {
    name: 'Konst och antikt',
    subs: ['Antika möbler', 'Keramik, porslin och glas', 'Konst', 'Silverföremål och silverbestick', 'Övriga antikviteter']
  },
  {
    name: 'MC, ATV och snöskoter',
    subs: ['ATV:er', 'ATV-reservdelar (MC)', 'MC- och ATV-släp', 'MC, ATV och snöskoter (Huvud)', 'MC-utrustning och reservdelar (MC)', 'Mopeder, scootrar och mopedbilar']
  },
  {
    name: 'Möbler och inredning',
    subs: ['Bord och stolar', 'Dekoration och prydnader', 'Garderober och förvaring', 'Hyllor och byråer', 'Köksutrustning och porslin', 'Lampor', 'Mattor och textilier', 'Pynt till högtider och fest', 'Soffor och fåtöljer', 'Sängar och madrasser', 'Övriga möbler och inredning']
  },
  {
    name: 'Sport och fritid',
    subs: ['Bollsporter', 'Cykel', 'Extremsport', 'Golf', 'Jakt, fiske och camping', 'Kosttillskott', 'Rullskridskor, ishockey och konståkning', 'Skytte', 'Supporterprodukter', 'Träningsklockor och aktivitetsarmband', 'Träningskläder och skor', 'Träningsutrustning', 'Vattensport', 'Vintersport', 'Övriga sporter']
  },
  {
    name: 'Trädgård och renovering',
    subs: ['Badrum och bastu', 'Byggmaterial och renovering', 'Garagedelar och tillbehör', 'Köksinredning och köksstommar', 'Larm och säkerhet', 'Trädgård och utemiljö', 'Utrustning för fritidshus', 'Verktyg', 'Värme och ventilation', 'Övrigt (Trädgård)']
  }
];

async function main() {
  // 1. Skapa testanvändaren
  const hashedPassword = await bcrypt.hash('020406', 10);
  const user = await prisma.user.upsert({
    where: { email: 'apersson508@gmail.com' },
    update: {},
    create: {
      email: 'apersson508@gmail.com',
      password: hashedPassword,
      name: 'Användare',
    },
  });
  console.log('User created:', user.email);

  // 2. Skapa kategorier
  for (const mainCat of categories) {
    const parent = await prisma.category.upsert({
      where: { name: mainCat.name },
      update: {},
      create: { name: mainCat.name },
    });
    
    for (const subCat of mainCat.subs) {
      await prisma.category.upsert({
        where: { name: subCat },
        update: { parentId: parent.id },
        create: { name: subCat, parentId: parent.id },
      });
    }
  }
  console.log('Categories seeded.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
