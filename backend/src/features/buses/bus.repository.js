import Bus from './bus.model.js';

class BusRepository {
  async create(busData) {
    const bus = new Bus(busData);
    return bus.save();
  }

  async findById(id) {
    return Bus.findById(id).populate('assignedDriver', 'name email role').populate('assignedRoute', 'routeName origin destination').exec();
  }

  async findByBusNumber(busNumber) {
    const numStr = String(busNumber ?? '');
    return Bus.findOne({ busNumber: numStr.toUpperCase() }).populate('assignedDriver', 'name email').populate('assignedRoute', 'routeName origin destination').exec();
  }

  async findFirstActive() {
    return Bus.findOne({ status: 'active' }).exec();
  }

  async findAll(filter = {}) {
    return Bus.find(filter).populate('assignedDriver', 'name email').populate('assignedRoute', 'routeName origin destination').exec();
  }

  async updateLocation(busId, { latitude, longitude, speed = 0, heading = 0, accuracy = null, timestamp = new Date() }) {
    return Bus.findByIdAndUpdate(
      busId,
      {
        currentLocation: {
          latitude,
          longitude,
        },
        speed,
        heading,
        accuracy,
        lastLocationUpdate: timestamp,
      },
      { new: true, runValidators: true }
    ).exec();
  }

  async assignDriver(busId, driverId) {
    return Bus.findByIdAndUpdate(
      busId,
      { assignedDriver: driverId },
      { new: true }
    ).populate('assignedDriver', 'name email').exec();
  }

  async update(busId, updateData) {
    return Bus.findByIdAndUpdate(busId, updateData, { new: true, runValidators: true }).exec();
  }

  async delete(busId) {
    return Bus.findByIdAndDelete(busId).exec();
  }
}

export default new BusRepository();
