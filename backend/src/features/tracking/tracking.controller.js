import trackingService from './tracking.service.js';

class TrackingController {
  async recordLocation(req, res, next) {
    try {
      const locationRecord = await trackingService.processLocationUpdate(req.user, req.body);

      return res.status(200).json({
        success: true,
        message: 'Location recorded and bus updated successfully',
        data: locationRecord,
      });
    } catch (error) {
      next(error);
    }
  }

  async getLocationHistory(req, res, next) {
    try {
      const { busId } = req.params;
      const { limit } = req.query;

      const history = await trackingService.getBusHistory(busId, limit);

      return res.status(200).json({
        success: true,
        count: history.length,
        data: history,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new TrackingController();
