import { Router } from 'express';
import {
  getAllEventTypes,
  getEventTypeById,
  createEventType,
  updateEventType,
  deleteEventType,
  toggleEventTypeStatus,
} from '../controllers/eventTypeController.js';

const router = Router();

// GET /api/event-types - Get all event types
router.get('/', getAllEventTypes);

// GET /api/event-types/:id - Get single event type
router.get('/:id', getEventTypeById);

// POST /api/event-types - Create new event type
router.post('/', createEventType);

// PUT /api/event-types/:id - Update event type
router.put('/:id', updateEventType);

// DELETE /api/event-types/:id - Delete event type
router.delete('/:id', deleteEventType);

// PATCH /api/event-types/:id/toggle - Toggle active status
router.patch('/:id/toggle', toggleEventTypeStatus);

export default router;
