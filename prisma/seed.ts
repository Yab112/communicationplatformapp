const { PrismaClient } = require("@prisma/client");
const { hash } = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  const userImage =
    "https://mzu9vrsandgfpykj.public.blob.vercel-storage.com/cmb3ud4040000u2wc3j4u8d4i-1748250877870-7tEHPHSHhFp1WY8E4xoJpKjHwQVwOb.jpg";
  const hashedPassword = await hash("password123", 10);

  // Create users
 

  const teacher1 = await prisma.user.upsert({
    where: { email: "teacher1@example.com" },
    update: {},
    create: {
      email: "teacher1@example.com",
      name: "Alice Johnson",
      password: hashedPassword,
      role: "teacher",
      department: "Computer Science",
      image: userImage,
    },
  });

  const teacher2 = await prisma.user.upsert({
    where: { email: "teacher2@example.com" },
    update: {},
    create: {
      email: "teacher2@example.com",
      name: "Bob Smith",
      password: hashedPassword,
      role: "teacher",
      department: "Mathematics",
      image: userImage,
    },
  });

  await Promise.all([
    prisma.user.upsert({
      where: { email: "student1@example.com" },
      update: {},
      create: {
        email: "student1@example.com",
        name: "Charlie Brown",
        password: hashedPassword,
        role: "student",
        department: "Computer Science",
        image: userImage,
      },
    }),
    prisma.user.upsert({
      where: { email: "student2@example.com" },
      update: {},
      create: {
        email: "student2@example.com",
        name: "Diana Prince",
        password: hashedPassword,
        role: "student",
        department: "Mathematics",
        image: userImage,
      },
    }),
    prisma.user.upsert({
      where: { email: "student3@example.com" },
      update: {},
      create: {
        email: "student3@example.com",
        name: "Ethan Hunt",
        password: hashedPassword,
        role: "student",
        department: "Physics",
        image: userImage,
      },
    }),
    prisma.user.upsert({
      where: { email: "student4@example.com" },
      update: {},
      create: {
        email: "student4@example.com",
        name: "Fiona Gallagher",
        password: hashedPassword,
        role: "student",
        department: "Chemistry",
        image: userImage,
      },
    }),
  ]);

  // Create posts with multiple media
  await prisma.post.create({
    data: {
      content:
        "Announcement: Welcome to the new semester! Please check the attached videos for orientation and the images for campus map and schedule.",
      authorId: teacher1.id,
      department: "Computer Science",
      media: {
        create: [
          {
            type: "video",
            url: "https://mzu9vrsandgfpykj.public.blob.vercel-storage.com/cmamuvhcx0000u29svbsykujr-1748097973847-6706912-hd_1920_1080_25fps.mp4",
            order: 0,
          },
          {
            type: "video",
            url: "https://mzu9vrsandgfpykj.public.blob.vercel-storage.com/cmamuvhcx0000u29svbsykujr-1748104471290-zXn8h9K8SNKyEZF0wLmciSGyoLCA5p.mp4",
            order: 1,
          },
          {
            type: "image",
            url: "https://mzu9vrsandgfpykj.public.blob.vercel-storage.com/cmamuvhcx0000u29svbsykujr-1748173495662-41B9WYm9pPNu0scyZsbeZu5ztMiFzQ.jpg",
            order: 2,
          },
          {
            type: "image",
            url: "https://mzu9vrsandgfpykj.public.blob.vercel-storage.com/cmb3ud4040000u2wc3j4u8d4i-1748242772785-IalYYleEIL0oSzQYcthKjyflDOqjvA.jpg",
            order: 3,
          },
        ],
      },
    },
  });

  await prisma.post.create({
    data: {
      content:
        "Announcement: Midterm exams will be held next month. Please review the attached materials and videos for preparation tips.",
      authorId: teacher2.id,
      department: "Mathematics",
      media: {
        create: [
          {
            type: "image",
            url: "https://mzu9vrsandgfpykj.public.blob.vercel-storage.com/cmamuvhcx0000u29svbsykujr-1748173495662-41B9WYm9pPNu0scyZsbeZu5ztMiFzQ.jpg",
            order: 0,
          },
          {
            type: "image",
            url: "https://mzu9vrsandgfpykj.public.blob.vercel-storage.com/cmb3ud4040000u2wc3j4u8d4i-1748242772785-IalYYleEIL0oSzQYcthKjyflDOqjvA.jpg",
            order: 1,
          },
          {
            type: "video",
            url: "https://mzu9vrsandgfpykj.public.blob.vercel-storage.com/cmamuvhcx0000u29svbsykujr-1748097973847-6706912-hd_1920_1080_25fps.mp4",
            order: 2,
          },
        ],
      },
    },
  });

  // Create resources
  await prisma.resource.create({
    data: {
      title: "Advanced Algorithms Lecture Notes",
      description:
        "Comprehensive lecture notes covering advanced algorithms, including graph theory, dynamic programming, and complexity analysis. Perfect for exam preparation and project reference.",
      type: "pdf",
      url: "https://mzu9vrsandgfpykj.public.blob.vercel-storage.com/cmb3ud4040000u2wc3j4u8d4i-1748291903813-XudBhZ5s9IW2kWrimR53ki38nNhVWx.pdf",
      authorId: teacher1.id,
      department: "Computer Science",
      tags: ["algorithms", "lecture", "notes", "advanced"],
      subject: "Algorithms",
      fileType: "pdf",
      fileSize: 2048000,
    },
  });

  await prisma.resource.create({
    data: {
      title: "Mathematics Assignment Template",
      description:
        "A well-structured DOCX template for submitting mathematics assignments. Includes formatting guidelines and example problems to help students organize their work.",
      type: "docx",
      url: "https://mzu9vrsandgfpykj.public.blob.vercel-storage.com/cmb3ud4040000u2wc3j4u8d4i-1748387703033-PrxWsVmZQO8fLAPT1Y9osajswfMLrw.docx",
      authorId: teacher2.id,
      department: "Mathematics",
      tags: ["assignment", "template", "mathematics"],
      subject: "Mathematics",
      fileType: "docx",
      fileSize: 512000,
    },
  });

  console.log("Seed data created successfully!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
