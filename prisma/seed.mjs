import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Clean existing records (in order of relations)
  await prisma.reservation.deleteMany();
  await prisma.resource.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();

  // 2. Create Departments
  const eng = await prisma.department.create({
    data: { name: "Software Engineering", code: "ENG" },
  });
  const design = await prisma.department.create({
    data: { name: "Product & UI/UX", code: "DES" },
  });
  const ops = await prisma.department.create({
    data: { name: "Quality Assurance & Ops", code: "OPS" },
  });

  // 3. Create Users
  const user1 = await prisma.user.create({
    data: {
      name: "Kasun Perera",
      email: "kasun.perera@primewave.com",
      role: "ADMIN",
      departmentId: eng.id,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: "Nadeesha Silva",
      email: "nadeesha.s@primewave.com",
      role: "MEMBER",
      departmentId: design.id,
    },
  });

  const user3 = await prisma.user.create({
    data: {
      name: "Dineth Fernando",
      email: "dineth.f@primewave.com",
      role: "MEMBER",
      departmentId: ops.id,
    },
  });

  // 4. Create Categories
  const catMeeting = await prisma.category.create({
    data: { name: "Meeting & Conference Rooms", icon: "Users" },
  });
  const catHardware = await prisma.category.create({
    data: { name: "Hardware & Testing Gear", icon: "Cpu" },
  });
  const catCreative = await prisma.category.create({
    data: { name: "Creative & Media Studios", icon: "Video" },
  });
  const catDevices = await prisma.category.create({
    data: { name: "Specialized Equipment", icon: "Wrench" },
  });

  // 5. Create Resources
  const r1 = await prisma.resource.create({
    data: {
      name: "Boardroom Alpha (Executive)",
      categoryId: catMeeting.id,
      location: "Level 4, North Wing",
      capacity: 18,
      status: "ACTIVE",
      description: "Large conference room equipped with 4K Dual Screens, Zoom Rooms kit, and conference phone.",
    },
  });

  const r2 = await prisma.resource.create({
    data: {
      name: "Sprint Collaboration Room B",
      categoryId: catMeeting.id,
      location: "Level 3, Dev Wing",
      capacity: 8,
      status: "ACTIVE",
      description: "Ideal for daily standups, sprint reviews, and whiteboarding sessions.",
    },
  });

  const r3 = await prisma.resource.create({
    data: {
      name: "Rapid 3D Prototyper Mark 2",
      categoryId: catDevices.id,
      location: "Ground Floor, FabLab",
      capacity: 2,
      status: "ACTIVE",
      description: "High-precision resin 3D printer for mechanical and casing prototypes.",
    },
  });

  const r4 = await prisma.resource.create({
    data: {
      name: "RF & Oscilloscope Test Station",
      categoryId: catHardware.id,
      location: "Level 2, Embedded Systems Lab",
      capacity: 4,
      status: "ACTIVE",
      description: "Bench calibrated with Keysight Digital Storage Oscilloscope, Spectrum Analyzer, and variable DC PSU.",
    },
  });

  const r5 = await prisma.resource.create({
    data: {
      name: "Podcast & AV Recording Studio",
      categoryId: catCreative.id,
      location: "Level 1, Media Wing",
      capacity: 4,
      status: "ACTIVE",
      description: "Acoustically treated studio with 4x Shure SM7B microphones and Blackmagic 4K studio cameras.",
    },
  });

  const r6 = await prisma.resource.create({
    data: {
      name: "Deep Learning GPU Workstation (4x RTX 4090)",
      categoryId: catHardware.id,
      location: "Server Room A, Rack 04",
      capacity: 1,
      status: "ACTIVE",
      description: "Dedicated high-compute machine for model training and local inference benchmarking.",
    },
  });

  // 6. Create Seed Reservations for Today
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0, 0);
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 11, 30, 0);

  const afternoonStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 14, 0, 0);
  const afternoonEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 16, 0, 0);

  const tomorrowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 9, 30, 0);
  const tomorrowEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 11, 0, 0);

  await prisma.reservation.create({
    data: {
      resourceId: r1.id,
      userId: user1.id,
      title: "Q4 Roadmap & Architecture Review",
      startTime: todayStart,
      endTime: todayEnd,
      status: "CONFIRMED",
      notes: "Bringing remote team via Zoom Room.",
    },
  });

  await prisma.reservation.create({
    data: {
      resourceId: r2.id,
      userId: user2.id,
      title: "Design System Workshop",
      startTime: afternoonStart,
      endTime: afternoonEnd,
      status: "CONFIRMED",
      notes: "Figma design token synchronization.",
    },
  });

  await prisma.reservation.create({
    data: {
      resourceId: r4.id,
      userId: user3.id,
      title: "IoT Firmware Signal Integrity Testing",
      startTime: tomorrowStart,
      endTime: tomorrowEnd,
      status: "CONFIRMED",
      notes: "Testing rev 2.1 prototype boards.",
    },
  });

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
