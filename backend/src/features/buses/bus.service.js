import busRepository from './bus.repository.js';
import userRepository from '../users/user.repository.js';
import ApiError from '../../utils/ApiError.js';

class BusService {
  async createBus(busData) {
    const existingBus = await busRepository.findByBusNumber(busData.busNumber);
    if (existingBus) {
      throw ApiError.badRequest(`Bus with number '${busData.busNumber}' already exists`);
    }

    return busRepository.create(busData);
  }

  async getAllBuses(filter = {}) {
    return busRepository.findAll(filter);
  }

  async getBusById(busId) {
    const bus = await busRepository.findById(busId);
    if (!bus) {
      throw ApiError.notFound('Bus not found');
    }
    return bus;
  }

  async assignDriverToBus(busId, driverId) {
    const bus = await busRepository.findById(busId);
    if (!bus) {
      throw ApiError.notFound('Bus not found');
    }

    const driver = await userRepository.findById(driverId);
    if (!driver) {
      throw ApiError.notFound('Driver user not found');
    }
    if (driver.role !== 'driver') {
      throw ApiError.badRequest('Assigned user must have the driver role');
    }

    // Update both bus and driver to keep two-way reference in sync
    const updatedBus = await busRepository.assignDriver(busId, driverId);
    await userRepository.assignBus(driverId, busId);

    return updatedBus;
  }
  async assignRouteToBus(busId, routeId) {
    const bus = await busRepository.findById(busId);
    if (!bus) {
      throw ApiError.notFound('Bus not found');
    }
    // We could check if route exists, but let's assume route module handles it or we trust admin input for now
    
    // Update the bus directly through repository (which we might need to add or just use direct Mongoose model here for simplicity)
    bus.assignedRoute = routeId;
    return bus.save();
  }

  async deleteBus(busId) {
    const bus = await busRepository.findById(busId);
    if (!bus) {
      throw ApiError.notFound('Bus not found');
    }
    return busRepository.delete(busId);
  }
}

export default new BusService();
