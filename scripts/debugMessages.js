const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const unread = await prisma.message.findMany({
    where: { isRead: false }
  });
  console.log("Unread messages total:", unread.length);
  
  const result = await prisma.message.updateMany({
    where: { isJobMessage: true },
    data: { isRead: true }
  });
  console.log(`Marked ${result.count} job messages as read.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
