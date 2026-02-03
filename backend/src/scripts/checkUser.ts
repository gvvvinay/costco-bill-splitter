import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUser() {
  const user = await prisma.user.findFirst({
    where: { email: 'test@example.com' }
  });
  
  if (user) {
    console.log('✅ Test user exists:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Username: ${user.username}`);
    console.log(`   ID: ${user.id}`);
  } else {
    console.log('❌ Test user not found!');
  }
  
  await prisma.$disconnect();
}

checkUser();
