import { PrismaClient } from "@prisma/client";
import { verifyPassword } from "../../src/lib/password";

const prisma = new PrismaClient();

async function main() {
  const owner = await prisma.user.findFirst({
    where: { email: "owner@demo.edudz.dz" }
  });
  
  if (!owner) {
    console.log("User not found");
    return;
  }
  
  const password = "Demo12345";
  const isValid = await verifyPassword(owner.passwordHash, password);
  
  console.log("Password valid:", isValid);
  console.log("Password hash:", owner.passwordHash);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
