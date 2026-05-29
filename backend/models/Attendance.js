const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  registeredAt: {
    type: Date,
    default: Date.now
  },
  checkedInAt: Date,
  status: {
    type: String,
    enum: ['registered', 'checked-in', 'no-show', 'cancelled'],
    default: 'registered'
  },
  qrCode: String,
  uniqueId: {
    type: String,
    unique: true
  },
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: Date
});

attendanceSchema.index({ eventId: 1, userId: 1 }, { unique: true });

attendanceSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Attendance', attendanceSchema);
