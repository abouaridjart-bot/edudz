import { PrismaClient, Role } from "@prisma/client";
import { hashPassword } from "../../src/lib/password";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const phone = process.env.ADMIN_PHONE;
  const password = process.env.ADMIN_PASSWORD;

  if (!password) {
    console.log("ADMIN_PASSWORD not set, skipping admin seed");
    return;
  }

  if (!email && !phone) {
    console.log("ADMIN_EMAIL or ADMIN_PHONE not set, skipping admin seed");
    return;
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.upsert({
    where: email ? { email } : { phone: phone! },
    update: {
      passwordHash,
      role: Role.SUPER_ADMIN,
      isActive: true,
      deletedAt: null,
    },
    create: {
      email,
      phone,
      passwordHash,
      role: Role.SUPER_ADMIN,
      fullName: "مشرف عام",
      isActive: true,
    },
  });

  console.log(`Admin user created/updated: ${user.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
