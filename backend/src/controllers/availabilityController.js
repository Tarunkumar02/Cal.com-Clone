import prisma from '../config/database.js';

// Helper to get admin user ID
const getAdminUserId = async () => {
  const user = await prisma.user.findFirst();
  return user ? user.id : 1; // Fallback to 1 if no user (should not happen if seeded)
};

// Get all availability schedules
export const getAllSchedules = async (req, res) => {
  try {
    const userId = await getAdminUserId();
    const schedules = await prisma.availabilitySchedule.findMany({
      where: { userId },
      include: {
        availabilityRules: {
          orderBy: { dayOfWeek: 'asc' },
        },
        dateOverrides: {
          orderBy: { date: 'asc' },
        },
        _count: {
          select: { eventTypes: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(schedules);
  } catch (error) {
    console.error('Error fetching schedules:', error);
    res.status(500).json({ error: 'Failed to fetch schedules' });
  }
};

// Get single schedule by ID
export const getScheduleById = async (req, res) => {
  try {
    const { id } = req.params;
    const schedule = await prisma.availabilitySchedule.findUnique({
      where: { id: parseInt(id) },
      include: {
        availabilityRules: {
          orderBy: { dayOfWeek: 'asc' },
        },
        dateOverrides: {
          orderBy: { date: 'asc' },
        },
      },
    });
    
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    
    res.json(schedule);
  } catch (error) {
    console.error('Error fetching schedule:', error);
    res.status(500).json({ error: 'Failed to fetch schedule' });
  }
};

// Create new schedule
export const createSchedule = async (req, res) => {
  try {
    const { name, timezone, isDefault, availabilityRules } = req.body;
    const userId = await getAdminUserId();

    // If this is set as default, unset other defaults
    if (isDefault) {
      await prisma.availabilitySchedule.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const schedule = await prisma.availabilitySchedule.create({
      data: {
        userId,
        name,
        timezone: timezone || 'Asia/Kolkata',
        isDefault: isDefault || false,
        availabilityRules: availabilityRules?.length ? {
          create: availabilityRules.map(rule => ({
            dayOfWeek: rule.dayOfWeek,
            startTime: rule.startTime,
            endTime: rule.endTime,
          })),
        } : undefined,
      },
      include: {
        availabilityRules: true,
      },
    });

    res.status(201).json(schedule);
  } catch (error) {
    console.error('Error creating schedule:', error);
    res.status(500).json({ error: 'Failed to create schedule' });
  }
};

// Update schedule
export const updateSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, timezone, isDefault, availabilityRules } = req.body;
    const userId = await getAdminUserId();

    // If this is set as default, unset other defaults
    if (isDefault) {
      await prisma.availabilitySchedule.updateMany({
        where: { userId, isDefault: true, NOT: { id: parseInt(id) } },
        data: { isDefault: false },
      });
    }

    // Delete existing rules if new ones provided
    if (availabilityRules) {
      await prisma.availabilityRule.deleteMany({
        where: { availabilityScheduleId: parseInt(id) },
      });
    }

    const schedule = await prisma.availabilitySchedule.update({
      where: { id: parseInt(id) },
      data: {
        name,
        timezone,
        isDefault,
        availabilityRules: availabilityRules?.length ? {
          create: availabilityRules.map(rule => ({
            dayOfWeek: rule.dayOfWeek,
            startTime: rule.startTime,
            endTime: rule.endTime,
          })),
        } : undefined,
      },
      include: {
        availabilityRules: true,
        dateOverrides: true,
      },
    });

    res.json(schedule);
  } catch (error) {
    console.error('Error updating schedule:', error);
    res.status(500).json({ error: 'Failed to update schedule' });
  }
};

// Delete schedule
export const deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if any event types are using this schedule
    const eventTypesUsingSchedule = await prisma.eventType.count({
      where: { availabilityScheduleId: parseInt(id) },
    });
    
    if (eventTypesUsingSchedule > 0) {
      return res.status(400).json({ 
        error: `Cannot delete schedule. ${eventTypesUsingSchedule} event type(s) are using it.` 
      });
    }

    await prisma.availabilitySchedule.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    res.status(500).json({ error: 'Failed to delete schedule' });
  }
};

// Add date override
export const addDateOverride = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const { date, isBlocked, startTime, endTime } = req.body;

    const override = await prisma.dateOverride.create({
      data: {
        availabilityScheduleId: parseInt(scheduleId),
        date: new Date(date),
        isBlocked: isBlocked || false,
        startTime: isBlocked ? null : startTime,
        endTime: isBlocked ? null : endTime,
      },
    });

    res.status(201).json(override);
  } catch (error) {
    console.error('Error adding date override:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Override for this date already exists' });
    }
    res.status(500).json({ error: 'Failed to add date override' });
  }
};

// Update date override
export const updateDateOverride = async (req, res) => {
  try {
    const { id } = req.params;
    const { isBlocked, startTime, endTime } = req.body;

    const override = await prisma.dateOverride.update({
      where: { id: parseInt(id) },
      data: {
        isBlocked,
        startTime: isBlocked ? null : startTime,
        endTime: isBlocked ? null : endTime,
      },
    });

    res.json(override);
  } catch (error) {
    console.error('Error updating date override:', error);
    res.status(500).json({ error: 'Failed to update date override' });
  }
};

// Delete date override
export const deleteDateOverride = async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.dateOverride.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: 'Date override deleted successfully' });
  } catch (error) {
    console.error('Error deleting date override:', error);
    res.status(500).json({ error: 'Failed to delete date override' });
  }
};
