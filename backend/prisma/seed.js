const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password123', salt);

  // Create Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@haqms.com' },
    update: {},
    create: {
      email: 'admin@haqms.com',
      password: hashedPassword,
      name: 'System Admin',
      role: 'ADMIN',
    },
  });

  // Create Receptionist
  const receptionist = await prisma.user.upsert({
    where: { email: 'reception1@haqms.com' },
    update: {},
    create: {
      email: 'reception1@haqms.com',
      password: hashedPassword,
      name: 'Reception Staff',
      role: 'RECEPTIONIST',
    },
  });

  // Create Doctor user
  const doctorUser = await prisma.user.upsert({
    where: { email: 'doctor1@haqms.com' },
    update: {},
    create: {
      email: 'doctor1@haqms.com',
      password: hashedPassword,
      name: 'Dr. John Smith',
      role: 'DOCTOR',
    },
  });

  // Create Doctor profile
  const doctor = await prisma.doctor.upsert({
    where: { userId: doctorUser.id },
    update: {},
    create: {
      userId: doctorUser.id,
      name: 'Dr. John Smith',
      specialization: 'General Medicine',
      department: 'General',
      experience: 10,
      consultationFee: 150,
    },
  });

  // Create sample patients
  const patients = await Promise.all([
    prisma.patient.upsert({
      where: { id: 'patient-bruce' },
      update: {},
      create: {
        id: 'patient-bruce',
        name: 'Bruce Wayne',
        email: 'bruce@wayne.com',
        phoneNumber: '555-0101',
        age: 35,
        gender: 'Male',
        medicalHistory: null,
      },
    }),
    prisma.patient.upsert({
      where: { id: 'patient-clark' },
      update: {},
      create: {
        id: 'patient-clark',
        name: 'Clark Kent',
        email: 'clark@dailyplanet.com',
        phoneNumber: '555-0102',
        age: 33,
        gender: 'Male',
        medicalHistory: null,
      },
    }),
    prisma.patient.upsert({
      where: { id: 'patient-diana' },
      update: {},
      create: {
        id: 'patient-diana',
        name: 'Diana Prince',
        email: 'diana@themyscira.com',
        phoneNumber: '555-0103',
        age: 30,
        gender: 'Female',
        medicalHistory: 'No known allergies. Regular checkups.',
      },
    }),
  ]);

  // Create sample appointments
  await prisma.appointment.createMany({
    skipDuplicates: true,
    data: [
      {
        patientId: patients[0].id,
        doctorId: doctor.id,
        appointmentDate: new Date(),
        reason: 'Regular checkup',
        status: 'PENDING',
      },
      {
        patientId: patients[2].id,
        doctorId: doctor.id,
        appointmentDate: new Date(),
        reason: 'Follow-up consultation',
        status: 'PENDING',
      },
    ],
  });

  console.log('✅ Database seeded successfully!');
  console.log('Login credentials (all passwords: password123):');
  console.log('  Admin:        admin@haqms.com');
  console.log('  Receptionist: reception1@haqms.com');
  console.log('  Doctor:       doctor1@haqms.com');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });