import busRepository from '../buses/bus.repository.js';
import trackingRepository from './tracking.repository.js';
import ApiError from '../../utils/ApiError.js';
import { getIO } from '../../config/socket.js';
import { getDistanceMeters, calculateETAMinutes } from '../../utils/geoUtils.js';

/**
 * Tracking Service
 * Encapsulates business logic for location tracking, bus resolution, and history persistence
 */
class TrackingService {
  /**
   * Processes an incoming GPS location ping from an authenticated driver (or admin).
   * Automatically resolves the target bus from the driver's assignment:
   * JWT -> Driver -> Driver's assigned bus -> Bus ID
   *
   * @param {Object} user Authenticated user from authMiddleware
   * @param {Object} locationData GPS payload
   */
  async processLocationUpdate(user, { latitude, longitude, speed = 0, heading = 0, accuracy = null, busId = null }) {
    let targetBusId;

    // Security Rule: For drivers, NEVER trust busId sent in request. Derive from driver assignment.
    if (user.role === 'driver') {
      const assigned = user.assignedBus?._id || user.assignedBus;
      if (!assigned) {
        throw ApiError.badRequest('Driver is not currently assigned to any bus. Contact an administrator.');
      }
      targetBusId = assigned;
    } else if (user.role === 'admin') {
      // Admins can test by explicitly providing a busId, or default to the first active bus
      if (busId) {
        targetBusId = busId;
      } else {
        const defaultBus = await busRepository.findFirstActive();
        if (!defaultBus) {
          throw ApiError.badRequest('No active bus found. Please create a bus first or specify busId.');
        }
        targetBusId = defaultBus._id;
      }
    } else {
      throw ApiError.forbidden('Only drivers and administrators can broadcast location updates.');
    }

    // Verify the bus exists
    const bus = await busRepository.findById(targetBusId);
    if (!bus) {
      throw ApiError.notFound(`Bus with ID '${targetBusId}' does not exist.`);
    }

    const timestamp = new Date();

    // 1. Update Current Location on Bus document in MongoDB
    const updatedBus = await busRepository.updateLocation(targetBusId, {
      latitude,
      longitude,
      speed: Number(speed) || 0,
      heading: Number(heading) || 0,
      accuracy: accuracy !== null ? Number(accuracy) : null,
      timestamp,
    });

    // 2. Persist to Location History as a separate concern in MongoDB
    await trackingRepository.createHistoryEntry({
      busId: targetBusId,
      driverId: user._id,
      latitude,
      longitude,
      speed: Number(speed) || 0,
      heading: Number(heading) || 0,
      accuracy: accuracy !== null ? Number(accuracy) : null,
      recordedAt: timestamp,
    });

    // Broadcast location update via Socket.IO with Geofence & ETA telemetry
    try {
      const io = getIO();
      let stopETAs = [];

      // Calculate ETAs if bus has an assigned route with populated stops
      if (bus.assignedRoute) {
        try {
          const Route = (await import('../routes/route.model.js')).default;
          const routeDoc = await Route.findById(bus.assignedRoute).populate('stops');
          if (routeDoc && routeDoc.stops) {
            stopETAs = routeDoc.stops.map((stop) => {
              const stopLat = stop.location.coordinates[1];
              const stopLng = stop.location.coordinates[0];
              const distMeters = getDistanceMeters(latitude, longitude, stopLat, stopLng);
              const etaMins = calculateETAMinutes(distMeters, updatedBus.speed);
              const isArrived = distMeters <= 200; // 200m Geofence
              return {
                stopId: stop._id,
                stopName: stop.name,
                distanceMeters: distMeters,
                etaMinutes: etaMins,
                isArrived,
              };
            });
          }
        } catch (e) {
          console.error('[Geofence] Error calculating ETAs:', e.message);
        }
      }

      const locationPayload = {
        busId: updatedBus._id,
        busNumber: updatedBus.busNumber,
        latitude,
        longitude,
        speed: updatedBus.speed,
        heading: updatedBus.heading,
        lastLocationUpdate: updatedBus.lastLocationUpdate,
        stopETAs,
      };

      // Broadcast to global map and specific bus subscribers
      io.emit('locationUpdate', locationPayload);
      io.to(`bus_${targetBusId}`).emit('locationUpdate', locationPayload);
    } catch (error) {
      console.error('[Socket.IO] Failed to emit location update:', error);
    }

    return {
      busId: updatedBus._id,
      busNumber: updatedBus.busNumber,
      licensePlate: updatedBus.licensePlate,
      currentLocation: updatedBus.currentLocation,
      speed: updatedBus.speed,
      heading: updatedBus.heading,
      accuracy: updatedBus.accuracy,
      lastLocationUpdate: updatedBus.lastLocationUpdate,
    };
  }

  /**
   * Retrieves historical GPS breadcrumbs for a given bus
   */
  async getBusHistory(busId, limit = 50) {
    const bus = await busRepository.findById(busId);
    if (!bus) {
      throw ApiError.notFound('Bus not found');
    }
    return trackingRepository.getHistoryByBusId(busId, limit);
  }
}

export default new TrackingService();
