import { PrismaClient } from "@prisma/client";
import * as crypto from "crypto";

const prisma = new PrismaClient();

const TEST_USER = {
  id: "00000000-0000-0000-0000-000000000001",
  email: "test@localhost",
  name: "Test User",
};

function generateApiToken(): string {
  const uuid = crypto.randomUUID().replace(/-/g, "");
  return `rb_${uuid}`;
}

function hashApiToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("base64");
}

async function main() {
  console.log("Creating test user and API token...\n");

  // Create or update test user
  const user = await prisma.user.upsert({
    where: { email: TEST_USER.email },
    create: {
      id: TEST_USER.id,
      email: TEST_USER.email,
      name: TEST_USER.name,
    },
    update: {
      name: TEST_USER.name,
    },
  });

  console.log(`User: ${user.email} (${user.id})`);

  // Generate new API token
  const token = generateApiToken();
  const tokenHash = hashApiToken(token);

  // Delete existing test tokens for this user
  await prisma.apiToken.deleteMany({
    where: {
      userId: user.id,
      name: "test-token",
    },
  });

  // Create new token
  await prisma.apiToken.create({
    data: {
      userId: user.id,
      name: "test-token",
      tokenHash,
    },
  });

  console.log(`\nAPI Token created successfully!\n`);
  console.log(`Token: ${token}`);
  console.log(`\nAdd this to your .env.local:`);
  console.log(`DEV_API_TOKEN=${token}`);
  console.log(`\nOr use it directly in API requests:`);
  console.log(`Authorization: Bearer ${token}`);
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
