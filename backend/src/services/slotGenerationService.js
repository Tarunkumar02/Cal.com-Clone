import prisma from '../config/database.js';

/**
 * Slot Generation Service
 * Follows the critical 8-step algorithm from SSOT:
 * 1. Fetch event duration and buffer time
 * 2. Fetch associated availability schedule
 * 3. Apply weekly availability rules
 * 4. Apply date overrides
 * 5. Generate raw time slots
 * 6. Remove slots overlapping with existing bookings
 * 7. Remove slots violating buffer time rules
 * 8. Return final list of available slots
 */

export const generateAvailableSlots = async (eventType, schedule, date, timezone) => {
  // Step 1: Get event duration and buffer times (passed via eventType)
  const { duration, bufferTimeBefore, bufferTimeAfter } = eventType;
  
  // Step 2: Schedule already passed in
  const { availabilityRules, dateOverrides } = schedule;
  
  // Get the day of week for the requested date (0 = Sunday, 6 = Saturday)
  const dayOfWeek = date.getDay();
  const dateString = date.toISOString().split('T')[0];
  
  // Step 3: Apply weekly availability rules - find rules for this day
  const dayRules = availabilityRules.filter(rule => rule.dayOfWeek === dayOfWeek);
  
  if (dayRules.length === 0) {
    return []; // No availability on this day
  }
  
  // Step 4: Apply date overrides
  const dateOverride = dateOverrides.find(
    override => override.date.toISOString().split('T')[0] === dateString
  );
  
  if (dateOverride?.isBlocked) {
    return []; // Date is completely blocked
  }
  
  // Determine working hours for the day
  let workingPeriods = [];
  
  if (dateOverride && !dateOverride.isBlocked) {
    // Use override times
    workingPeriods.push({
      start: dateOverride.startTime,
      end: dateOverride.endTime,
    });
  } else {
    // Use regular day rules
    workingPeriods = dayRules.map(rule => ({
      start: rule.startTime,
      end: rule.endTime,
    }));
  }
  
  // Step 5: Generate raw time slots
  const rawSlots = [];
  
  for (const period of workingPeriods) {
    const [startHour, startMinute] = period.start.split(':').map(Number);
    const [endHour, endMinute] = period.end.split(':').map(Number);
    
    let currentTime = new Date(date);
    currentTime.setHours(startHour, startMinute, 0, 0);
    
    const periodEnd = new Date(date);
    periodEnd.setHours(endHour, endMinute, 0, 0);
    
    // Generate slots at duration intervals
    while (currentTime.getTime() + duration * 60 * 1000 <= periodEnd.getTime()) {
      const slotEnd = new Date(currentTime.getTime() + duration * 60 * 1000);
      
      rawSlots.push({
        start: new Date(currentTime),
        end: slotEnd,
        time: `${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}`,
      });
      
      currentTime = new Date(currentTime.getTime() + duration * 60 * 1000);
    }
  }
  
  // Step 6: Remove slots overlapping with existing bookings
  const existingBookings = await prisma.booking.findMany({
    where: {
      eventTypeId: eventType.id,
      status: 'CONFIRMED',
      startTime: {
        gte: new Date(date.setHours(0, 0, 0, 0)),
        lt: new Date(date.setHours(23, 59, 59, 999)),
      },
    },
  });
  
  const availableSlots = rawSlots.filter(slot => {
    // Check if slot overlaps with any booking
    for (const booking of existingBookings) {
      const bookingStart = new Date(booking.startTime);
      const bookingEnd = new Date(booking.endTime);
      
      // Check for overlap
      if (slot.start < bookingEnd && slot.end > bookingStart) {
        return false;
      }
    }
    return true;
  });
  
  // Step 7: Remove slots violating buffer time rules
  const slotsWithBuffers = availableSlots.filter(slot => {
    for (const booking of existingBookings) {
      const bookingStart = new Date(booking.startTime);
      const bookingEnd = new Date(booking.endTime);
      
      // Buffer before: slot end + buffer should not overlap with booking start
      const slotEndWithBuffer = new Date(slot.end.getTime() + bufferTimeAfter * 60 * 1000);
      if (slot.end <= bookingStart && slotEndWithBuffer > bookingStart) {
        return false;
      }
      
      // Buffer after: booking end + buffer should not overlap with slot start
      const bookingEndWithBuffer = new Date(bookingEnd.getTime() + bufferTimeBefore * 60 * 1000);
      if (bookingEnd <= slot.start && bookingEndWithBuffer > slot.start) {
        return false;
      }
    }
    return true;
  });
  
  // Filter out past slots if the date is today
  const now = new Date();
  const finalSlots = slotsWithBuffers.filter(slot => {
    return slot.start > now;
  });
  
  // Step 8: Return final list of available slots
  return finalSlots.map(slot => ({
    time: slot.time,
    available: true,
  }));
};

export default { generateAvailableSlots };
