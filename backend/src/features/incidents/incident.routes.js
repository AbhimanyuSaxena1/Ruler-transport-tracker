import express from 'express';
import incidentController from './incident.controller.js';
import { protect, authorize } from '../../middlewares/authMiddleware.js';

const router = express.Router();

// Configuration routes
router.get('/config', protect, authorize('admin'), (req, res, next) => {
  incidentController.getConfig(req, res, next);
});

router.put('/config', protect, authorize('admin'), (req, res, next) => {
  incidentController.updateConfig(req, res, next);
});

// List & retrieve incidents
router.get('/', protect, authorize('admin'), (req, res, next) => {
  incidentController.getIncidents(req, res, next);
});

router.get('/:id', protect, authorize('admin'), (req, res, next) => {
  incidentController.getIncidentById(req, res, next);
});

// Acknowledge incident
router.post('/:id/acknowledge', protect, authorize('admin'), (req, res, next) => {
  incidentController.acknowledgeIncident(req, res, next);
});

router.patch('/:id/acknowledge', protect, authorize('admin'), (req, res, next) => {
  incidentController.acknowledgeIncident(req, res, next);
});

export default router;
