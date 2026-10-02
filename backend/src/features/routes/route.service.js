import routeRepository from './route.repository.js';
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
