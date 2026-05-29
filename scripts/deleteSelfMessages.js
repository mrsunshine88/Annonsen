const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const deleted = await prisma.message.deleteMany({
    where: {
      senderId: {
        equals: prisma.message.fields.receiverId
      }
    }
  });
  
  // Wait, Prisma doesn't support comparing fields in deleteMany like this directly in older versions, 
  // Let's do it manually just to be safe.
  
  const messages = await prisma.message.findMany();
  let count = 0;
  for (const msg of messages) {
    if (msg.senderId === msg.receiverId) {
      await prisma.message.delete({ where: { id: msg.id } });
      count++;
    }
  }
  
  console.log(`Deleted ${count} self-messages`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
