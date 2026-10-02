import Route from './route.model.js';
import Stop from './stop.model.js';

class RouteRepository {
  // --- Stop Operations ---
  async createStop(stopData) {
    return Stop.create(stopData);
  }

  async getAllStops() {
    return Stop.find().sort({ name: 1 });
  }

  async getStopById(id) {
    return Stop.findById(id);
  }

  async deleteStop(id) {
    return Stop.findByIdAndDelete(id);
  }

  // --- Route Operations ---
  async createRoute(routeData) {
    return Route.create(routeData);
  }

  async getAllRoutes() {
    return Route.find().populate('stops').sort({ routeName: 1 });
  }

  async getRouteById(id) {
    return Route.findById(id).populate('stops');
  }

  async updateRouteStops(routeId, stopIds) {
    return Route.findByIdAndUpdate(
      routeId,
      { stops: stopIds },
      { new: true, runValidators: true }
    ).populate('stops');
  }

  async deleteRoute(id) {
    return Route.findByIdAndDelete(id);
  }
}

export default new RouteRepository();
