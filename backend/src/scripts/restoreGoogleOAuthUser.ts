import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔄 Restoring Google OAuth user setup...\n");

  // Delete the password-based user (testuser)
  const passwordUser = await prisma.user.findUnique({
    where: { username: "testuser" },
    include: {
      sessions: true,
      globalParticipants: true,
    },
  });

  if (passwordUser) {
    console.log(`🗑️ Deleting password-based user: @${passwordUser.username}`);
    console.log(
      `   - Sessions: ${passwordUser.sessions.length} (will cascade delete)`
    );
    console.log(
      `   - Global Participants: ${passwordUser.globalParticipants.length}`
    );

    // Delete all global participants first (they reference this user)
    await prisma.globalParticipant.deleteMany({
      where: { userId: passwordUser.id },
    });

    // Delete all sessions (they reference this user and have cascade to other models)
    await prisma.billSplitSession.deleteMany({
      where: { userId: passwordUser.id },
    });

    // Delete user
    await prisma.user.delete({
      where: { id: passwordUser.id },
    });

    console.log(`✅ Deleted @${passwordUser.username}\n`);
  }

  // Now restore the Google OAuth user
  const googleUser = await prisma.user.create({
    data: {
      username: "vinay",
      email: "callmegvv@gmail.com",
      password: null,
      authProvider: "google",
    },
  });

  console.log(`✅ Restored Google OAuth user: @${googleUser.username}`);
  console.log(
    `   - Email: ${googleUser.email}\n   - Auth Provider: ${googleUser.authProvider}\n`
  );

  // Show remaining users
  const allUsers = await prisma.user.findMany({
    include: { sessions: { select: { id: true } } },
  });

  console.log("📋 Users remaining:");
  allUsers.forEach((user) => {
    const authMethod = user.authProvider ? `[${user.authProvider}]` : `[password]`;
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
