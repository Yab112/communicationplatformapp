const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcrypt');

async function main() {
  const prisma = new PrismaClient();

  try {
    const hashedPassword = await hash('password123', 10);

    // Upsert admin user
    const admin = await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {},
      create: {
        name: 'Admin User',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
        department: 'Administration',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
      },
    });

    // Upsert teacher user
    const teacher = await prisma.user.upsert({
      where: { email: 'teacher@example.com' },
      update: {},
      create: {
        name: 'Professor Smith',
        email: 'teacher@example.com',
        password: hashedPassword,
        role: 'teacher',
        department: 'Computer Science',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Teacher',
      },
    });

    // Upsert student users
    const user1 = await prisma.user.upsert({
      where: { email: 'john@example.com' },
      update: {},
      create: {
        name: 'John Doe',
        email: 'john@example.com',
        password: hashedPassword,
        role: 'student',
        department: 'Computer Science',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
      },
    });

    const user2 = await prisma.user.upsert({
      where: { email: 'jane@example.com' },
      update: {},
      create: {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: hashedPassword,
        role: 'student',
        department: 'Computer Science',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
      },
    });

    // You can also use `upsert` for posts, comments, etc., if you have unique constraints

    console.log('Seed data created/updated successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
