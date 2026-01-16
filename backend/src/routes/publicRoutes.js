import { Router } from 'express';
import {
  getPublicEventType,
  getAvailableSlots,
  getAvailableDates,
  createPublicBooking,
} from '../controllers/publicController.js';

const router = Router();

// GET /api/public/:slug - Get public event type info
router.get('/:slug', getPublicEventType);

// GET /api/public/:slug/dates - Get available dates for a month
router.get('/:slug/dates', getAvailableDates);

// GET /api/public/:slug/slots - Get available slots for a date
router.get('/:slug/slots', getAvailableSlots);

// POST /api/public/:slug/book - Create a booking
router.post('/:slug/book', createPublicBooking);

export default router;
