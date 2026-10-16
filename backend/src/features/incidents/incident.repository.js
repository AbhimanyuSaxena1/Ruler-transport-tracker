import Incident from './incident.model.js';

class IncidentRepository {
  async findOpenIncidentByBusId(busId, type = 'BUS_OFFLINE') {
    return Incident.findOne({
      busId,
      type,
      status: { $in: ['OPEN', 'ACKNOWLEDGED'] },
    })
      .populate('acknowledgedBy', 'name email')
      .populate('driverId', 'name email')
      .exec();
  }

  async createIncident(incidentData) {
    try {
      const incident = new Incident(incidentData);
      return await incident.save();
    } catch (error) {
      // Concurrency protection: if a duplicate open incident key race condition occurs, return the existing open incident
      if (error.code === 11000) {
        return this.findOpenIncidentByBusId(incidentData.busId, incidentData.type);
      }
      throw error;
    }
  }

  async acknowledgeIncident(incidentId, userId, notes = '') {
    return Incident.findByIdAndUpdate(
      incidentId,
      {
        status: 'ACKNOWLEDGED',
        acknowledgedAt: new Date(),
        acknowledgedBy: userId,
        ...(notes ? { notes } : {}),
      },
      { new: true }
    )
      .populate('acknowledgedBy', 'name email')
      .populate('driverId', 'name email')
      .exec();
  }

  async resolveIncident(incidentId, recoveredAt = new Date()) {
    const existing = await Incident.findById(incidentId);
    if (!existing || existing.status === 'RESOLVED') {
      return existing;
    }

    // Set deduplicationKey to a resolved unique key to release the open slot
    const resolvedDeduplicationKey = `BUS_OFFLINE_${existing.busId}_RESOLVED_${existing._id}`;

    return Incident.findByIdAndUpdate(
      incidentId,
      {
        status: 'RESOLVED',
        recoveredAt,
        deduplicationKey: resolvedDeduplicationKey,
      },
      { new: true }
    )
      .populate('acknowledgedBy', 'name email')
      .populate('driverId', 'name email')
      .exec();
  }

  async resolveOpenIncidentsForBus(busId, recoveredAt = new Date()) {
    const openIncidents = await Incident.find({
      busId,
      status: { $in: ['OPEN', 'ACKNOWLEDGED'] },
    });

    const results = [];
    for (const inc of openIncidents) {
      const resolved = await this.resolveIncident(inc._id, recoveredAt);
      results.push(resolved);
    }
    return results;
  }

  async findAll(filter = {}, { page = 1, limit = 50, sort = { detectedAt: -1 } } = {}) {
    const skip = (Math.max(1, page) - 1) * limit;
    const [incidents, total] = await Promise.all([
      Incident.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('acknowledgedBy', 'name email')
        .populate('driverId', 'name email')
        .exec(),
      Incident.countDocuments(filter),
    ]);

    return {
      incidents,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(incidentId) {
    return Incident.findById(incidentId)
      .populate('acknowledgedBy', 'name email')
      .populate('driverId', 'name email')
      .populate('busId')
      .exec();
  }
}

export default new IncidentRepository();
