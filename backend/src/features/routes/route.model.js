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
      enum: ['LineString']
    },
    coordinates: {
      type: [[Number]] // Array of [longitude, latitude] arrays
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Ensure path is undefined if coordinates are empty or less than 2 points (invalid GeoJSON LineString)
routeSchema.pre('save', function (next) {
  if (this.path && (!Array.isArray(this.path.coordinates) || this.path.coordinates.length < 2)) {
    this.path = undefined;
  }
  next();
});

// Enable geospatial queries for the path with sparse index
routeSchema.index({ path: '2dsphere' }, { sparse: true });

export default mongoose.model('Route', routeSchema);
