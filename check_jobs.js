const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const jobs = await prisma.jobAd.findMany({
    where: {
      author: {
        OR: [
          { accountType: "Privat" },
          { 
            accountType: { in: ["Företag", "Arbetsgivare"] },
            companyPageApproved: true 
          }
        ]
      }
    }
  });
  console.log(jobs);
}

main().finally(() => prisma.$disconnect());
