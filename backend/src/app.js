import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './features/auth/auth.routes.js';
import busRoutes from './features/buses/bus.routes.js';
import trackingRoutes from './features/tracking/tracking.routes.js';
import routeRoutes from './features/routes/route.routes.js';
import scheduleRoutes from './features/schedules/schedule.routes.js';
import { notFoundHandler, errorHandler } from './middlewares/errorMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Global Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Bus Tracking API is running',
    timestamp: new Date().toISOString(),
  });
});

// Feature Routes
app.use('/api/auth', authRoutes);
app.use('/api/buses', busRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/schedules', scheduleRoutes);

// Error Handling Middlewares
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
