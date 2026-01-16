import prisma from '../config/database.js';
import { sendBookingConfirmation, sendBookingCancellation, sendBookingReschedule } from '../services/emailService.js';

// Helper to get admin user ID
const getAdminUserId = async () => {
  const user = await prisma.user.findFirst();
  return user ? user.id : 1;
};

// Get all bookings for admin
export const getAllBookings = async (req, res) => {
  try {
    const { status, upcoming, past } = req.query;
    const userId = await getAdminUserId();
    
    const where = { userId };
    
    if (status) {
      where.status = status;
    }
    
    const now = new Date();
    if (upcoming === 'true') {
      where.startTime = { gte: now };
      where.status = 'CONFIRMED';
    } else if (past === 'true') {
      where.OR = [
        { startTime: { lt: now } },
        { status: { in: ['CANCELLED', 'RESCHEDULED'] } },
      ];
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        eventType: {
          select: { id: true, title: true, slug: true, duration: true, color: true },
        },
        bookingAnswers: {
          include: {
            question: true,
          },
        },
      },
      orderBy: { startTime: upcoming === 'true' ? 'asc' : 'desc' },
    });

    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

// Get single booking by ID
export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(id) },
      include: {
        eventType: true,
        bookingAnswers: {
          include: { question: true },
        },
      },
    });
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    res.json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
};

// Cancel booking
export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const booking = await prisma.booking.update({
      where: { id: parseInt(id) },
      data: {
        status: 'CANCELLED',
        cancellationReason: reason,
      },
      include: {
        eventType: true,
      },
    });

    // Send cancellation email
    try {
      await sendBookingCancellation(booking);
    } catch (emailError) {
      console.error('Failed to send cancellation email:', emailError);
    }

    res.json(booking);
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
};

// Reschedule booking
export const rescheduleBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { newStartTime, timezone } = req.body;

    // Get original booking
    const originalBooking = await prisma.booking.findUnique({
      where: { id: parseInt(id) },
      include: { eventType: true },
    });

    if (!originalBooking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Calculate new end time
    const newStart = new Date(newStartTime);
    const newEnd = new Date(newStart.getTime() + originalBooking.eventType.duration * 60 * 1000);

    // Check for conflicts
    const conflict = await prisma.booking.findFirst({
      where: {
        eventTypeId: originalBooking.eventTypeId,
        status: 'CONFIRMED',
        id: { not: originalBooking.id },
        OR: [
          { AND: [{ startTime: { lte: newStart } }, { endTime: { gt: newStart } }] },
          { AND: [{ startTime: { lt: newEnd } }, { endTime: { gte: newEnd } }] },
          { AND: [{ startTime: { gte: newStart } }, { endTime: { lte: newEnd } }] },
        ],
      },
    });

    if (conflict) {
      return res.status(400).json({ error: 'Time slot is no longer available' });
    }

    // Update original booking to rescheduled
    await prisma.booking.update({
      where: { id: originalBooking.id },
      data: { status: 'RESCHEDULED' },
    });

    // Create new booking
    const newBooking = await prisma.booking.create({
      data: {
        eventTypeId: originalBooking.eventTypeId,
        userId: originalBooking.userId,
        bookerName: originalBooking.bookerName,
        bookerEmail: originalBooking.bookerEmail,
        startTime: newStart,
        endTime: newEnd,
        timezone: timezone || originalBooking.timezone,
        status: 'CONFIRMED',
        rescheduledFromId: originalBooking.id,
      },
      include: { eventType: true },
    });

    // Send reschedule email
    try {
      await sendBookingReschedule(newBooking, originalBooking);
    } catch (emailError) {
      console.error('Failed to send reschedule email:', emailError);
    }

    res.json(newBooking);
  } catch (error) {
    console.error('Error rescheduling booking:', error);
    res.status(500).json({ error: 'Failed to reschedule booking' });
  }
};

// Get booking stats for dashboard
export const getBookingStats = async (req, res) => {
  try {
    const userId = await getAdminUserId();
    const now = new Date();
    const startOfToday = new Date(now.setHours(0, 0, 0, 0));
    const endOfToday = new Date(now.setHours(23, 59, 59, 999));

    const [upcomingCount, todayCount, totalCount, cancelledCount] = await Promise.all([
      prisma.booking.count({
        where: { userId, status: 'CONFIRMED', startTime: { gt: new Date() } },
      }),
      prisma.booking.count({
        where: {
          userId,
          status: 'CONFIRMED',
          startTime: { gte: startOfToday, lte: endOfToday },
        },
      }),
      prisma.booking.count({ where: { userId } }),
      prisma.booking.count({ where: { userId, status: 'CANCELLED' } }),
    ]);

    res.json({
      upcoming: upcomingCount,
      today: todayCount,
      total: totalCount,
      cancelled: cancelledCount,
    });
  } catch (error) {
    console.error('Error fetching booking stats:', error);
    res.status(500).json({ error: 'Failed to fetch booking stats' });
  }
};
