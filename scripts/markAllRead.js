const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.message.updateMany({
    where: { isRead: false },
    data: { isRead: true }
  });
  console.log(`Marked ${result.count} messages as read.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
