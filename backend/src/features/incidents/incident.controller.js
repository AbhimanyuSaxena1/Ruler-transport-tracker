import incidentService from './incident.service.js';

class IncidentController {
  async getIncidents(req, res, next) {
    try {
      const data = await incidentService.getIncidents(req.query);
      res.status(200).json({
        success: true,
        data: data.incidents,
        pagination: {
          total: data.total,
          page: data.page,
          limit: data.limit,
          totalPages: data.totalPages,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getIncidentById(req, res, next) {
    try {
      const incident = await incidentService.getIncidentById(req.params.id);
      res.status(200).json({
        success: true,
        data: incident,
      });
    } catch (error) {
      next(error);
    }
  }

  async acknowledgeIncident(req, res, next) {
    try {
      const incident = await incidentService.acknowledgeIncident(
        req.params.id,
        req.user._id,
        req.body?.notes || ''
      );
      res.status(200).json({
        success: true,
        message: 'Incident acknowledged successfully',
        data: incident,
      });
    } catch (error) {
      next(error);
    }
  }

  async getConfig(req, res, next) {
    try {
      const config = incidentService.getConfig();
      res.status(200).json({
        success: true,
        data: config,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateConfig(req, res, next) {
    try {
      const updated = incidentService.updateConfig(req.body);
      res.status(200).json({
        success: true,
        message: 'Offline monitoring configuration updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new IncidentController();
