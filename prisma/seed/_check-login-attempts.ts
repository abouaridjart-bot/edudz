const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const identifier = 'owner@demo.edudz.dz';
const since = new Date(Date.now() - 15 * 60 * 1000);

prisma.loginAttempt.count({
  where: {
    identifier: identifier.toLowerCase(),
    success: false,
    createdAt: { gte: since }
  }
}).then((c: number) => {
  console.log('Failed attempts:', c);
  prisma.$disconnect();
});