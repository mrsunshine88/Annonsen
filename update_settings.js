const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const settings = await prisma.settings.update({ 
    where: { id: "default" },
    data: { paymentsEnabled: true }
  });
  console.log("Updated Settings:", settings);
}
main().catch(console.error).finally(() => prisma.$disconnect());
