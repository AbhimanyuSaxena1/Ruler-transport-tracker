import scheduleService from './schedule.service.js';

class ScheduleController {
  createSchedule = async (req, res, next) => {
    try {
      const schedule = await scheduleService.createSchedule(req.body);
      res.status(201).json({ success: true, data: schedule });
    } catch (error) {
      next(error);
    }
  };

  getAllSchedules = async (req, res, next) => {
    try {
      const schedules = await scheduleService.getAllSchedules(req.query);
      res.status(200).json({ success: true, count: schedules.length, data: schedules });
    } catch (error) {
      next(error);
    }
  };

  getScheduleById = async (req, res, next) => {
    try {
      const schedule = await scheduleService.getScheduleById(req.params.id);
      res.status(200).json({ success: true, data: schedule });
    } catch (error) {
      next(error);
    }
  };

  updateSchedule = async (req, res, next) => {
    try {
      const schedule = await scheduleService.updateSchedule(req.params.id, req.body);
      res.status(200).json({ success: true, data: schedule });
    } catch (error) {
      next(error);
    }
  };

  deleteSchedule = async (req, res, next) => {
    try {
      await scheduleService.deleteSchedule(req.params.id);
      res.status(200).json({ success: true, message: 'Schedule deleted successfully' });
    } catch (error) {
      next(error);
    }
  };
}

export default new ScheduleController();
