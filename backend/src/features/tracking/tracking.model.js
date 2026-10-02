import mongoose from 'mongoose';

const trackingHistorySchema = new mongoose.Schema(
  {
    busId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bus',
      required: [true, 'Bus ID is required'],
      index: true,
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    latitude: {
      type: Number,
      required: [true, 'Latitude is required'],
      min: -90,
      max: 90,
    },
    longitude: {
      type: Number,
      required: [true, 'Longitude is required'],
      min: -180,
      max: 180,
    },
    speed: {
      type: Number,
      default: 0,
      min: 0,
    },
    heading: {
      type: Number,
      default: 0,
      min: 0,
      max: 360,
    },
    accuracy: {
      type: Number,
      default: null,
      min: 0,
    },
    recordedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
  }
);

// Compound index for efficient historical timeline queries per bus
trackingHistorySchema.index({ busId: 1, recordedAt: -1 });

const TrackingHistory = mongoose.model('TrackingHistory', trackingHistorySchema);

export default TrackingHistory;
