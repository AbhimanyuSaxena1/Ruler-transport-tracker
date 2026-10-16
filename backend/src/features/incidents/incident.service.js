import incidentRepository from './incident.repository.js';
import offlineMonitoringService from '../tracking/offlineMonitoring.service.js';
import ApiError from '../../utils/ApiError.js';
import { getIO } from '../../config/socket.js';

class IncidentService {
  async getIncidents(query = {}) {
    const filter = {};
    if (query.status) {
      if (query.status.includes(',')) {
        filter.status = { $in: query.status.split(',').map((s) => s.trim()) };
      } else {
        filter.status = query.status;
      }
    }
    if (query.busId) {
      filter.busId = query.busId;
    }
    if (query.type) {
      filter.type = query.type;
    }
    if (query.organizationId) {
      filter.organizationId = query.organizationId;
    }

    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '50', 10);

    return incidentRepository.findAll(filter, { page, limit });
  }

  async getIncidentById(id) {
    const incident = await incidentRepository.findById(id);
    if (!incident) {
      throw ApiError.notFound('Incident not found');
    }
    return incident;
  }

  async acknowledgeIncident(incidentId, userId, notes = '') {
    const incident = await incidentRepository.findById(incidentId);
    if (!incident) {
      throw ApiError.notFound('Incident not found');
    }
    if (incident.status === 'RESOLVED') {
      throw ApiError.badRequest('Cannot acknowledge an already resolved incident');
    }

    const updated = await incidentRepository.acknowledgeIncident(incidentId, userId, notes);

    // Broadcast acknowledgement event so all admin dashboards update in real time
    try {
      const io = getIO();
      io.to('admin_room').emit('incident:acknowledged', {
        incidentId: updated._id,
        busId: updated.busId,
        status: updated.status,
        acknowledgedAt: updated.acknowledgedAt,
        acknowledgedBy: updated.acknowledgedBy,
      });
      io.emit('incident:acknowledged', {
        incidentId: updated._id,
        busId: updated.busId,
        status: updated.status,
        acknowledgedAt: updated.acknowledgedAt,
        acknowledgedBy: updated.acknowledgedBy,
      });
    } catch (e) {
      console.warn('[Socket.IO] Failed to emit incident:acknowledged:', e.message);
    }

    return updated;
  }

  getConfig() {
    return offlineMonitoringService.getConfig();
  }

  updateConfig(newConfig) {
    return offlineMonitoringService.updateConfig(newConfig);
  }
}

export default new IncidentService();
