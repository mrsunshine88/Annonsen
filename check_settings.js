const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const settings = await prisma.settings.findUnique({ where: { id: "default" } });
  console.log("Settings:", settings);
}
main().catch(console.error).finally(() => prisma.$disconnect());
