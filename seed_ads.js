const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'apersson508@gmail.com' }
  });

  if (!user) {
    console.log("Root-användaren hittades inte!");
    return;
  }

  // Leta upp kategorier
  const carCategory = await prisma.category.findFirst({
    where: { name: 'Bilar' }
  });

  const electronicsCategory = await prisma.category.findFirst({
    where: { name: 'Elektronik' }
  });

  const randomCategory = carCategory || electronicsCategory;

  if (!randomCategory) {
    console.log("Hittade ingen kategori för att lägga till annonser.");
    return;
  }

  const adsData = [
    {
      title: "Volvo V70 D5 AWD Momentum",
      description: "Mycket fin och välvårdad Volvo V70. Kamrem bytt vid 18000 mil. Nyservad och nybesiktigad. Sommar och vinterdäck på alufälg.",
      price: 45000,
      location: "Blekinge",
      advertiserType: "Privat",
      brand: "Volvo",
      model: "V70",
      year: 2011,
      mileage: 21500,
      gearbox: "Automat",
      fuel: "Diesel",
      imageUrls: ["https://images.unsplash.com/photo-1605816988069-b141444d326c?q=80&w=600&auto=format&fit=crop"],
      categoryId: carCategory ? carCategory.id : randomCategory.id,
      authorId: user.id
    },
    {
      title: "BMW 320i M-Sport",
      description: "Säljer min pärla pga tillökning i familjen. Går fantastiskt bra i motor och låda.",
      price: 125000,
      location: "Skåne",
      advertiserType: "Privat",
      brand: "BMW",
      model: "320",
      year: 2015,
      mileage: 12000,
      gearbox: "Manuell",
      fuel: "Bensin",
      imageUrls: ["https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=600&auto=format&fit=crop"],
      categoryId: carCategory ? carCategory.id : randomCategory.id,
      authorId: user.id
    },
    {
      title: "Volkswagen Golf 1.4 TSI",
      description: "Perfekt pendlarbil, drar ca 0.5l/milen. Skattad och besiktigad.",
      price: 65000,
      location: "Stockholm",
      advertiserType: "Företag",
      brand: "Volkswagen",
      model: "Golf",
      year: 2014,
      mileage: 15500,
      gearbox: "Manuell",
      fuel: "Bensin",
      imageUrls: ["https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?q=80&w=600&auto=format&fit=crop"],
      categoryId: carCategory ? carCategory.id : randomCategory.id,
      authorId: user.id
    },
    {
      title: "Tesla Model 3 Long Range",
      description: "Svensksåld Tesla i toppskick. FSD aktiverat.",
      price: 450000,
      location: "Västra Götaland",
      advertiserType: "Privat",
      brand: "Tesla",
      model: "Model 3",
      year: 2021,
      mileage: 4500,
      gearbox: "Automat",
      fuel: "El",
      imageUrls: ["https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=600&auto=format&fit=crop"],
      categoryId: carCategory ? carCategory.id : randomCategory.id,
      authorId: user.id
    },
    {
      title: "Audi A6 Avant 2.0 TDI",
      description: "Rymlig familjebil med bra komfort.",
      price: 185000,
      location: "Blekinge",
      advertiserType: "Privat",
      brand: "Audi",
      model: "A6",
      year: 2017,
      mileage: 14000,
      gearbox: "Automat",
      fuel: "Diesel",
      imageUrls: ["https://images.unsplash.com/photo-1606152421802-db97b9c7a11b?q=80&w=600&auto=format&fit=crop"],
      categoryId: carCategory ? carCategory.id : randomCategory.id,
      authorId: user.id
    },
    {
      title: "iPhone 13 Pro 128GB",
      description: "Mycket fint skick, inga repor på skärmen. Batterihälsa 89%.",
      price: 6500,
      location: "Kronoberg",
      advertiserType: "Privat",
      imageUrls: ["https://images.unsplash.com/photo-1632661674596-618d8b64d641?q=80&w=600&auto=format&fit=crop"],
      categoryId: electronicsCategory ? electronicsCategory.id : randomCategory.id,
      authorId: user.id
    },
    {
      title: "Samsung 65' 4K Smart TV",
      description: "Säljer pga flytt. Perfekt bild, inbyggd Netflix, YouTube etc.",
      price: 4500,
      location: "Blekinge",
      advertiserType: "Privat",
      imageUrls: ["https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?q=80&w=600&auto=format&fit=crop"],
      categoryId: electronicsCategory ? electronicsCategory.id : randomCategory.id,
      authorId: user.id
    },
    {
      title: "Playstation 5 med 2 handkontroller",
      description: "Nyskick! Kvitto och kartong medföljer.",
      price: 5500,
      location: "Skåne",
      advertiserType: "Privat",
      imageUrls: ["https://images.unsplash.com/photo-1606813907291-d86efa9b94db?q=80&w=600&auto=format&fit=crop"],
      categoryId: electronicsCategory ? electronicsCategory.id : randomCategory.id,
      authorId: user.id
    },
    {
      title: "Macbook Pro M1 2020",
      description: "Kraftfull laptop i perfekt skick. Laddare ingår.",
      price: 9000,
      location: "Stockholm",
      advertiserType: "Privat",
      imageUrls: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=600&auto=format&fit=crop"],
      categoryId: electronicsCategory ? electronicsCategory.id : randomCategory.id,
      authorId: user.id
    },
    {
      title: "Begagnad Cykel Herr 28",
      description: "Fungerar felfritt, 3 växlar.",
      price: 800,
      location: "Blekinge",
      advertiserType: "Privat",
      imageUrls: ["https://images.unsplash.com/photo-1485965120184-e220f721d03e?q=80&w=600&auto=format&fit=crop"],
      categoryId: randomCategory.id,
      authorId: user.id
    }
  ];

  for (const ad of adsData) {
    await prisma.ad.create({
      data: ad
    });
  }

  console.log("Skapade 10 testannonser framgångsrikt!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
