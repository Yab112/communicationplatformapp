const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcrypt');

async function main() {
  const prisma = new PrismaClient();

  try {
    const hashedPassword = await hash('password123', 10);

    // Create test users
    const user1 = await prisma.user.create({
      data: {
        name: 'John Doe',
        email: 'john@example.com',
        password: hashedPassword,
        role: 'student',
        department: 'Computer Science',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
      },
    });

    const user2 = await prisma.user.create({
      data: {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: hashedPassword,
        role: 'student',
        department: 'Computer Science',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
      },
    });

    // Create test posts
    const post1 = await prisma.post.create({
      data: {
        content: 'This is my first post!',
        department: 'Computer Science',
        authorId: user1.id,
      },
    });

    const post2 = await prisma.post.create({
      data: {
        content: 'Hello everyone!',
        department: 'Computer Science',
        authorId: user2.id,
      },
    });

    // Create test comments
    const comment1 = await prisma.comment.create({
      data: {
        content: 'Great post!',
        postId: post1.id,
        authorId: user2.id,
      },
    });

    const comment2 = await prisma.comment.create({
      data: {
        content: 'Thanks for sharing!',
        postId: post2.id,
        authorId: user1.id,
      },
    });

    // Add reactions to comments
    await prisma.commentReaction.create({
      data: {
        type: 'LIKE',
        commentId: comment1.id,
        userId: user1.id,
      },
    });

    await prisma.commentReaction.create({
      data: {
        type: 'LOVE',
        commentId: comment2.id,
        userId: user2.id,
      },
    });

    // Add likes to posts
    await prisma.like.create({
      data: {
        postId: post1.id,
        userId: user2.id,
      },
    });

    await prisma.like.create({
      data: {
        postId: post2.id,
        userId: user1.id,
      },
    });

    console.log('Seed data created successfully!');
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
