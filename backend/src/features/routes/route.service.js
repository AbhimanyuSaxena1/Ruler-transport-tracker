import routeRepository from './route.repository.js';
import Stop from './stop.model.js';
import ApiError from '../../utils/ApiError.js';

class RouteService {
  async createStop(data) {
    // Expected data: { name, latitude, longitude }
    const stopData = {
      name: data.name,
      location: {
        type: 'Point',
        coordinates: [data.longitude, data.latitude] // GeoJSON is [lng, lat]
      }
    };
    return routeRepository.createStop(stopData);
  }

  async getAllStops() {
    return routeRepository.getAllStops();
  }

  async deleteStop(id) {
    return routeRepository.deleteStop(id);
  }

  async createRoute(data) {
    // Auto-generate path from stops if path coordinates are not explicitly provided
    if ((!data.path || !data.path.coordinates || data.path.coordinates.length < 2) && Array.isArray(data.stops) && data.stops.length >= 2) {
      const stopDocs = await Stop.find({ _id: { $in: data.stops } });
      const stopMap = new Map(stopDocs.map((s) => [s._id.toString(), s]));
      const coords = data.stops
        .map((id) => stopMap.get(id.toString()))
        .filter((s) => s && s.location && Array.isArray(s.location.coordinates))
        .map((s) => s.location.coordinates);

      if (coords.length >= 2) {
        data.path = {
          type: 'LineString',
          coordinates: coords,
        };
      }
    }

    return routeRepository.createRoute(data);
  }

  async getAllRoutes() {
    return routeRepository.getAllRoutes();
  }

  async getRouteById(id) {
    const route = await routeRepository.getRouteById(id);
    if (!route) {
      throw ApiError.notFound('Route not found');
    }
    return route;
  }

  async deleteRoute(id) {
    return routeRepository.deleteRoute(id);
  }
}

export default new RouteService();
