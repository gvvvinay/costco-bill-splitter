import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("👤 Adding test user...\n");

  // Check if testuser already exists
  const existingUser = await prisma.user.findUnique({
    where: { username: "testuser" },
  });

  if (existingUser) {
    console.log("⚠️ testuser already exists");
  } else {
    // Create testuser with password
    const hashedPassword = await bcrypt.hash("password123", 10);
    const testUser = await prisma.user.create({
      data: {
        username: "testuser",
        email: "test@example.com",
        password: hashedPassword,
        authProvider: "local",
      },
    });

    console.log(`✅ Created testuser`);
    console.log(`   - Username: @${testUser.username}`);
    console.log(`   - Email: ${testUser.email}`);
    console.log(`   - Auth: Password-based\n`);
  }

  // Show all users
  const allUsers = await prisma.user.findMany({
    include: { sessions: { select: { id: true } } },
  });

  console.log("📋 All users:");
  allUsers.forEach((user) => {
    const authMethod = user.authProvider === "google" ? `[${user.authProvider}]` : `[password]`;
    console.log(
      `   ✓ @${user.username} (${user.email}) ${authMethod} - ${user.sessions.length} sessions`
    );
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
