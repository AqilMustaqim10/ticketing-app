/**
 * Database Seeder Script
 *
 * Populates initial Business Units (CCEC, FNB, HOTEL), Departments,
 * and test accounts for ADMIN, AGENT, and USER roles with bcrypt hashing.
 */

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // Clear existing data to prevent unique constraint conflicts during re-seeds
  await prisma.ticket.deleteMany();
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();
  await prisma.businessUnit.deleteMany();

  // 1. Create Business Units
  const ccecBU = await prisma.businessUnit.create({
    data: { name: "Convention Centre Exhibition Complex", code: "CCEC" },
  });

  const fnbBU = await prisma.businessUnit.create({
    data: { name: "Food & Beverage Operations", code: "FNB" },
  });

  const hotelBU = await prisma.businessUnit.create({
    data: { name: "Hospitality & Hotel Services", code: "HOTEL" },
  });

  console.log("✅ Created Business Units: CCEC, FNB, HOTEL");

  // 2. Create Departments for each Business Unit
  const ccecItDept = await prisma.department.create({
    data: { name: "IT Support", code: "CCEC-IT", businessUnitId: ccecBU.id },
  });

  const fnbItDept = await prisma.department.create({
    data: { name: "IT Support", code: "FNB-IT", businessUnitId: fnbBU.id },
  });

  const hotelItDept = await prisma.department.create({
    data: { name: "IT Support", code: "HOTEL-IT", businessUnitId: hotelBU.id },
  });

  console.log("✅ Created Departments for each Business Unit");

  // Common password hash for test accounts (Password: "Password123!")
  const hashedPassword = await bcrypt.hash("Password123!", 10);

  // 3. Create Users with RBAC Roles
  // Global Administrator
  await prisma.user.create({
    data: {
      username: "admin",
      password: hashedPassword,
      fullName: "Global Administrator",
      role: "ADMIN",
      businessUnitId: ccecBU.id,
      departmentId: ccecItDept.id,
    },
  });

  // CCEC Agent
  await prisma.user.create({
    data: {
      username: "ccec_agent",
      password: hashedPassword,
      fullName: "CCEC IT Support Agent",
      role: "AGENT",
      businessUnitId: ccecBU.id,
      departmentId: ccecItDept.id,
    },
  });

  // FNB Agent
  await prisma.user.create({
    data: {
      username: "fnb_agent",
      password: hashedPassword,
      fullName: "FNB IT Support Agent",
      role: "AGENT",
      businessUnitId: fnbBU.id,
      departmentId: fnbItDept.id,
    },
  });

  // HOTEL Agent
  await prisma.user.create({
    data: {
      username: "hotel_agent",
      password: hashedPassword,
      fullName: "Hotel IT Support Agent",
      role: "AGENT",
      businessUnitId: hotelBU.id,
      departmentId: hotelItDept.id,
    },
  });

  // Regular Staff User (CCEC)
  await prisma.user.create({
    data: {
      username: "ccec_staff",
      password: hashedPassword,
      fullName: "CCEC Operations Staff",
      role: "USER",
      businessUnitId: ccecBU.id,
      departmentId: ccecItDept.id,
    },
  });

  console.log("✅ Created initial multi-BU users (admin, agents, staff)");
  console.log("🌱 Seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error("❌ Error during database seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
