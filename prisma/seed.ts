const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await hash('password123', 10);

  // Upsert admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'admin',
      department: 'IT',
      image: 'https://mzu9vrsandgfpykj.public.blob.vercel-storage.com/cmamuvhcx0000u29svbsykujr-1747510215433-maru_pic_linkedin.jpg'
    },
  });

  // Create sample posts with multiple media items
  const posts = await Promise.all([
    prisma.post.create({
      data: {
        content: 'Welcome to our platform! This is a sample post with multiple images.',
        authorId: admin.id,
        department: 'IT',
        media: {
          create: [
            {
              type: 'image',
              url: 'https://mzu9vrsandgfpykj.public.blob.vercel-storage.com/cmamuvhcx0000u29svbsykujr-1747510215433-maru_pic_linkedin.jpg',
              order: 0
            },
            {
              type: 'image',
              url: 'https://mzu9vrsandgfpykj.public.blob.vercel-storage.com/cmamuvhcx0000u29svbsykujr-1747258307411-Read%20details.jpg',
              order: 1
            }
          ]
        }
      }
    }),
    prisma.post.create({
      data: {
        content: 'Check out this video tutorial!',
        authorId: admin.id,
        department: 'IT',
        media: {
          create: [
            {
              type: 'video',
              url: 'https://mzu9vrsandgfpykj.public.blob.vercel-storage.com/cmamuvhcx0000u29svbsykujr-1748097973847-6706912-hd_1920_1080_25fps.mp4',
              order: 0
            }
          ]
        }
      }
    }),
    prisma.post.create({
      data: {
        content: 'Another post with multiple images',
        authorId: admin.id,
        department: 'IT',
        media: {
          create: [
            {
              type: 'image',
              url: 'https://mzu9vrsandgfpykj.public.blob.vercel-storage.com/cmad1snzt0000u2ls0w4k18cj-1746652822271-Screenshot%202024-07-20%20120258.png',
              order: 0
            },
            {
              type: 'image',
              url: 'https://mzu9vrsandgfpykj.public.blob.vercel-storage.com/cmad1snzt0000u2ls0w4k18cj-1746981789482-5949623294284120797.jpg',
              order: 1
            }
          ]
        }
      }
    })
  ]);

  // Create a sample resource
  const resource = await prisma.resource.create({
    data: {
      title: 'Redis For Dummies',
      description: 'A comprehensive guide to Redis',
      type: 'pdf',
      url: 'https://mzu9vrsandgfpykj.public.blob.vercel-storage.com/94ce6258-448a-4dcd-af0d-a74b12cde28e-Redis_For_Dummies_Limited_Edition.pdf',
      authorId: admin.id,
      department: 'IT',
      tags: ['redis', 'database', 'tutorial'],
      subject: 'Database Management'
    }
  });

  console.log('Seed data created successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
