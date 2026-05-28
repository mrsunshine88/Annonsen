const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const categoryTree = {
  "Fordon": [
    "Bilar", "Båtar", "Motorcyklar", "Husvagnar & Husbilar", "Mopeder & A-traktorer", "Snöskotrar", "Lastbilar & Bussar"
  ],
  "Bildelar & Biltillbehör": [
    "Fälgar & Däck", "Bilstereo & Multimedia", "Reservdelar", "Styling & Tuning", "Takboxar & Lasthållare", "Verktyg & Bilvård", "Släp & Tillbehör"
  ],
  "Djur": [
    "Hundar", "Katter", "Fåglar", "Hästar", "Fiskar & Akvarium", "Reptiler", "Smådjur", "Tillbehör"
  ],
  "Heminredning": [
    "Soffor & Fåtöljer", "Sängar & Sovrum", "Bord & Stolar", "Belysning", "Dekoration", "Mattor", "Förvaring"
  ],
  "Elektronik": [
    "Datorer & Tillbehör", "Telefoner & Tillbehör", "TV & Projektorer", "Ljud & Bild", "Tv-spel & Konsoler", "Surfplattor"
  ],
  "Kläder & Skor": [
    "Herrkläder", "Damkläder", "Barnkläder", "Skor", "Väskor & Accessoarer", "Klockor"
  ],
  "Bostad": [
    "Lägenheter", "Villor", "Fritidshus", "Tomter", "Utlandsobjekt"
  ]
};

async function main() {
  console.log("Startar inläsning av kompletta kategorier...");

  for (const [mainCatName, subCats] of Object.entries(categoryTree)) {
    // Upsert Main Category
    const mainCat = await prisma.category.upsert({
      where: { name: mainCatName },
      update: {},
      create: { name: mainCatName }
    });

    console.log(`- ${mainCatName}`);

    // Upsert Subcategories
    for (const subCatName of subCats) {
      await prisma.category.upsert({
        where: { name: subCatName },
        update: { parentId: mainCat.id },
        create: { name: subCatName, parentId: mainCat.id }
      });
      console.log(`  -- ${subCatName}`);
    }
  }

  console.log("Kategoriträdet är uppdaterat!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
