import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file located at backend root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const config = Object.freeze({
  env: process.env.NODE_ENV || 'development',
  port: parseInt(String(process.env.PORT || '5000').trim(), 10) || 5000,
  host: process.env.HOST || '0.0.0.0',
  mongo: {
    uri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bus_tracking',
    options: {
      serverSelectionTimeoutMS: 5000,
    },
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'fallback_dev_access_secret_key_15m',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'fallback_dev_refresh_secret_key_7d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  offlineMonitoring: {
    interruptedTimeoutSeconds: parseInt(String(process.env.OFFLINE_INTERRUPTED_TIMEOUT_SECONDS || '30').trim(), 10) || 30,
    offlineTimeoutSeconds: parseInt(String(process.env.OFFLINE_TIMEOUT_SECONDS || '120').trim(), 10) || 120,
    checkIntervalSeconds: parseInt(String(process.env.OFFLINE_CHECK_INTERVAL_SECONDS || '10').trim(), 10) || 10,
    recoveryFreshnessSeconds: parseInt(String(process.env.RECOVERY_FRESHNESS_SECONDS || '60').trim(), 10) || 60,
  },
});

export default config;
