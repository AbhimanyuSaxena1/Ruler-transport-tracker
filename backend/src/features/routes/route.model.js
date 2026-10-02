import mongoose from 'mongoose';

const routeSchema = new mongoose.Schema({
  routeName: {
    type: String,
    required: [true, 'Route name is required'],
    trim: true,
    unique: true
  },
  origin: {
    type: String,
    required: true
  },
  destination: {
    type: String,
    required: true
  },
  stops: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Stop'
  }],
  path: {
    type: {
      type: String,
      enum: ['LineString'],
      default: 'LineString'
    },
    coordinates: {
      type: [[Number]], // Array of [longitude, latitude] arrays
      default: []
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Enable geospatial queries for the path if needed
routeSchema.index({ path: '2dsphere' });

export default mongoose.model('Route', routeSchema);
