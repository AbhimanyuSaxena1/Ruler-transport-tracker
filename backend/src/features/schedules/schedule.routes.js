import express from 'express';
import scheduleController from './schedule.controller.js';
import { protect, authorize } from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', scheduleController.getAllSchedules);
router.get('/:id', scheduleController.getScheduleById);

router.post('/', protect, authorize('admin'), scheduleController.createSchedule);
router.patch('/:id', protect, authorize('admin'), scheduleController.updateSchedule);
router.delete('/:id', protect, authorize('admin'), scheduleController.deleteSchedule);

export default router;
