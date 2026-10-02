import routeService from './route.service.js';

class RouteController {
  // Stops
  createStop = async (req, res, next) => {
    try {
      const stop = await routeService.createStop(req.body);
      res.status(201).json({ success: true, data: stop });
    } catch (error) {
      next(error);
    }
  };

  getAllStops = async (req, res, next) => {
    try {
      const stops = await routeService.getAllStops();
      res.status(200).json({ success: true, count: stops.length, data: stops });
    } catch (error) {
      next(error);
    }
  };

  deleteStop = async (req, res, next) => {
    try {
      await routeService.deleteStop(req.params.id);
      res.status(200).json({ success: true, message: 'Stop deleted successfully' });
    } catch (error) {
      next(error);
    }
  };

  // Routes
  createRoute = async (req, res, next) => {
    try {
      const route = await routeService.createRoute(req.body);
      res.status(201).json({ success: true, data: route });
    } catch (error) {
      next(error);
    }
  };

  getAllRoutes = async (req, res, next) => {
    try {
      const routes = await routeService.getAllRoutes();
      res.status(200).json({ success: true, count: routes.length, data: routes });
    } catch (error) {
      next(error);
    }
  };

  getRouteById = async (req, res, next) => {
    try {
      const route = await routeService.getRouteById(req.params.id);
      res.status(200).json({ success: true, data: route });
    } catch (error) {
      next(error);
    }
  };

  deleteRoute = async (req, res, next) => {
    try {
      await routeService.deleteRoute(req.params.id);
      res.status(200).json({ success: true, message: 'Route deleted successfully' });
    } catch (error) {
      next(error);
    }
  };
}

export default new RouteController();
