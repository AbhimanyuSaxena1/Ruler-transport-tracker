import mongoose from 'mongoose';

const incidentSchema = new mongoose.Schema(
  {
    organizationId: {
      type: String,
      default: 'default_org',
      index: true,
    },
    busId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bus',
      required: [true, 'Bus ID is required'],
      index: true,
    },
    busNumber: {
      type: String,
      required: [true, 'Bus number is required'],
      trim: true,
    },
    licensePlate: {
      type: String,
      default: '',
      trim: true,
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    driverName: {
      type: String,
      default: 'Unassigned',
    },
    routeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Route',
      default: null,
    },
    routeName: {
      type: String,
      default: 'Unassigned',
    },
    type: {
      type: String,
      enum: ['BUS_OFFLINE', 'TRACKING_INTERRUPTED'],
      default: 'BUS_OFFLINE',
      index: true,
    },
    status: {
      type: String,
      enum: ['OPEN', 'ACKNOWLEDGED', 'RESOLVED'],
      default: 'OPEN',
      index: true,
    },
    severity: {
      type: String,
      enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
      default: 'HIGH',
    },
    reason: {
      type: String,
      default: 'NO_RECENT_LOCATION',
    },
    lastLocationAt: {
      type: Date,
      default: null,
    },
    lastKnownLocation: {
      latitude: {
        type: Number,
        default: null,
      },
      longitude: {
        type: Number,
        default: null,
      },
    },
    detectedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    acknowledgedAt: {
      type: Date,
      default: null,
    },
    acknowledgedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    recoveredAt: {
      type: Date,
      default: null,
    },
    deduplicationKey: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for querying incidents by bus and active status
incidentSchema.index({ busId: 1, status: 1, detectedAt: -1 });
incidentSchema.index({ organizationId: 1, status: 1 });

const Incident = mongoose.model('Incident', incidentSchema);

export default Incident;
