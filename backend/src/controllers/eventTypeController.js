import prisma from '../config/database.js';

// Helper to get admin user ID
const getAdminUserId = async () => {
  const user = await prisma.user.findFirst();
  return user ? user.id : 1;
};

// Get all event types for admin
export const getAllEventTypes = async (req, res) => {
  try {
    const userId = await getAdminUserId();
    const eventTypes = await prisma.eventType.findMany({
      where: { userId }, // Default admin user
      include: {
        availabilitySchedule: true,
        bookingQuestions: {
          orderBy: { order: 'asc' },
        },
        _count: {
          select: { bookings: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(eventTypes);
  } catch (error) {
    console.error('Error fetching event types:', error);
    res.status(500).json({ error: 'Failed to fetch event types' });
  }
};

// Get single event type by ID
export const getEventTypeById = async (req, res) => {
  try {
    const { id } = req.params;
    const eventType = await prisma.eventType.findUnique({
      where: { id: parseInt(id) },
      include: {
        availabilitySchedule: {
          include: {
            availabilityRules: true,
            dateOverrides: true,
          },
        },
        bookingQuestions: {
          orderBy: { order: 'asc' },
        },
      },
    });
    
    if (!eventType) {
      return res.status(404).json({ error: 'Event type not found' });
    }
    
    res.json(eventType);
  } catch (error) {
    console.error('Error fetching event type:', error);
    res.status(500).json({ error: 'Failed to fetch event type' });
  }
};

// Create new event type
export const createEventType = async (req, res) => {
  try {
    const { title, description, slug, duration, bufferTimeBefore, bufferTimeAfter, color, availabilityScheduleId, bookingQuestions } = req.body;

    // Check if slug already exists
    const existingSlug = await prisma.eventType.findUnique({
      where: { slug },
    });
    
    if (existingSlug) {
      return res.status(400).json({ error: 'URL slug already exists' });
    }

    const userId = await getAdminUserId();

    const eventType = await prisma.eventType.create({
      data: {
        userId, // Default admin user
        title,
        description,
        slug,
        duration: parseInt(duration),
        bufferTimeBefore: parseInt(bufferTimeBefore) || 0,
        bufferTimeAfter: parseInt(bufferTimeAfter) || 0,
        color: color || '#6366f1',
        availabilityScheduleId: availabilityScheduleId ? parseInt(availabilityScheduleId) : null,
        bookingQuestions: bookingQuestions?.length ? {
          create: bookingQuestions.map((q, index) => ({
            question: q.question,
            type: q.type || 'TEXT',
            isRequired: q.isRequired || false,
            options: q.options ? JSON.stringify(q.options) : null,
            order: index,
          })),
        } : undefined,
      },
      include: {
        bookingQuestions: true,
      },
    });

    res.status(201).json(eventType);
  } catch (error) {
    console.error('Error creating event type:', error);
    res.status(500).json({ error: 'Failed to create event type' });
  }
};

// Update event type
export const updateEventType = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, slug, duration, bufferTimeBefore, bufferTimeAfter, color, isActive, availabilityScheduleId, bookingQuestions } = req.body;

    // Check if slug exists for another event type
    const existingSlug = await prisma.eventType.findFirst({
      where: {
        slug,
        NOT: { id: parseInt(id) },
      },
    });
    
    if (existingSlug) {
      return res.status(400).json({ error: 'URL slug already exists' });
    }

    // Delete existing booking questions if new ones provided
    if (bookingQuestions) {
      await prisma.bookingQuestion.deleteMany({
        where: { eventTypeId: parseInt(id) },
      });
    }

    const eventType = await prisma.eventType.update({
      where: { id: parseInt(id) },
      data: {
        title,
        description,
        slug,
        duration: duration ? parseInt(duration) : undefined,
        bufferTimeBefore: bufferTimeBefore !== undefined ? parseInt(bufferTimeBefore) : undefined,
        bufferTimeAfter: bufferTimeAfter !== undefined ? parseInt(bufferTimeAfter) : undefined,
        color,
        isActive,
        availabilityScheduleId: availabilityScheduleId ? parseInt(availabilityScheduleId) : null,
        bookingQuestions: bookingQuestions?.length ? {
          create: bookingQuestions.map((q, index) => ({
            question: q.question,
            type: q.type || 'TEXT',
            isRequired: q.isRequired || false,
            options: q.options ? JSON.stringify(q.options) : null,
            order: index,
          })),
        } : undefined,
      },
      include: {
        bookingQuestions: true,
        availabilitySchedule: true,
      },
    });

    res.json(eventType);
  } catch (error) {
    console.error('Error updating event type:', error);
    res.status(500).json({ error: 'Failed to update event type' });
  }
};

// Delete event type
export const deleteEventType = async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.eventType.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: 'Event type deleted successfully' });
  } catch (error) {
    console.error('Error deleting event type:', error);
    res.status(500).json({ error: 'Failed to delete event type' });
  }
};

// Toggle event type active status
export const toggleEventTypeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const eventType = await prisma.eventType.findUnique({
      where: { id: parseInt(id) },
    });
    
    if (!eventType) {
      return res.status(404).json({ error: 'Event type not found' });
    }

    const updated = await prisma.eventType.update({
      where: { id: parseInt(id) },
      data: { isActive: !eventType.isActive },
    });

    res.json(updated);
  } catch (error) {
    console.error('Error toggling event type status:', error);
    res.status(500).json({ error: 'Failed to toggle event type status' });
  }
};
