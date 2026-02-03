import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupDatabase() {
  try {
    console.log('🔍 Starting database cleanup...\n');

    // ============ CLEANUP USERS ============
    console.log('👤 Cleaning up users...');
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'asc' }
    });

    console.log(`   📊 Found ${users.length} users\n`);

    let toDeleteUsers: string[] = [];
    let usernamesGenerated = 0;

    if (users.length > 0) {
      // Track usernames we've seen
      const seenUsernames = new Set<string>();

      // Find duplicates
      for (const user of users) {
        const lowerUsername = user.username.toLowerCase();
        
        if (seenUsernames.has(lowerUsername)) {
          console.log(`   ⚠️  Duplicate username: "${user.username}" (${user.email})`);
          toDeleteUsers.push(user.id);
        } else {
          seenUsernames.add(lowerUsername);
        }
      }

      // Delete duplicate users
      if (toDeleteUsers.length > 0) {
        console.log(`   🗑️  Deleting ${toDeleteUsers.length} duplicate user(s)\n`);
        for (const userId of toDeleteUsers) {
          const user = users.find(u => u.id === userId);
          console.log(`      ❌ Deleting: ${user?.email}`);
          await prisma.user.delete({ where: { id: userId } });
        }
      }

      // Ensure all usernames are lowercase and set
      const updatedUsers = await prisma.user.findMany();

      for (const user of updatedUsers) {
        if (!user.username || user.username.trim() === '') {
          const newUsername = user.email.split('@')[0] + '_' + user.id.substring(0, 4);
          await prisma.user.update({
            where: { id: user.id },
            data: { username: newUsername.toLowerCase() }
          });
          usernamesGenerated++;
        }
      }

      if (usernamesGenerated > 0) {
        console.log(`   ✅ Generated ${usernamesGenerated} username(s)\n`);
      }
    }

    // ============ CLEANUP SESSIONS ============
    console.log('📋 Cleaning up sessions...');
    const sessions = await prisma.billSplitSession.findMany({
      include: {
        lineItems: true,
        participants: true,
        settlements: true
      }
    });

    console.log(`   📊 Found ${sessions.length} sessions\n`);

    const toDeleteSessions: string[] = [];
    let emptyCount = 0;
    let noItemsCount = 0;
    let noParticipantsCount = 0;

    for (const session of sessions) {
      let shouldDelete = false;
      let reason = '';

      // Delete if completely empty (no items AND no participants)
      if (session.lineItems.length === 0 && session.participants.length === 0) {
        shouldDelete = true;
        reason = 'no items or participants';
        emptyCount++;
      }
      // Delete if has participants but no line items (incomplete)
      else if (session.lineItems.length === 0 && session.participants.length > 0) {
        shouldDelete = true;
        reason = 'no items added';
        noItemsCount++;
      }
      // Delete if has line items but no participants (incomplete)
      else if (session.lineItems.length > 0 && session.participants.length === 0) {
        shouldDelete = true;
        reason = 'no participants assigned';
        noParticipantsCount++;
      }

      if (shouldDelete) {
        console.log(`   ⚠️  "${session.name}" - ${reason}`);
        toDeleteSessions.push(session.id);
      }
    }

    // Delete incomplete sessions
    if (toDeleteSessions.length > 0) {
      console.log(`\n   🗑️  Deleting ${toDeleteSessions.length} incomplete session(s)\n`);
      for (const sessionId of toDeleteSessions) {
        const session = sessions.find(s => s.id === sessionId);
        console.log(`      ❌ Deleting: "${session?.name}"`);
        await prisma.billSplitSession.delete({ where: { id: sessionId } });
      }
    }

    // Summary
    console.log(`\n✅ Cleanup complete!\n`);
    console.log(`📊 User cleanup:`);
    console.log(`   - Duplicate users deleted: ${toDeleteUsers?.length || 0}`);
    console.log(`   - Usernames generated: ${usernamesGenerated || 0}\n`);
    console.log(`📊 Session cleanup:`);
    console.log(`   - Completely empty sessions: ${emptyCount}`);
    console.log(`   - Sessions with no items: ${noItemsCount}`);
    console.log(`   - Sessions with no participants: ${noParticipantsCount}`);
    console.log(`   - Total sessions deleted: ${toDeleteSessions.length}\n`);

    const remainingSessions = await prisma.billSplitSession.count();
    const remainingUsers = await prisma.user.count();
    console.log(`📈 Database now contains:`);
    console.log(`   - Users: ${remainingUsers}`);
    console.log(`   - Sessions: ${remainingSessions}`);

  } catch (error) {
    console.error('❌ Cleanup error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupDatabase();
