import mongoose from 'mongoose';

const busSchema = new mongoose.Schema(
  {
    busNumber: {
      type: String,
      required: [true, 'Bus number is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    licensePlate: {
      type: String,
      uppercase: true,
      trim: true,
      default: '',
    },
    capacity: {
      type: Number,
      default: 40,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'maintenance'],
      default: 'active',
      index: true,
    },
    assignedDriver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    assignedRoute: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Route',
      default: null,
    },
    currentLocation: {
      latitude: {
        type: Number,
        default: null,
      },
      longitude: {
        type: Number,
        default: null,
      },
    },
    speed: {
      type: Number,
      default: 0,
    },
    heading: {
      type: Number,
      default: 0,
    },
    accuracy: {
      type: Number,
      default: null,
    },
    lastLocationUpdate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Bus = mongoose.model('Bus', busSchema);

export default Bus;
