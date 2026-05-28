const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function reshape() {
  console.log("Startar omstrukturering av kategorier...");

  // Hämta alla relevanta nuvarande kategorier för att radera/döpa om.
  // Istället för att radera bygger vi en ny struktur och flyttar över.
  
  // 1. Skapa eller hämta Huvudkategori "Bil"
  let mainBil = await prisma.category.findFirst({ where: { name: 'Bil', parentId: null } });
  if (!mainBil) {
    const gamlaFordon = await prisma.category.findFirst({ where: { name: 'Bilar & Fordon' } }) || 
                        await prisma.category.findFirst({ where: { name: 'Fordon' } });
    if (gamlaFordon) {
      mainBil = await prisma.category.update({ where: { id: gamlaFordon.id }, data: { name: 'Bil' } });
    } else {
      mainBil = await prisma.category.create({ data: { name: 'Bil' } });
    }
  }

  // 2. Skapa subkategorier för "Bil"
  const bilSubNames = ['Bilar', 'Moped', 'A-traktor', 'Släp', 'Husvagn & Husbil', 'Båtar', 'Motorcyklar'];
  for (const name of bilSubNames) {
    let sub = await prisma.category.findFirst({ where: { name: name } });
    if (sub) {
      await prisma.category.update({ where: { id: sub.id }, data: { parentId: mainBil.id } });
    } else {
      await prisma.category.create({ data: { name, parentId: mainBil.id } });
    }
  }

  // 3. Hantera "Bil tillbehör"
  let bilTillbehor = await prisma.category.findFirst({ where: { name: 'Bil tillbehör' } }) || 
                     await prisma.category.findFirst({ where: { name: 'Biltillbehör' } });
  if (bilTillbehor) {
    bilTillbehor = await prisma.category.update({ where: { id: bilTillbehor.id }, data: { name: 'Bil tillbehör', parentId: mainBil.id } });
  } else {
    bilTillbehor = await prisma.category.create({ data: { name: 'Bil tillbehör', parentId: mainBil.id } });
  }

  // Flytta tillbehör under "Bil tillbehör"
  const tillbehorNames = ['Fälgar & Däck', 'Bilstereo & Multimedia', 'Reservdelar', 'Styling & Tuning', 'Takboxar & Lasthållare', 'Verktyg & Bilvård'];
  for (const name of tillbehorNames) {
    let tb = await prisma.category.findFirst({ where: { name } });
    if (tb) {
      await prisma.category.update({ where: { id: tb.id }, data: { parentId: bilTillbehor.id } });
    } else {
      await prisma.category.create({ data: { name, parentId: bilTillbehor.id } });
    }
  }

  // DJUR
  let mainDjur = await prisma.category.findFirst({ where: { name: 'Djur', parentId: null } });
  if (!mainDjur) {
    mainDjur = await prisma.category.create({ data: { name: 'Djur' } });
  }

  const djurNames = ['Hundar', 'Katter', 'Hästar', 'Fiskar & Akvarium', 'Smådjur', 'Djurtillbehör'];
  for (const name of djurNames) {
    let d = await prisma.category.findFirst({ where: { name, parentId: mainDjur.id } }) ||
            await prisma.category.findFirst({ where: { name } });
    if (d) {
      await prisma.category.update({ where: { id: d.id }, data: { parentId: mainDjur.id } });
    } else {
      await prisma.category.create({ data: { name, parentId: mainDjur.id } });
    }
  }

  console.log("Kategorier uppdaterade enligt önskemål!");
}

reshape().catch(console.error).finally(() => prisma.$disconnect());
