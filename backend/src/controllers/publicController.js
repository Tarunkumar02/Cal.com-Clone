import prisma from '../config/database.js';
import { generateAvailableSlots } from '../services/slotGenerationService.js';
import { sendBookingConfirmation } from '../services/emailService.js';

// Get public event type info by slug
export const getPublicEventType = async (req, res) => {
  try {
    const { slug } = req.params;
    
    const eventType = await prisma.eventType.findUnique({
      where: { slug },
      include: {
        user: {
          select: { name: true, timezone: true },
        },
        bookingQuestions: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!eventType || !eventType.isActive) {
      return res.status(404).json({ error: 'Event type not found' });
    }

    // Don't expose internal IDs to public
    res.json({
      title: eventType.title,
      description: eventType.description,
      slug: eventType.slug,
      duration: eventType.duration,
      color: eventType.color,
      hostName: eventType.user.name,
      timezone: eventType.user.timezone,
      questions: eventType.bookingQuestions.map(q => ({
        id: q.id,
        question: q.question,
        type: q.type,
        isRequired: q.isRequired,
        options: q.options ? JSON.parse(q.options) : null,
      })),
    });
  } catch (error) {
    console.error('Error fetching public event type:', error);
    res.status(500).json({ error: 'Failed to fetch event details' });
  }
};

// Get available slots for a date
export const getAvailableSlots = async (req, res) => {
  try {
    const { slug } = req.params;
    const { date, timezone } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }

    const eventType = await prisma.eventType.findUnique({
      where: { slug },
      include: {
        availabilitySchedule: {
          include: {
            availabilityRules: true,
            dateOverrides: true,
          },
        },
      },
    });

    if (!eventType || !eventType.isActive) {
      return res.status(404).json({ error: 'Event type not found' });
    }

    if (!eventType.availabilitySchedule) {
      return res.status(400).json({ error: 'No availability schedule configured' });
    }

    const slots = await generateAvailableSlots(
      eventType,
      eventType.availabilitySchedule,
      new Date(date),
      timezone || eventType.availabilitySchedule.timezone
    );

    res.json({ date, slots, timezone: timezone || eventType.availabilitySchedule.timezone });
  } catch (error) {
    console.error('Error fetching available slots:', error);
    res.status(500).json({ error: 'Failed to fetch available slots' });
  }
};

// Get available dates for a month
export const getAvailableDates = async (req, res) => {
  try {
    const { slug } = req.params;
    const { month, year, timezone } = req.query;

    if (!month || !year) {
      return res.status(400).json({ error: 'Month and year are required' });
    }

    const eventType = await prisma.eventType.findUnique({
      where: { slug },
      include: {
        availabilitySchedule: {
          include: {
            availabilityRules: true,
            dateOverrides: true,
          },
        },
      },
    });

    if (!eventType || !eventType.isActive) {
      return res.status(404).json({ error: 'Event type not found' });
    }

    if (!eventType.availabilitySchedule) {
      return res.status(400).json({ error: 'No availability schedule configured' });
    }

    const schedule = eventType.availabilitySchedule;
    const availableDays = schedule.availabilityRules.map(r => r.dayOfWeek);
    const blockedDates = schedule.dateOverrides
      .filter(o => o.isBlocked)
      .map(o => o.date.toISOString().split('T')[0]);

    // Generate dates for the month
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const availableDates = [];
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const dayOfWeek = d.getDay();
      
      // Check if date is in the past
      if (d < today) continue;
      
      // Check if day of week is available
      if (!availableDays.includes(dayOfWeek)) continue;
      
      // Check if date is blocked
      if (blockedDates.includes(dateStr)) continue;
      
      availableDates.push(dateStr);
    }

    res.json({ month: parseInt(month), year: parseInt(year), availableDates });
  } catch (error) {
    console.error('Error fetching available dates:', error);
    res.status(500).json({ error: 'Failed to fetch available dates' });
  }
};

// Create a booking
export const createPublicBooking = async (req, res) => {
  try {
    const { slug } = req.params;
    const { name, email, date, time, timezone, answers } = req.body;

    // Validate required fields
    if (!name || !email || !date || !time) {
      return res.status(400).json({ error: 'Name, email, date, and time are required' });
    }

    const eventType = await prisma.eventType.findUnique({
      where: { slug },
      include: {
        user: true,
        bookingQuestions: true,
        availabilitySchedule: {
          include: {
            availabilityRules: true,
            dateOverrides: true,
          },
        },
      },
    });

    if (!eventType || !eventType.isActive) {
      return res.status(404).json({ error: 'Event type not found' });
    }

    // Parse start time
    const startTime = new Date(`${date}T${time}:00`);
    const endTime = new Date(startTime.getTime() + eventType.duration * 60 * 1000);

    // Use transaction to prevent race conditions
    const booking = await prisma.$transaction(async (tx) => {
      // Check for conflicts within transaction
      const conflict = await tx.booking.findFirst({
        where: {
          eventTypeId: eventType.id,
          status: 'CONFIRMED',
          OR: [
            { AND: [{ startTime: { lte: startTime } }, { endTime: { gt: startTime } }] },
            { AND: [{ startTime: { lt: endTime } }, { endTime: { gte: endTime } }] },
            { AND: [{ startTime: { gte: startTime } }, { endTime: { lte: endTime } }] },
          ],
        },
      });

      if (conflict) {
        throw new Error('SLOT_UNAVAILABLE');
      }

      // Create booking
      const newBooking = await tx.booking.create({
        data: {
          eventTypeId: eventType.id,
          userId: eventType.userId,
          bookerName: name,
          bookerEmail: email,
          startTime,
          endTime,
          timezone: timezone || eventType.availabilitySchedule?.timezone || 'Asia/Kolkata',
          status: 'CONFIRMED',
          bookingAnswers: answers?.length ? {
            create: answers.map(a => ({
              questionId: a.questionId,
              answer: a.answer,
            })),
          } : undefined,
        },
        include: {
          eventType: true,
          bookingAnswers: {
            include: { question: true },
          },
        },
      });

      return newBooking;
    });

    // Send confirmation email (outside transaction)
    try {
      await sendBookingConfirmation(booking);
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
    }

    res.status(201).json({
      id: booking.id,
      eventType: booking.eventType.title,
      bookerName: booking.bookerName,
      bookerEmail: booking.bookerEmail,
      startTime: booking.startTime,
      endTime: booking.endTime,
      timezone: booking.timezone,
      status: booking.status,
    });
  } catch (error) {
    if (error.message === 'SLOT_UNAVAILABLE') {
      return res.status(409).json({ error: 'This time slot is no longer available' });
    }
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
};
