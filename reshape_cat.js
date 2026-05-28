const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function reshapeCategories() {
  // 1. Hitta gamla "Fordon" och "Bildelar & Biltillbehör"
  const fordon = await prisma.category.findUnique({ where: { name: 'Fordon' } });
  const bildelar = await prisma.category.findUnique({ where: { name: 'Bildelar & Biltillbehör' } });

  if (fordon) {
    // Döp om Fordon till Bilar & Fordon
    await prisma.category.update({
      where: { id: fordon.id },
      data: { name: 'Bilar & Fordon' }
    });
  }

  // Leta upp "Bilar" under Fordon
  const bilar = await prisma.category.findFirst({
    where: { name: 'Bilar', parentId: fordon ? fordon.id : undefined }
  });

  if (bilar && bildelar) {
    // Döp om "Bildelar & Biltillbehör" till "Biltillbehör"
    await prisma.category.update({
      where: { id: bildelar.id },
      data: { name: 'Biltillbehör', parentId: bilar.id } // Flytta under "Bilar"
    });
  } else if (!bildelar && bilar) {
    // Skapa "Biltillbehör" under "Bilar"
    const newTillbehor = await prisma.category.create({
      data: { name: 'Biltillbehör', parentId: bilar.id }
    });
    // Skapa fälgar etc under biltillbehör
    await prisma.category.createMany({
      data: [
        { name: 'Fälgar & Däck', parentId: newTillbehor.id },
        { name: 'Bilstereo & Multimedia', parentId: newTillbehor.id },
        { name: 'Reservdelar', parentId: newTillbehor.id }
      ]
    });
  }

  console.log("Kategorier omstrukturerade!");
}

reshapeCategories()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
