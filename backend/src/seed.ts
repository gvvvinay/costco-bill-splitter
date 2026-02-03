import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create test user
  const hashedPassword = await bcrypt.hash('password123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      username: 'testuser',
      password: hashedPassword
    }
  });

  console.log('✅ Created test user:', user.email);

  // Create a sample session
  const session = await prisma.billSplitSession.create({
    data: {
      name: 'Sample Bill Split',
      userId: user.id,
      totalAmount: 156.78,
      taxAmount: 12.34
    }
  });

  console.log('✅ Created sample session:', session.name);

  // Create participants
  const alice = await prisma.participant.create({
    data: {
      name: 'Alice',
      sessionId: session.id
    }
  });

  const bob = await prisma.participant.create({
    data: {
      name: 'Bob',
      sessionId: session.id
    }
  });

  const charlie = await prisma.participant.create({
    data: {
      name: 'Charlie',
      sessionId: session.id
    }
  });

  console.log('✅ Created participants: Alice, Bob, Charlie');

  // Create sample line items
  const items = [
    { name: 'Organic Milk 2-Pack', quantity: 1, price: 8.99, taxable: false },
    { name: 'Rotisserie Chicken', quantity: 2, price: 9.98, taxable: false },
    { name: 'Paper Towels 12-Pack', quantity: 1, price: 24.99, taxable: true },
    { name: 'Mixed Nuts 2.5lb', quantity: 1, price: 19.99, taxable: false },
    { name: 'Laundry Detergent', quantity: 1, price: 18.99, taxable: true },
    { name: 'Kirkland Olive Oil', quantity: 1, price: 22.99, taxable: false },
    { name: 'Fresh Strawberries', quantity: 2, price: 11.98, taxable: false },
    { name: 'Ground Beef 5lb', quantity: 1, price: 28.99, taxable: false }
  ];

  const lineItems = await Promise.all(
    items.map((item, index) =>
      prisma.lineItem.create({
        data: {
          sessionId: session.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          taxable: item.taxable,
          orderIndex: index
        }
      })
    )
  );

  console.log(`✅ Created ${lineItems.length} line items`);

  // Create some sample assignments
  await prisma.itemAssignment.createMany({
    data: [
      { lineItemId: lineItems[0].id, participantId: alice.id }, // Milk - Alice
      { lineItemId: lineItems[1].id, participantId: alice.id }, // Chicken - Alice & Bob
      { lineItemId: lineItems[1].id, participantId: bob.id },
      { lineItemId: lineItems[2].id, participantId: bob.id }, // Paper Towels - Bob & Charlie
      { lineItemId: lineItems[2].id, participantId: charlie.id },
      { lineItemId: lineItems[3].id, participantId: alice.id }, // Nuts - All three
      { lineItemId: lineItems[3].id, participantId: bob.id },
      { lineItemId: lineItems[3].id, participantId: charlie.id }
    ]
  });

  console.log('✅ Created sample assignments');
  console.log('\n🎉 Seed completed!');
  console.log('\nTest credentials:');
  console.log('  Email: test@example.com');
  console.log('  Username: testuser');
  console.log('  Password: password123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
