import { PrismaClient } from "@prisma/client";

import { schemaStatements } from "../prisma/schema-sql";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  for (const statement of schemaStatements) {
    await prisma.$executeRawUnsafe(statement);
  }

  console.log("Migrate schema SQLite thành công.");
}

main()
  .catch((error) => {
    console.error("Migrate schema thất bại:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
