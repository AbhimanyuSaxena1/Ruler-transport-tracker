import mongoose from 'mongoose';

const scheduleSchema = new mongoose.Schema({
  bus: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bus',
    required: [true, 'Bus is required']
  },
  route: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    required: [true, 'Route is required']
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  startTime: {
    type: String,
    required: [true, 'Start time is required (e.g. 08:00 AM)']
  },
  endTime: {
    type: String,
    required: [true, 'End time is required (e.g. 09:30 AM)']
  },
  operatingDays: {
    type: [String],
    default: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
  },
  status: {
    type: String,
    enum: ['scheduled', 'active', 'completed', 'delayed', 'cancelled'],
    default: 'scheduled'
  },
  delayMinutes: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

export default mongoose.model('Schedule', scheduleSchema);
