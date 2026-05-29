const express = require('express');
const Attendance = require('../models/Attendance');
const Event = require('../models/Event');
const User = require('../models/User');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(verifyToken, verifyAdmin);

// ============ DASHBOARD STATS ============
router.get('/dashboard', async (req, res) => {
  try {
    const [
      totalUsers,
      totalEvents,
      totalRegistrations,
      checkedIn,
      recentEvents
    ] = await Promise.all([
      User.countDocuments(),
      Event.countDocuments(),
      Attendance.countDocuments({ status: { $ne: 'cancelled' } }),
      Attendance.countDocuments({ status: 'checked-in' }),
      Event.find().sort({ createdAt: -1 }).limit(5).populate('createdBy', 'firstName lastName')
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalEvents,
        totalRegistrations,
        checkedIn
      },
      recentEvents
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error loading dashboard',
      error: error.message
    });
  }
});

// ============ MANAGE USERS ============
router.get('/users', async (req, res) => {
  try {
    const users = await User.find()
      .select('-verificationToken -verificationExpiry')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
});

// ============ ATTENDANCE REPORTS ============
router.get('/attendance', async (req, res) => {
  try {
    const { eventId, status } = req.query;
    const query = {};

    if (eventId) query.eventId = eventId;
    if (status) query.status = status;

    const attendance = await Attendance.find(query)
      .populate('userId', 'firstName lastName email phone')
      .populate('eventId', 'title date category')
      .sort({ registeredAt: -1 });

    res.json({
      success: true,
      count: attendance.length,
      attendance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching attendance report',
      error: error.message
    });
  }
});

// ============ EXPORT ATTENDANCE CSV ============
router.post('/export', async (req, res) => {
  try {
    const { eventId } = req.body;
    const query = eventId ? { eventId } : {};

    const records = await Attendance.find(query)
      .populate('userId', 'firstName lastName email phone')
      .populate('eventId', 'title date')
      .sort({ registeredAt: -1 });

    const escapeCsv = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const rows = [
      ['Event', 'Date', 'First Name', 'Last Name', 'Email', 'Phone', 'Status', 'Registered At', 'Checked In At'],
      ...records.map((record) => [
        record.eventId?.title,
        record.eventId?.date?.toISOString(),
        record.userId?.firstName,
        record.userId?.lastName,
        record.userId?.email,
        record.userId?.phone,
        record.status,
        record.registeredAt?.toISOString(),
        record.checkedInAt?.toISOString()
      ])
    ];

    const csv = rows.map((row) => row.map(escapeCsv).join(',')).join('\n');

    res.header('Content-Type', 'text/csv');
    res.attachment('attendance-report.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error exporting attendance',
      error: error.message
    });
  }
});

module.exports = router;
