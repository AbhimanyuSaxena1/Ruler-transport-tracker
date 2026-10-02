import Schedule from './schedule.model.js';

class ScheduleRepository {
  async create(scheduleData) {
    return Schedule.create(scheduleData);
  }

  async findAll(filter = {}) {
    return Schedule.find(filter)
      .populate('bus', 'busNumber capacity status')
      .populate('route', 'routeName origin destination stops')
      .populate('driver', 'name email')
      .sort({ startTime: 1 });
  }

  async findById(id) {
    return Schedule.findById(id)
      .populate('bus')
      .populate('route')
      .populate('driver', 'name email');
  }

  async update(id, updateData) {
    return Schedule.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .populate('bus')
      .populate('route')
      .populate('driver', 'name email');
  }

  async delete(id) {
    return Schedule.findByIdAndDelete(id);
  }
}

export default new ScheduleRepository();
