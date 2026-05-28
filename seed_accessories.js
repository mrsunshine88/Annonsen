const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Skapa huvudkategori för Bildelar & Tillbehör
  const biltillbehor = await prisma.category.create({
    data: { name: 'Bildelar & Biltillbehör' }
  });

  // Skapa underkategorier
  const subCategories = [
    'Fälgar & Däck',
    'Bilstereo & Multimedia',
    'Reservdelar',
    'Styling & Tuning',
    'Takboxar & Lasthållare',
    'Verktyg & Bilvård',
    'Släp & Tillbehör',
    'Övrigt inom biltillbehör'
  ];

  for (const sub of subCategories) {
    await prisma.category.create({
      data: {
        name: sub,
        parentId: biltillbehor.id
      }
    });
  }

  console.log("Kategorier för Bildelar & Biltillbehör skapades!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
