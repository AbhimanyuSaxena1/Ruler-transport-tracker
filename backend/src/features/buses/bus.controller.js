import busService from './bus.service.js';

class BusController {
  async createBus(req, res, next) {
    try {
      const bus = await busService.createBus(req.body);
      return res.status(201).json({
        success: true,
        message: 'Bus created successfully',
        data: bus,
      });
    } catch (error) {
      next(error);
    }
  }

  async getBuses(req, res, next) {
    try {
      const buses = await busService.getAllBuses(req.query);
      return res.status(200).json({
        success: true,
        count: buses.length,
        data: buses,
      });
    } catch (error) {
      next(error);
    }
  }

  async getBusById(req, res, next) {
    try {
      const bus = await busService.getBusById(req.params.id);
      return res.status(200).json({
        success: true,
        data: bus,
      });
    } catch (error) {
      next(error);
    }
  }

  async assignDriver(req, res, next) {
    try {
      const bus = await busService.assignDriverToBus(req.params.id, req.body.driverId);
      return res.status(200).json({
        success: true,
        message: 'Driver assigned to bus successfully',
        data: bus,
      });
    } catch (error) {
      next(error);
    }
  }
  async assignRoute(req, res, next) {
    try {
      const bus = await busService.assignRouteToBus(req.params.id, req.body.routeId);
      return res.status(200).json({
        success: true,
        message: 'Route assigned to bus successfully',
        data: bus,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateBus(req, res, next) {
    try {
      const bus = await busService.updateBus(req.params.id, req.body);

      // Real-time Socket.IO Broadcast to all connected clients
      try {
        const { getIO } = await import('../../config/socket.js');
        const io = getIO();
        io.emit('busStatusChanged', { busId: String(bus._id), status: bus.status });
        io.emit('locationUpdate', {
          busId: String(bus._id),
          busNumber: bus.busNumber,
          status: bus.status,
          inactive: bus.status !== 'active',
          latitude: bus.currentLocation?.latitude,
          longitude: bus.currentLocation?.longitude,
          speed: bus.speed,
          heading: bus.heading,
          lastLocationUpdate: bus.lastLocationUpdate,
        });
      } catch (socketErr) {
        console.warn('[Socket.IO] updateBus broadcast notice:', socketErr.message);
      }

      return res.status(200).json({
        success: true,
        message: 'Bus updated successfully',
        data: bus,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteBus(req, res, next) {
    try {
      await busService.deleteBus(req.params.id);
      return res.status(200).json({
        success: true,
        message: 'Bus deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new BusController();
