const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function setRoot() {
  const email = "apersson508@gmail.com";
  const user = await prisma.user.update({
    where: { email },
    data: { isRoot: true, isAdmin: true }
  });
  console.log("Satte användare som Root:", user.email);
}

setRoot().catch(console.error).finally(() => prisma.$disconnect());
