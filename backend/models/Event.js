const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required']
  },
  description: {
    type: String,
    required: [true, 'Event description is required']
  },
  date: {
    type: Date,
    required: [true, 'Event date is required']
  },
  startTime: String,
  endTime: String,
  venue: {
    name: String,
    address: String,
    city: String,
    state: String,
    zipCode: String,
    lat: Number,
    lng: Number
  },
  capacity: {
    type: Number,
    required: [true, 'Event capacity is required']
  },
  registered: {
    type: Number,
    default: 0
  },
  attended: {
    type: Number,
    default: 0
  },
  speakers: [{
    name: String,
    title: String,
    bio: String,
    image: String
  }],
  image: String,
  category: {
    type: String,
    enum: ['conference', 'workshop', 'webinar', 'festival', 'meetup', 'other'],
    default: 'conference'
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'ongoing', 'completed', 'cancelled'],
    default: 'draft'
  },
  tags: [String],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Event', eventSchema);