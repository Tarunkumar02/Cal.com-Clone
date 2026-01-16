import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing data
  await prisma.bookingAnswer.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.bookingQuestion.deleteMany();
  await prisma.dateOverride.deleteMany();
  await prisma.availabilityRule.deleteMany();
  await prisma.eventType.deleteMany();
  await prisma.availabilitySchedule.deleteMany();
  await prisma.user.deleteMany();

  // Create default admin user
  const adminUser = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@example.com',
      timezone: 'Asia/Kolkata',
    },
  });
  console.log('✅ Created admin user:', adminUser.email);

  // Create availability schedule
  const workingHours = await prisma.availabilitySchedule.create({
    data: {
      userId: adminUser.id,
      name: 'Working Hours',
      timezone: 'Asia/Kolkata',
      isDefault: true,
      availabilityRules: {
        create: [
          // Monday to Friday, 9 AM to 5 PM
          { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' },
          { dayOfWeek: 2, startTime: '09:00', endTime: '17:00' },
          { dayOfWeek: 3, startTime: '09:00', endTime: '17:00' },
          { dayOfWeek: 4, startTime: '09:00', endTime: '17:00' },
          { dayOfWeek: 5, startTime: '09:00', endTime: '17:00' },
          { dayOfWeek: 6, startTime: '10:00', endTime: '14:00' }, // Saturday
        ],
      },
      dateOverrides: {
        create: [
          // Block a specific date (holiday example)
          { date: new Date('2026-01-26'), isBlocked: true },
          // Custom hours for a specific date
          { date: new Date('2026-02-14'), isBlocked: false, startTime: '10:00', endTime: '14:00' },
        ],
      },
    },
  });
  console.log('✅ Created availability schedule:', workingHours.name);

  // Create Event Type 1: 30-minute meeting
  const event30min = await prisma.eventType.create({
    data: {
      userId: adminUser.id,
      title: '30 Minute Meeting',
      description: 'A quick 30-minute call to discuss your needs and answer any questions.',
      slug: '30min',
      duration: 30,
      bufferTimeBefore: 5,
      bufferTimeAfter: 5,
      color: '#6366f1',
      availabilityScheduleId: workingHours.id,
      bookingQuestions: {
        create: [
          { question: 'What would you like to discuss?', type: 'TEXTAREA', isRequired: true, order: 1 },
          { question: 'How did you hear about us?', type: 'SELECT', isRequired: false, options: JSON.stringify(['Google', 'LinkedIn', 'Referral', 'Other']), order: 2 },
        ],
      },
    },
  });
  console.log('✅ Created event type:', event30min.title);

  // Create Event Type 2: 60-minute consultation
  const event60min = await prisma.eventType.create({
    data: {
      userId: adminUser.id,
      title: '60 Minute Consultation',
      description: 'An in-depth consultation session for detailed discussions and planning.',
      slug: '60min-consultation',
      duration: 60,
      bufferTimeBefore: 10,
      bufferTimeAfter: 10,
      color: '#10b981',
      availabilityScheduleId: workingHours.id,
      bookingQuestions: {
        create: [
          { question: 'Please describe your project or requirements', type: 'TEXTAREA', isRequired: true, order: 1 },
          { question: 'What is your budget range?', type: 'SELECT', isRequired: false, options: JSON.stringify(['Under $1,000', '$1,000 - $5,000', '$5,000 - $10,000', 'Above $10,000']), order: 2 },
          { question: 'Do you have any specific deadlines?', type: 'TEXT', isRequired: false, order: 3 },
        ],
      },
    },
  });
  console.log('✅ Created event type:', event60min.title);

  // Get booking questions for creating answers
  const questionsFor30min = await prisma.bookingQuestion.findMany({
    where: { eventTypeId: event30min.id },
    orderBy: { order: 'asc' },
  });

  // Create bookings (past and upcoming)
  const now = new Date();
  
  // Booking 1: Past booking (yesterday)
  const pastDate = new Date(now);
  pastDate.setDate(pastDate.getDate() - 1);
  pastDate.setHours(10, 0, 0, 0);
  
  const booking1 = await prisma.booking.create({
    data: {
      eventTypeId: event30min.id,
      userId: adminUser.id,
      bookerName: 'John Doe',
      bookerEmail: 'john.doe@example.com',
      startTime: pastDate,
      endTime: new Date(pastDate.getTime() + 30 * 60 * 1000),
      timezone: 'Asia/Kolkata',
      status: 'CONFIRMED',
      bookingAnswers: {
        create: [
          { questionId: questionsFor30min[0].id, answer: 'Discussing a potential collaboration project' },
          { questionId: questionsFor30min[1].id, answer: 'LinkedIn' },
        ],
      },
    },
  });
  console.log('✅ Created past booking for:', booking1.bookerName);

  // Booking 2: Upcoming booking (tomorrow)
  const tomorrowDate = new Date(now);
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  tomorrowDate.setHours(14, 0, 0, 0);
  
  const booking2 = await prisma.booking.create({
    data: {
      eventTypeId: event30min.id,
      userId: adminUser.id,
      bookerName: 'Jane Smith',
      bookerEmail: 'jane.smith@example.com',
      startTime: tomorrowDate,
      endTime: new Date(tomorrowDate.getTime() + 30 * 60 * 1000),
      timezone: 'Asia/Kolkata',
      status: 'CONFIRMED',
      bookingAnswers: {
        create: [
          { questionId: questionsFor30min[0].id, answer: 'Want to learn more about your services' },
          { questionId: questionsFor30min[1].id, answer: 'Google' },
        ],
      },
    },
  });
  console.log('✅ Created upcoming booking for:', booking2.bookerName);

  // Booking 3: Upcoming booking (next week)
  const nextWeekDate = new Date(now);
  nextWeekDate.setDate(nextWeekDate.getDate() + 7);
  nextWeekDate.setHours(11, 0, 0, 0);
  
  const booking3 = await prisma.booking.create({
    data: {
      eventTypeId: event60min.id,
      userId: adminUser.id,
      bookerName: 'Bob Wilson',
      bookerEmail: 'bob.wilson@example.com',
      startTime: nextWeekDate,
      endTime: new Date(nextWeekDate.getTime() + 60 * 60 * 1000),
      timezone: 'Asia/Kolkata',
      status: 'CONFIRMED',
    },
  });
  console.log('✅ Created upcoming booking for:', booking3.bookerName);

  console.log('\n🎉 Database seeding completed successfully!');
  console.log('-------------------------------------------');
  console.log('Summary:');
  console.log('- 1 Admin User');
  console.log('- 1 Availability Schedule (Mon-Fri, 9 AM - 5 PM)');
  console.log('- 2 Event Types (30min & 60min)');
  console.log('- 3 Bookings (1 past, 2 upcoming)');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
