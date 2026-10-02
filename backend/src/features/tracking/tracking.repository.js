import TrackingHistory from './tracking.model.js';

class TrackingRepository {
  async createHistoryEntry(data) {
    const entry = new TrackingHistory(data);
    return entry.save();
  }

  async getHistoryByBusId(busId, limit = 50) {
    return TrackingHistory.find({ busId })
      .sort({ recordedAt: -1 })
      .limit(Number(limit))
      .exec();
  }

  async getLatestEntry(busId) {
    return TrackingHistory.findOne({ busId }).sort({ recordedAt: -1 }).exec();
  }
}

export default new TrackingRepository();
