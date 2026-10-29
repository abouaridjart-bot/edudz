import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const owner = await prisma.user.findFirst({
    where: { email: "owner@demo.edudz.dz" }
  });
  
  console.log("Owner user:", JSON.stringify(owner, null, 2));
  
  const sessionUsers = await prisma.user.count({
    where: { isActive: true }
  });
  
  console.log("Active users:", sessionUsers);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
