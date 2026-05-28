const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Hitta Kategori "Bilar"
  let bilarCategory = await prisma.category.findFirst({
    where: { name: 'Bilar' }
  });

  if (!bilarCategory) {
    console.log("Kunde inte hitta kategorin 'Bilar', letar upp någon annan kategori...");
    // Fallback: ta första bästa kategorin om "Bilar" inte finns
    bilarCategory = await prisma.category.findFirst();
  }

  if (!bilarCategory) {
    console.log("Finns inga kategorier alls i databasen!");
    return;
  }

  const hashedPassword = await bcrypt.hash('020406', 10);

  // Skapa Ramdala bil
  const user = await prisma.user.upsert({
    where: { email: 'info@ramdalabil.se' },
    update: {
      password: hashedPassword
    },
    create: {
      email: 'info@ramdalabil.se',
      password: hashedPassword,
      name: 'Ramdala Bil',
      accountType: 'Företag',
      companyName: 'Ramdala Bil AB',
      companyOrgNr: '556123-4567',
      companyAddress: 'Ramdalavägen 1',
      companyZipCode: '373 52',
      companyCity: 'Ramdala',
      companyWebsite: 'https://www.ramdalabil.se',
      companyDescription: 'Vi på Ramdala Bil säljer noggrant utvalda och välvårdade begagnade bilar. Välkommen in för en provkörning!'
    }
  });

  console.log("Skapade företaget:", user.email, "med lösenord: 020406");

  // Ta bort tidigare exempelbilar för detta konto så vi inte får dubbletter om vi kör skriptet flera gånger
  await prisma.ad.deleteMany({
    where: { authorId: user.id }
  });

  const cars = [
    { title: "Volvo V90 D4 AWD Geartronic", brand: "Volvo", model: "V90", price: 299000, mileage: 8500, year: 2019, fuel: "Diesel", gearbox: "Automat", drivetrain: "Fyrhjulsdriven" },
    { title: "Volkswagen Golf 1.4 TSI R-Line", brand: "Volkswagen", model: "Golf", price: 185000, mileage: 6200, year: 2018, fuel: "Bensin", gearbox: "Manuell", drivetrain: "Tvåhjulsdriven" },
    { title: "BMW 520d xDrive M-Sport", brand: "BMW", model: "520d", price: 345000, mileage: 4100, year: 2020, fuel: "Diesel", gearbox: "Automat", drivetrain: "Fyrhjulsdriven" },
    { title: "Audi A6 Avant 40 TDI quattro", brand: "Audi", model: "A6", price: 389000, mileage: 5500, year: 2021, fuel: "Diesel", gearbox: "Automat", drivetrain: "Fyrhjulsdriven" },
    { title: "Tesla Model 3 Long Range", brand: "Tesla", model: "Model 3", price: 425000, mileage: 7200, year: 2021, fuel: "El", gearbox: "Automat", drivetrain: "Fyrhjulsdriven" },
    { title: "Kia Ceed 1.6 CRDi Plug-in Hybrid", brand: "Kia", model: "Ceed", price: 215000, mileage: 3800, year: 2020, fuel: "Hybrid", gearbox: "Automat", drivetrain: "Tvåhjulsdriven" },
    { title: "Toyota RAV4 2.5 Hybrid AWD-i", brand: "Toyota", model: "RAV4", price: 359000, mileage: 2900, year: 2022, fuel: "Hybrid", gearbox: "Automat", drivetrain: "Fyrhjulsdriven" },
    { title: "Skoda Octavia Combi 1.0 TSI", brand: "Skoda", model: "Octavia", price: 179000, mileage: 9100, year: 2019, fuel: "Bensin", gearbox: "Manuell", drivetrain: "Tvåhjulsdriven" },
    { title: "Peugeot 3008 1.2 PureTech", brand: "Peugeot", model: "3008", price: 229000, mileage: 4500, year: 2020, fuel: "Bensin", gearbox: "Automat", drivetrain: "Tvåhjulsdriven" },
    { title: "Mercedes-Benz C 200 EQ Boost", brand: "Mercedes-Benz", model: "C-Klass", price: 319000, mileage: 5800, year: 2019, fuel: "Hybrid", gearbox: "Automat", drivetrain: "Tvåhjulsdriven" }
  ];

  for (const car of cars) {
    await prisma.ad.create({
      data: {
        title: car.title,
        description: `En mycket fin och välvårdad ${car.brand} ${car.model}. Svensksåld, nyservad och redo för omgående leverans.\n\nVälkommen till Ramdala Bil för en trygg bilaffär! Vi erbjuder även förmånlig finansiering.`,
        price: car.price,
        location: "Blekinge",
        city: "Ramdala",
        zipCode: "373 52",
        phoneNumber: "0455-12345",
        hidePhone: false,
        isPaid: true,
        advertiserType: user.accountType,
        brand: car.brand,
        model: car.model,
        mileage: car.mileage,
        year: car.year,
        fuel: car.fuel,
        gearbox: car.gearbox,
        drivetrain: car.drivetrain,
        categoryId: bilarCategory.id,
        authorId: user.id
      }
    });
  }

  console.log(`Skapade 10 bilannonser för ${user.companyName}!`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
