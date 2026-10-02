import scheduleRepository from './schedule.repository.js';
import ApiError from '../../utils/ApiError.js';

class ScheduleService {
  async createSchedule(data) {
    return scheduleRepository.create(data);
  }

  async getAllSchedules(filter) {
    return scheduleRepository.findAll(filter);
  }

  async getScheduleById(id) {
    const schedule = await scheduleRepository.findById(id);
    if (!schedule) throw ApiError.notFound('Schedule not found');
    return schedule;
  }

  async updateSchedule(id, updateData) {
    const schedule = await scheduleRepository.findById(id);
    if (!schedule) throw ApiError.notFound('Schedule not found');
    return scheduleRepository.update(id, updateData);
  }

  async deleteSchedule(id) {
    const schedule = await scheduleRepository.findById(id);
    if (!schedule) throw ApiError.notFound('Schedule not found');
    return scheduleRepository.delete(id);
  }
}

export default new ScheduleService();
