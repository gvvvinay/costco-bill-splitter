import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🧹 Starting user cleanup...\n');

    // Find users who cannot login (no password)
    const usersWithoutPassword = await prisma.user.findMany({
      where: {
        password: null
      },
      select: {
        id: true,
        username: true,
        email: true,
        authProvider: true,
        _count: {
          select: {
            sessions: true
          }
        }
      }
    });

    console.log(`📊 Found ${usersWithoutPassword.length} users without password:`);
    usersWithoutPassword.forEach(user => {
      console.log(`   - ${user.username} (${user.email}) [${user.authProvider}] - ${user._count.sessions} sessions`);
    });

    if (usersWithoutPassword.length > 0) {
      console.log('\n⚠️  These users cannot login via username/password.');
      console.log('   Attempting to delete them and their sessions...\n');

      // First, find their session IDs and delete all related data
      const sessionsToDelete = await prisma.billSplitSession.findMany({
        where: {
          user: {
            password: null
          }
        },
        select: {
          id: true
        }
      });

      console.log(`   Deleting ${sessionsToDelete.length} sessions...`);

      // Delete all sessions (cascades to participants, items, assignments)
      for (const session of sessionsToDelete) {
        await prisma.billSplitSession.delete({
          where: { id: session.id }
        });
      }

      // Now delete the users
      const deleteResult = await prisma.user.deleteMany({
        where: {
          password: null
        }
      });

      console.log(`✅ Deleted ${deleteResult.count} users without passwords`);
    } else {
      console.log('✅ No users without passwords found.');
    }

    // Show remaining users
    const remainingUsers = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        authProvider: true,
        createdAt: true,
        _count: {
          select: {
            sessions: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`\n📋 ${remainingUsers.length} users remaining:`);
    remainingUsers.forEach(user => {
      console.log(`   ✓ @${user.username} (${user.email}) - ${user._count.sessions} sessions`);
    });

  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
