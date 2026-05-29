const express = require('express');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const Attendance = require('../models/Attendance');
const Event = require('../models/Event');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

const router = express.Router();

// ============ REGISTER FOR EVENT ============
router.post('/register', verifyToken, async (req, res) => {
  try {
    const { eventId } = req.body;

    if (!eventId) {
      return res.status(400).json({
        success: false,
        message: 'Event ID is required'
      });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    if (!['published', 'ongoing'].includes(event.status)) {
      return res.status(400).json({
        success: false,
        message: 'Registration is not open for this event'
      });
    }

    const existingAttendance = await Attendance.findOne({
      eventId,
      userId: req.userId,
      status: { $ne: 'cancelled' }
    });

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        message: 'You are already registered for this event'
      });
    }

    if (event.registered >= event.capacity) {
      return res.status(400).json({
        success: false,
        message: 'Event capacity is full'
      });
    }

    const uniqueId = uuidv4();
    const qrPayload = JSON.stringify({ eventId, userId: req.userId, uniqueId });
    const qrCode = await QRCode.toDataURL(qrPayload);

    const attendance = await Attendance.create({
      eventId,
      userId: req.userId,
      uniqueId,
      qrCode
    });

    event.registered += 1;
    await event.save();

    res.status(201).json({
      success: true,
      message: 'Registered successfully',
      attendance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error registering for event',
      error: error.message
    });
  }
});

// ============ CHECK IN ATTENDEE ============
router.post('/checkin', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { uniqueId } = req.body;

    if (!uniqueId) {
      return res.status(400).json({
        success: false,
        message: 'Unique attendance ID is required'
      });
    }

    const attendance = await Attendance.findOne({ uniqueId }).populate('eventId');
    if (!attendance || attendance.status === 'cancelled') {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    if (attendance.status === 'checked-in') {
      return res.status(400).json({
        success: false,
        message: 'Attendee already checked in'
      });
    }

    attendance.status = 'checked-in';
    attendance.checkedInAt = new Date();
    await attendance.save();

    await Event.findByIdAndUpdate(attendance.eventId._id, { $inc: { attended: 1 } });

    res.json({
      success: true,
      message: 'Check-in successful',
      attendance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking in attendee',
      error: error.message
    });
  }
});

// ============ GET ATTENDANCE LIST FOR EVENT (ADMIN) ============
router.get('/:eventId', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const attendance = await Attendance.find({ eventId: req.params.eventId })
      .populate('userId', 'firstName lastName email phone')
      .populate('eventId', 'title date venue')
      .sort({ registeredAt: -1 });

    res.json({
      success: true,
      count: attendance.length,
      attendance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching attendance',
      error: error.message
    });
  }
});

// ============ GET USER ATTENDANCE ============
router.get('/user/:userId', verifyToken, async (req, res) => {
  try {
    if (req.userRole !== 'admin' && String(req.userId) !== req.params.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const attendance = await Attendance.find({ userId: req.params.userId })
      .populate('eventId', 'title description date startTime endTime venue image category status')
      .sort({ registeredAt: -1 });

    res.json({
      success: true,
      count: attendance.length,
      attendance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user attendance',
      error: error.message
    });
  }
});

module.exports = router;
