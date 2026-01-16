import { Router } from 'express';
import {
  getAllBookings,
  getBookingById,
  cancelBooking,
  rescheduleBooking,
  getBookingStats,
} from '../controllers/bookingController.js';

const router = Router();

// GET /api/bookings - Get all bookings (with filters)
router.get('/', getAllBookings);

// GET /api/bookings/stats - Get booking statistics
router.get('/stats', getBookingStats);

// GET /api/bookings/:id - Get single booking
router.get('/:id', getBookingById);

// POST /api/bookings/:id/cancel - Cancel booking
router.post('/:id/cancel', cancelBooking);

// POST /api/bookings/:id/reschedule - Reschedule booking
router.post('/:id/reschedule', rescheduleBooking);

export default router;
