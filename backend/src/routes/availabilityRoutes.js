import { Router } from 'express';
import {
  getAllSchedules,
  getScheduleById,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  addDateOverride,
  updateDateOverride,
  deleteDateOverride,
} from '../controllers/availabilityController.js';

const router = Router();

// GET /api/availability - Get all schedules
router.get('/', getAllSchedules);

// GET /api/availability/:id - Get single schedule
router.get('/:id', getScheduleById);

// POST /api/availability - Create new schedule
router.post('/', createSchedule);

// PUT /api/availability/:id - Update schedule
router.put('/:id', updateSchedule);

// DELETE /api/availability/:id - Delete schedule
router.delete('/:id', deleteSchedule);

// Date Overrides
// POST /api/availability/:scheduleId/overrides - Add date override
router.post('/:scheduleId/overrides', addDateOverride);

// PUT /api/availability/overrides/:id - Update date override
router.put('/overrides/:id', updateDateOverride);

// DELETE /api/availability/overrides/:id - Delete date override
router.delete('/overrides/:id', deleteDateOverride);

export default router;
