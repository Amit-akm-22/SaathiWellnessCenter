/**
 * Admin Controller - Phase 3
 * All endpoints require authMiddleware + roleMiddleware('admin')
 */
const crypto = require('crypto');
const mongoose = require('mongoose');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const SlotCapacity = require('../models/SlotCapacity');
const Notification = require('../models/Notification');
const NotificationLog = require('../models/NotificationLog');
const AuditLog = require('../models/AuditLog');
const BlockedDate = require('../models/BlockedDate');
const Settings = require('../models/Settings');
const FAQ = require('../models/FAQ');
const auditService = require('../services/auditService');
const notificationService = require('../services/notificationService');
const { invalidateCache, getSettings } = require('../services/settingsService');
const { validateTransition } = require('../utils/stateMachine');

// ─── Helpers ────────────────────────────────────────────────────────────────

const generateTempPassword = () => {
  // min 8 chars, has letter + number
  return 'Saathi' + Math.floor(10000 + Math.random() * 90000).toString();
};

const ACTIVE_STATUSES = ['pending', 'approved', 'in_progress', 'rescheduled'];
const CAPACITY_STATUSES = ['pending', 'approved', 'in_progress'];

// ─── FEATURE 1: ADMIN DASHBOARD ─────────────────────────────────────────────

// @desc    Get admin dashboard overview
// @route   GET /api/admin/dashboard
const getDashboard = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

    const [
      totalStudents,
      totalCounselors,
      totalAppointments,
      todaysSessions,
      pendingRequests,
      urgentUnhandled,
      failedNotifications,
      stuckPending,
      avgFeedbackAgg,
      recentAudit,
      activeUsers30d,
      completedAppointments,
      Appointment_approved,
      Appointment_inProgress,
      Appointment_rejected,
      Appointment_cancelled,
      Appointment_noShow,
      urgentAlerts,
      recentAppointments,
    ] = await Promise.all([
      User.countDocuments({ role: 'student', isDeleted: false }),
      User.countDocuments({ role: 'counselor', isDeleted: false }),
      Appointment.countDocuments({}),
      Appointment.countDocuments({ date: { $gte: today, $lt: tomorrow } }),
      Appointment.countDocuments({ status: 'pending' }),
      Appointment.countDocuments({ status: 'pending', urgentFlag: true }),
      NotificationLog.countDocuments({ status: 'failed', createdAt: { $gte: yesterday24h } }),
      Appointment.countDocuments({ status: 'pending', createdAt: { $lte: fortyEightHoursAgo } }),
      Appointment.aggregate([
        { $match: { 'feedback.rating': { $exists: true } } },
        { $group: { _id: null, avg: { $avg: '$feedback.rating' }, count: { $sum: 1 } } },
      ]),
      AuditLog.find({})
        .sort({ createdAt: -1 })
        .limit(15)
        .populate('actorId', 'name email role'),
      User.countDocuments({ lastLoginAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }),
      Appointment.countDocuments({ status: 'completed' }),
      Appointment.countDocuments({ status: 'approved' }),
      Appointment.countDocuments({ status: 'in_progress' }),
      Appointment.countDocuments({ status: 'rejected' }),
      Appointment.countDocuments({ status: 'cancelled' }),
      Appointment.countDocuments({ status: 'no_show' }),
      Appointment.find({
        $or: [{ isUrgent: true }, { severity: { $in: ['high', 'severe'] } }],
      })
        .sort({ createdAt: -1 })
        .limit(6),
      Appointment.find({}).sort({ createdAt: -1 }).limit(6),
    ]);

    // Slots at full capacity today
    const settings = await getSettings();
    const todayStr = today.toISOString().split('T')[0];
    const todayCapacities = await SlotCapacity.find({ date: todayStr });
    const fullSlots = todayCapacities.filter(
      (sc) => sc.bookedCount >= (settings.maxBookingsPerSlot || 3)
    ).length;

    const avgRating =
      avgFeedbackAgg.length > 0
        ? Math.round(avgFeedbackAgg[0].avg * 10) / 10
        : 4.8;

    const noShowRate =
      totalAppointments > 0
        ? Math.round((completedAppointments > 0 ? (Appointment_noShow / totalAppointments) : 0) * 100)
        : 0;

    const statsObj = {
      totalStudents,
      totalCounselors,
      totalAppointments,
      completedAppointments,
      pending: pendingRequests,
      approved: Appointment_approved,
      inProgress: Appointment_inProgress,
      completed: completedAppointments,
      rejected: Appointment_rejected,
      cancelled: Appointment_cancelled,
      noShow: Appointment_noShow,
      noShowRate,
      avgRating,
      urgentUnhandled,
      activeUsers: activeUsers30d,
    };

    res.json({
      success: true,
      data: {
        stats: statsObj,
        cards: {
          ...statsObj,
          todaysSessions,
          avgFeedbackRating: avgRating,
        },
        systemHealth: {
          failedNotifications24h: failedNotifications,
          stuckPendingOver48h: stuckPending,
          fullSlotsToday: fullSlots,
        },
        urgentAlerts,
        recentAppointments,
        recentAudit,
        recentActivity: recentAudit,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get global analytics (reuse counselor analytics + admin extras)
// @route   GET /api/admin/analytics
const getAnalytics = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const matchDate = {};
    if (from) matchDate.$gte = new Date(from);
    if (to) matchDate.$lte = new Date(to);
    const dateFilter = Object.keys(matchDate).length ? { date: matchDate } : {};

    const [
      byStatus,
      bySeverity,
      byCategory,
      byBranch,
      byMonth,
      counselorWise,
      registrationTrend,
      cancellationStats,
      noShowStats,
      feedbackDist,
    ] = await Promise.all([
      Appointment.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Appointment.aggregate([
        { $match: { ...dateFilter, severity: { $ne: '' } } },
        { $group: { _id: '$severity', count: { $sum: 1 } } },
      ]),
      Appointment.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$issueCategory', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Appointment.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$branch', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Appointment.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$date' } },
            count: { $sum: 1 },
            completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          },
        },
        { $sort: { '_id': 1 } },
        { $limit: 12 },
      ]),
      // Counselor-wise session counts
      Appointment.aggregate([
        { $match: { ...dateFilter, counselorId: { $ne: null } } },
        { $group: { _id: '$counselorId', sessions: { $sum: 1 }, completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } } } },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'counselor' } },
        { $unwind: { path: '$counselor', preserveNullAndEmpty: true } },
        { $project: { counselorName: '$counselor.name', sessions: 1, completed: 1 } },
        { $sort: { sessions: -1 } },
      ]),
      // New registrations per month
      User.aggregate([
        { $match: { role: 'student', isDeleted: false } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id': 1 } },
        { $limit: 12 },
      ]),
      // Cancellation rate
      Appointment.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
          },
        },
      ]),
      // No-show rate
      Appointment.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            noShow: { $sum: { $cond: [{ $eq: ['$status', 'no_show'] }, 1, 0] } },
          },
        },
      ]),
      // Feedback distribution
      Appointment.aggregate([
        { $match: { ...dateFilter, 'feedback.rating': { $exists: true } } },
        { $group: { _id: '$feedback.rating', count: { $sum: 1 } } },
        { $sort: { '_id': 1 } },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        byStatus,
        bySeverity,
        byCategory,
        byBranch,
        byMonth,
        counselorWise,
        registrationTrend,
        cancellationRate: cancellationStats[0]
          ? { total: cancellationStats[0].total, cancelled: cancellationStats[0].cancelled }
          : { total: 0, cancelled: 0 },
        noShowRate: noShowStats[0]
          ? { total: noShowStats[0].total, noShow: noShowStats[0].noShow }
          : { total: 0, noShow: 0 },
        feedbackDist,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── FEATURE 2: USER MANAGEMENT ─────────────────────────────────────────────

// @desc    List users with pagination, search, filters
// @route   GET /api/admin/users
const getUsers = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      role,
      branch,
      year,
      gender,
      isActive,
      isDeleted = 'false',
      sort = '-createdAt',
    } = req.query;

    const query = {};

    // Soft delete filter
    if (isDeleted === 'true') {
      query.isDeleted = true;
    } else {
      query.isDeleted = { $ne: true };
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { enrollmentNo: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }
    if (role) query.role = role;
    if (branch) query.branch = branch;
    if (year) query.year = year;
    if (gender) query.gender = gender;
    if (isActive !== undefined && isActive !== '') {
      query.isActive = isActive === 'true';
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .populate('createdBy', 'name email');

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single user detail (admin full view)
// @route   GET /api/admin/users/:id
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate('createdBy', 'name email');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Load full appointment history for students
    let appointments = [];
    if (user.role === 'student') {
      appointments = await Appointment.find({ studentId: user._id })
        .sort({ createdAt: -1 })
        .populate('counselorId', 'name email');
    }

    // Notification history
    const notifications = await Notification.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      success: true,
      data: { user, appointments, notifications },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create user of any role with temp password
// @route   POST /api/admin/users
const createUser = async (req, res, next) => {
  try {
    const { name, email, enrollmentNo, role, branch, year, gender, phone, specialization } =
      req.body;

    if (!name || !email || !role) {
      return res.status(400).json({ success: false, message: 'name, email, and role are required.' });
    }

    // Check uniqueness
    const existing = await User.findOne({
      $or: [{ email }, ...(enrollmentNo ? [{ enrollmentNo }] : [])],
    });
    if (existing) {
      return res.status(409).json({
        success: false,
        message:
          existing.email === email
            ? 'Email already registered.'
            : 'Enrollment number already in use.',
      });
    }

    const tempPassword = generateTempPassword();
    const user = await User.create({
      name,
      email,
      enrollmentNo: enrollmentNo || undefined,
      password: tempPassword,
      role,
      branch: branch || '',
      year: year || '',
      gender: gender || '',
      phone: phone || '',
      specialization: specialization || '',
      mustChangePassword: true,
      isActive: true,
      createdBy: req.user._id,
    });

    await auditService.log({
      actorId: req.user._id,
      actorRole: req.user.role,
      action: 'USER_CREATED',
      entityType: 'User',
      entityId: user._id,
      after: { name, email, role },
      meta: { createdVia: 'admin_panel' },
      ...auditService.fromReq(req),
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully.',
      data: {
        user: user.toJSON(),
        tempPassword, // shown once
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Edit any user
// @route   PUT /api/admin/users/:id
const updateUser = async (req, res, next) => {
  try {
    const { name, email, enrollmentNo, branch, year, gender, phone, specialization, role, isActive } =
      req.body;
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user || user.isDeleted) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Safety guards
    if (userId === req.user._id.toString()) {
      if (role && role !== req.user.role) {
        return res.status(403).json({ success: false, message: 'Admin cannot change their own role.' });
      }
      if (isActive === false) {
        return res.status(403).json({ success: false, message: 'Admin cannot deactivate themselves.' });
      }
    }

    // If changing role from admin, check at least 1 admin remains
    if (role && role !== 'admin' && user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin', isDeleted: false, _id: { $ne: userId } });
      if (adminCount === 0) {
        return res.status(400).json({ success: false, message: 'Cannot demote: system must have at least 1 active admin.' });
      }
    }

    // Uniqueness checks if changing email or enrollmentNo
    if (email && email !== user.email) {
      const dup = await User.findOne({ email, _id: { $ne: userId } });
      if (dup) return res.status(409).json({ success: false, message: 'Email already in use by another user.' });
    }
    if (enrollmentNo && enrollmentNo !== user.enrollmentNo) {
      const dup = await User.findOne({ enrollmentNo, _id: { $ne: userId } });
      if (dup) return res.status(409).json({ success: false, message: 'Enrollment number already in use.' });
    }

    const before = user.toJSON();

    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (enrollmentNo !== undefined) user.enrollmentNo = enrollmentNo;
    if (branch !== undefined) user.branch = branch;
    if (year !== undefined) user.year = year;
    if (gender !== undefined) user.gender = gender;
    if (phone !== undefined) user.phone = phone;
    if (specialization !== undefined) user.specialization = specialization;
    if (role !== undefined && role !== user.role) {
      user.role = role;
      user.tokenVersion = (user.tokenVersion || 0) + 1; // invalidate old tokens
    }
    if (isActive !== undefined) {
      if (!isActive && user.role === 'admin') {
        const adminCount = await User.countDocuments({ role: 'admin', isActive: true, isDeleted: false, _id: { $ne: userId } });
        if (adminCount === 0) {
          return res.status(400).json({ success: false, message: 'Cannot deactivate: last active admin.' });
        }
      }
      user.isActive = isActive;
    }

    await user.save();

    // If student name/email/enrollmentNo changed, update appointment snapshots
    if (user.role === 'student' && (name || email || enrollmentNo)) {
      const updateFields = {};
      if (name) updateFields.name = name;
      if (email) updateFields.email = email;
      if (enrollmentNo) updateFields.enrollmentNo = enrollmentNo;
      if (Object.keys(updateFields).length > 0) {
        await Appointment.updateMany({ studentId: userId }, { $set: updateFields });
      }
    }

    await auditService.log({
      actorId: req.user._id,
      actorRole: req.user.role,
      action: 'USER_UPDATED',
      entityType: 'User',
      entityId: user._id,
      before,
      after: user.toJSON(),
      ...auditService.fromReq(req),
    });

    res.json({ success: true, message: 'User updated.', data: { user: user.toJSON() } });
  } catch (err) {
    next(err);
  }
};

// @desc    Reset password (generates new temp password)
// @route   POST /api/admin/users/:id/reset-password
const resetPassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('+password');
    if (!user || user.isDeleted) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const tempPassword = generateTempPassword();
    user.password = tempPassword;
    user.mustChangePassword = true;
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save();

    await auditService.log({
      actorId: req.user._id,
      actorRole: req.user.role,
      action: 'PASSWORD_RESET',
      entityType: 'User',
      entityId: user._id,
      meta: { reason: 'Admin initiated password reset' },
      ...auditService.fromReq(req),
    });

    res.json({
      success: true,
      message: 'Password reset successfully.',
      data: { tempPassword },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Soft delete user
// @route   DELETE /api/admin/users/:id
const deleteUser = async (req, res, next) => {
  try {
    const { confirm, cancelActiveAppointments = true } = req.body;
    const userId = req.params.id;

    if (userId === req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Cannot delete your own account.' });
    }

    const user = await User.findById(userId);
    if (!user || user.isDeleted) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin', isDeleted: false, _id: { $ne: userId } });
      if (adminCount === 0) {
        return res.status(400).json({ success: false, message: 'Cannot delete: last admin account.' });
      }
    }

    // Check for active appointments
    const activeAppointments = await Appointment.find({
      studentId: userId,
      status: { $in: ACTIVE_STATUSES },
      date: { $gte: new Date() },
    });

    if (activeAppointments.length > 0 && !confirm) {
      return res.status(409).json({
        success: false,
        message: `User has ${activeAppointments.length} active appointment(s). Set confirm=true to delete and auto-cancel them.`,
        data: { activeAppointments: activeAppointments.map((a) => ({ _id: a._id, date: a.date, status: a.status })) },
      });
    }

    // Cancel active appointments
    for (const apt of activeAppointments) {
      const dateStr = new Date(apt.date).toISOString().split('T')[0];
      if (CAPACITY_STATUSES.includes(apt.status)) {
        await SlotCapacity.findOneAndUpdate(
          { date: dateStr, slot: apt.timeSlot, bookedCount: { $gt: 0 } },
          { $inc: { bookedCount: -1 } }
        );
      }
      apt.status = 'cancelled';
      apt.rejectionReason = 'Student account deleted by admin.';
      await apt.save();
    }

    // Soft delete
    user.isDeleted = true;
    user.isActive = false;
    user.deletedAt = new Date();
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save();

    await auditService.log({
      actorId: req.user._id,
      actorRole: req.user.role,
      action: 'USER_DELETED',
      entityType: 'User',
      entityId: user._id,
      before: { name: user.name, email: user.email, role: user.role },
      meta: { cancelledAppointments: activeAppointments.length },
      ...auditService.fromReq(req),
    });

    res.json({
      success: true,
      message: `User soft-deleted. ${activeAppointments.length} active appointment(s) cancelled.`,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Restore soft-deleted user
// @route   POST /api/admin/users/:id/restore
const restoreUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    user.isDeleted = false;
    user.deletedAt = null;
    user.isActive = true;
    await user.save();

    await auditService.log({
      actorId: req.user._id,
      actorRole: req.user.role,
      action: 'USER_RESTORED',
      entityType: 'User',
      entityId: user._id,
      ...auditService.fromReq(req),
    });

    res.json({ success: true, message: 'User restored.', data: { user: user.toJSON() } });
  } catch (err) {
    next(err);
  }
};

// @desc    Force change-password screen: user submits new password
// @route   POST /api/admin/change-password
// (called by the logged-in user who has mustChangePassword=true)
const changeOwnPassword = async (req, res, next) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 8 || !/[a-zA-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters with at least one letter and one number.',
      });
    }

    const user = await User.findById(req.user._id).select('+password');
    user.password = newPassword;
    user.mustChangePassword = false;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (err) {
    next(err);
  }
};

// @desc    CSV bulk import of students
// @route   POST /api/admin/users/import-csv
const importCSV = async (req, res, next) => {
  try {
    const { rows } = req.body; // pre-parsed on client or sent as JSON array
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ success: false, message: 'No rows provided.' });
    }

    const results = { created: 0, skipped: 0, failed: 0, details: [] };

    for (const row of rows) {
      const { name, email, enrollmentNo, branch, year, gender, phone } = row;

      // Basic validation
      if (!name || !email || !enrollmentNo) {
        results.failed++;
        results.details.push({ row, status: 'failed', reason: 'name, email, and enrollmentNo are required.' });
        continue;
      }

      if (!/^\S+@\S+\.\S+$/.test(email)) {
        results.failed++;
        results.details.push({ row, status: 'failed', reason: 'Invalid email format.' });
        continue;
      }

      // Check duplicates
      const existing = await User.findOne({ $or: [{ email }, { enrollmentNo }] });
      if (existing) {
        results.skipped++;
        results.details.push({ row, status: 'skipped', reason: 'Email or enrollment already exists.' });
        continue;
      }

      try {
        const tempPassword = generateTempPassword();
        await User.create({
          name,
          email,
          enrollmentNo,
          password: tempPassword,
          role: 'student',
          branch: branch || 'Other',
          year: year || '',
          gender: gender || '',
          phone: phone || '',
          mustChangePassword: true,
          isActive: true,
          createdBy: req.user._id,
        });
        results.created++;
        results.details.push({ row, status: 'created', tempPassword });
      } catch (e) {
        results.failed++;
        results.details.push({ row, status: 'failed', reason: e.message });
      }
    }

    await auditService.log({
      actorId: req.user._id,
      actorRole: req.user.role,
      action: 'CSV_IMPORT',
      entityType: 'User',
      meta: { created: results.created, skipped: results.skipped, failed: results.failed, total: rows.length },
      ...auditService.fromReq(req),
    });

    res.json({ success: true, message: 'Import complete.', data: results });
  } catch (err) {
    next(err);
  }
};

// ─── FEATURE 3: APPOINTMENT OVERRIDE ────────────────────────────────────────

// @desc    Get all appointments (admin - full view)
// @route   GET /api/admin/appointments
const getAppointments = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      branch,
      year,
      gender,
      issueCategory,
      severity,
      isUrgent,
      dateFrom,
      dateTo,
      search,
      sort = '-createdAt',
    } = req.query;

    const query = {};
    if (status) query.status = status;
    if (branch) query.branch = branch;
    if (year) query.year = year;
    if (gender) query.gender = gender;
    if (issueCategory) query.issueCategory = issueCategory;
    if (severity) query.severity = severity;
    if (isUrgent !== undefined) query.urgentFlag = isUrgent === 'true';
    if (dateFrom || dateTo) {
      query.date = {};
      if (dateFrom) query.date.$gte = new Date(dateFrom);
      if (dateTo) query.date.$lte = new Date(dateTo);
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { enrollmentNo: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Appointment.countDocuments(query);
    const appointments = await Appointment.find(query)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .populate('studentId', 'name email phone')
      .populate('counselorId', 'name email')
      .populate('approvedBy', 'name');

    res.json({
      success: true,
      data: {
        appointments,
        pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) },
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Override any appointment field (admin superpower)
// @route   PUT /api/admin/appointments/:id
const overrideAppointment = async (req, res, next) => {
  try {
    const {
      status,
      reason,
      notifyStudent = true,
      forceOverCapacity = false,
      date,
      timeSlot,
      issueCategory,
      severity,
      urgentFlag,
      counselorId,
      meetingMode,
      meetingLink,
      sessionNotes,
    } = req.body;

    if (!reason) {
      return res.status(400).json({ success: false, message: 'A reason is required for admin overrides.' });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found.' });

    const before = appointment.toObject();
    const oldStatus = appointment.status;
    const oldDateStr = new Date(appointment.date).toISOString().split('T')[0];
    const oldSlot = appointment.timeSlot;

    // Handle date/slot reschedule
    if (date || timeSlot) {
      const newDate = date ? new Date(date) : new Date(appointment.date);
      const newSlot = timeSlot || appointment.timeSlot;
      const newDateStr = newDate.toISOString().split('T')[0];

      // Free old capacity if it was a capacity-counted status
      if (CAPACITY_STATUSES.includes(appointment.status)) {
        await SlotCapacity.findOneAndUpdate(
          { date: oldDateStr, slot: oldSlot, bookedCount: { $gt: 0 } },
          { $inc: { bookedCount: -1 } }
        );
      }

      // Acquire new capacity
      const settings = await getSettings();
      const newCapDoc = await SlotCapacity.findOne({ date: newDateStr, slot: newSlot });
      if (
        !forceOverCapacity &&
        newCapDoc &&
        newCapDoc.bookedCount >= settings.maxBookingsPerSlot &&
        CAPACITY_STATUSES.includes(appointment.status)
      ) {
        // Roll back: re-add old capacity
        await SlotCapacity.findOneAndUpdate(
          { date: oldDateStr, slot: oldSlot },
          { $inc: { bookedCount: 1 } },
          { upsert: true }
        );
        return res.status(409).json({
          success: false,
          message: 'Target slot is full. Set forceOverCapacity=true to override.',
        });
      }

      if (CAPACITY_STATUSES.includes(appointment.status)) {
        await SlotCapacity.findOneAndUpdate(
          { date: newDateStr, slot: newSlot },
          { $inc: { bookedCount: 1 } },
          { upsert: true, new: true }
        );
      }

      appointment.date = newDate;
      appointment.timeSlot = newSlot;
    }

    // Handle status change
    if (status && status !== appointment.status) {
      const settings = await getSettings();
      const wasCapacity = CAPACITY_STATUSES.includes(oldStatus);
      const isCapacity = CAPACITY_STATUSES.includes(status);
      const dateStr = new Date(appointment.date).toISOString().split('T')[0];

      if (wasCapacity && !isCapacity) {
        // Moving out of capacity statuses - free slot
        await SlotCapacity.findOneAndUpdate(
          { date: dateStr, slot: appointment.timeSlot, bookedCount: { $gt: 0 } },
          { $inc: { bookedCount: -1 } }
        );
      } else if (!wasCapacity && isCapacity) {
        // Moving into capacity statuses - acquire slot
        const capDoc = await SlotCapacity.findOne({ date: dateStr, slot: appointment.timeSlot });
        if (!forceOverCapacity && capDoc && capDoc.bookedCount >= settings.maxBookingsPerSlot) {
          return res.status(409).json({
            success: false,
            message: 'Slot is full. Set forceOverCapacity=true to override.',
          });
        }
        await SlotCapacity.findOneAndUpdate(
          { date: dateStr, slot: appointment.timeSlot },
          { $inc: { bookedCount: 1 } },
          { upsert: true }
        );
      }

      appointment.status = status;
    }

    // Other field overrides
    if (issueCategory !== undefined) appointment.issueCategory = issueCategory;
    if (severity !== undefined) appointment.severity = severity;
    if (urgentFlag !== undefined) appointment.urgentFlag = urgentFlag;
    if (counselorId !== undefined) appointment.counselorId = counselorId;
    if (meetingMode !== undefined) appointment.meetingMode = meetingMode;
    if (meetingLink !== undefined) appointment.meetingLink = meetingLink;
    if (sessionNotes !== undefined) {
      appointment.sessionNotes = { ...appointment.sessionNotes, ...sessionNotes, updatedAt: new Date() };
    }

    await appointment.save();

    // Notify student if requested
    if (notifyStudent) {
      await notificationService.send({
        userId: appointment.studentId,
        appointmentId: appointment._id,
        channels: ['in_app'],
        subject: 'Appointment Updated by Admin',
        body: `Your appointment has been updated by an admin. Status: ${appointment.status}. Reason: ${reason}`,
        type: 'appointment_updated',
      });
    }

    await auditService.log({
      actorId: req.user._id,
      actorRole: req.user.role,
      action: 'APPOINTMENT_OVERRIDE',
      entityType: 'Appointment',
      entityId: appointment._id,
      before,
      after: appointment.toObject(),
      meta: { reason, notifyStudent, forceOverCapacity },
      ...auditService.fromReq(req),
    });

    res.json({ success: true, message: 'Appointment updated.', data: { appointment } });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete appointment (soft delete - set to cancelled, free capacity)
// @route   DELETE /api/admin/appointments/:id
const deleteAppointment = async (req, res, next) => {
  try {
    const { reason } = req.body;
    if (!reason) return res.status(400).json({ success: false, message: 'Reason required.' });

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found.' });

    const before = appointment.toObject();
    const dateStr = new Date(appointment.date).toISOString().split('T')[0];

    if (CAPACITY_STATUSES.includes(appointment.status)) {
      await SlotCapacity.findOneAndUpdate(
        { date: dateStr, slot: appointment.timeSlot, bookedCount: { $gt: 0 } },
        { $inc: { bookedCount: -1 } }
      );
    }

    appointment.status = 'cancelled';
    appointment.rejectionReason = reason;
    await appointment.save();

    await notificationService.send({
      userId: appointment.studentId,
      appointmentId: appointment._id,
      channels: ['in_app'],
      subject: 'Appointment Cancelled by Admin',
      body: `Your appointment on ${dateStr} has been cancelled by admin. Reason: ${reason}`,
      type: 'appointment_cancelled',
    });

    await auditService.log({
      actorId: req.user._id,
      actorRole: req.user.role,
      action: 'APPOINTMENT_OVERRIDE',
      entityType: 'Appointment',
      entityId: appointment._id,
      before,
      after: { status: 'cancelled', reason },
      meta: { reason, action: 'soft_delete' },
      ...auditService.fromReq(req),
    });

    res.json({ success: true, message: 'Appointment cancelled and capacity freed.' });
  } catch (err) {
    next(err);
  }
};

// @desc    Moderate feedback (edit or remove)
// @route   PATCH /api/admin/appointments/:id/feedback
const moderateFeedback = async (req, res, next) => {
  try {
    const { action, comment, rating } = req.body; // action: 'edit' | 'remove'
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found.' });

    const before = appointment.feedback ? { ...appointment.feedback } : null;

    if (action === 'remove') {
      appointment.feedback = undefined;
    } else if (action === 'edit') {
      if (!appointment.feedback) return res.status(400).json({ success: false, message: 'No feedback to edit.' });
      if (comment !== undefined) appointment.feedback.comment = comment;
      if (rating !== undefined) appointment.feedback.rating = rating;
    }

    await appointment.save();

    await auditService.log({
      actorId: req.user._id,
      actorRole: req.user.role,
      action: 'FEEDBACK_MODERATED',
      entityType: 'Appointment',
      entityId: appointment._id,
      before: { feedback: before },
      after: { feedback: appointment.feedback || null },
      meta: { action },
      ...auditService.fromReq(req),
    });

    res.json({ success: true, message: `Feedback ${action}d.` });
  } catch (err) {
    next(err);
  }
};

// @desc    Recalculate slot capacities from actual appointments
// @route   POST /api/admin/slots/recalculate
const recalculateCapacity = async (req, res, next) => {
  try {
    const { apply = false } = req.body;

    // Get all active appointments
    const activeApts = await Appointment.find({
      status: { $in: CAPACITY_STATUSES },
    }).select('date timeSlot status');

    // Build correct counts
    const counts = {};
    for (const apt of activeApts) {
      const dateStr = new Date(apt.date).toISOString().split('T')[0];
      const key = `${dateStr}|${apt.timeSlot}`;
      counts[key] = (counts[key] || 0) + 1;
    }

    // Get current DB values
    const current = await SlotCapacity.find({});
    const diff = [];

    // Find discrepancies
    const allKeys = new Set([
      ...current.map((c) => `${c.date}|${c.slot}`),
      ...Object.keys(counts),
    ]);

    for (const key of allKeys) {
      const [date, slot] = key.split('|');
      const expected = counts[key] || 0;
      const currentDoc = current.find((c) => c.date === date && c.slot === slot);
      const actual = currentDoc ? currentDoc.bookedCount : 0;

      if (expected !== actual) {
        diff.push({ date, slot, currentCount: actual, correctCount: expected, drift: actual - expected });
      }
    }

    if (apply) {
      // Apply corrections
      for (const d of diff) {
        await SlotCapacity.findOneAndUpdate(
          { date: d.date, slot: d.slot },
          { $set: { bookedCount: d.correctCount } },
          { upsert: true }
        );
      }
      // Remove stale entries with 0 count
      await SlotCapacity.deleteMany({ bookedCount: 0 });

      await auditService.log({
        actorId: req.user._id,
        actorRole: req.user.role,
        action: 'CAPACITY_RECALCULATED',
        entityType: 'SlotCapacity',
        meta: { driftsFixed: diff.length },
        ...auditService.fromReq(req),
      });
    }

    res.json({
      success: true,
      message: apply ? `Applied ${diff.length} correction(s).` : `Found ${diff.length} discrepancies (dry run).`,
      data: { diff, applied: apply },
    });
  } catch (err) {
    next(err);
  }
};

// ─── FEATURE 4: SYSTEM SETTINGS ─────────────────────────────────────────────

// @desc    Get current settings
// @route   GET /api/admin/settings
const getSettingsRoute = async (req, res, next) => {
  try {
    let settings = await Settings.findOne({ _singleton: 'global' });
    if (!settings) {
      settings = await Settings.findOneAndUpdate(
        { _singleton: 'global' },
        { $setOnInsert: { ...Settings.defaultSettings, _singleton: 'global' } },
        { upsert: true, new: true }
      );
    }

    // Add env check for notification channels (without revealing secrets)
    const channelStatus = {
      smtp: {
        configured: !!(process.env.SMTP_HOST && process.env.SMTP_USER),
        host: process.env.SMTP_HOST ? `${process.env.SMTP_HOST}:${process.env.SMTP_PORT || 587}` : null,
      },
      sms: {
        configured: !!(process.env.TWILIO_ACCOUNT_SID || process.env.FAST2SMS_API_KEY),
        provider: process.env.TWILIO_ACCOUNT_SID ? 'Twilio' : process.env.FAST2SMS_API_KEY ? 'Fast2SMS' : null,
      },
      googleMeet: {
        configured: !!process.env.GOOGLE_MEET_CREDENTIALS,
      },
    };

    res.json({ success: true, data: { settings, channelStatus } });
  } catch (err) {
    next(err);
  }
};

// @desc    Update settings (partial update)
// @route   PUT /api/admin/settings
const updateSettings = async (req, res, next) => {
  try {
    const before = await Settings.findOne({ _singleton: 'global' }).lean();

    // Validation: if reducing maxBookingsPerSlot, warn about affected slots
    if (req.body.maxBookingsPerSlot !== undefined) {
      const newMax = Number(req.body.maxBookingsPerSlot);
      if (newMax < 1) return res.status(400).json({ success: false, message: 'maxBookingsPerSlot must be at least 1.' });

      const today = new Date().toISOString().split('T')[0];
      const affectedSlots = await SlotCapacity.find({
        date: { $gte: today },
        bookedCount: { $gt: newMax },
      });

      if (affectedSlots.length > 0 && !req.body.forceApply) {
        return res.status(409).json({
          success: false,
          message: `Reducing maxBookingsPerSlot to ${newMax} would affect ${affectedSlots.length} existing slot(s). Set forceApply=true to proceed.`,
          data: { affectedSlots },
        });
      }
    }

    // Remove internal fields from update payload
    delete req.body._singleton;
    delete req.body._id;
    delete req.body.forceApply;

    const settings = await Settings.findOneAndUpdate(
      { _singleton: 'global' },
      { $set: req.body },
      { upsert: true, new: true }
    );

    // Invalidate cache
    invalidateCache();

    await auditService.log({
      actorId: req.user._id,
      actorRole: req.user.role,
      action: 'SETTINGS_CHANGED',
      entityType: 'Settings',
      entityId: settings._id,
      before,
      after: settings.toObject(),
      ...auditService.fromReq(req),
    });

    res.json({ success: true, message: 'Settings updated.', data: { settings } });
  } catch (err) {
    next(err);
  }
};

// @desc    Send test email/SMS notification
// @route   POST /api/admin/settings/test-notification
const testNotification = async (req, res, next) => {
  try {
    const { channel } = req.body; // 'email' | 'sms'
    await notificationService.send({
      userId: req.user._id,
      channels: [channel],
      subject: 'Saathi - Test Notification',
      body: `This is a test ${channel} notification from Saathi Admin Panel. Sent at ${new Date().toISOString()}.`,
      toEmail: req.user.email,
      toPhone: req.user.phone,
      type: 'general',
    });
    res.json({ success: true, message: `Test ${channel} notification sent (check notification logs).` });
  } catch (err) {
    next(err);
  }
};

// ─── FEATURE 5: BLOCKED DATES ────────────────────────────────────────────────

// @desc    Get all blocked dates
// @route   GET /api/admin/blocked-dates
const getBlockedDates = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const query = {};
    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = from;
      if (to) query.date.$lte = to;
    }
    const blocked = await BlockedDate.find(query).sort({ date: 1 }).populate('createdBy', 'name');
    res.json({ success: true, data: { blocked } });
  } catch (err) {
    next(err);
  }
};

// @desc    Add blocked date/slot
// @route   POST /api/admin/blocked-dates
const addBlockedDate = async (req, res, next) => {
  try {
    const { date, slot, reason } = req.body;
    if (!date || !reason) {
      return res.status(400).json({ success: false, message: 'date and reason are required.' });
    }

    // Check if existing appointments fall on this date/slot
    const query = { date: { $gte: new Date(date), $lte: new Date(date + 'T23:59:59') } };
    if (slot) query.timeSlot = slot;
    const affected = await Appointment.find({
      ...query,
      status: { $in: ACTIVE_STATUSES },
    }).select('_id studentId date timeSlot status name');

    const blocked = await BlockedDate.create({ date, slot: slot || null, reason, createdBy: req.user._id });

    await auditService.log({
      actorId: req.user._id,
      actorRole: req.user.role,
      action: 'BLOCKED_DATE_ADDED',
      entityType: 'BlockedDate',
      entityId: blocked._id,
      after: { date, slot, reason },
      meta: { affectedAppointments: affected.length },
      ...auditService.fromReq(req),
    });

    res.status(201).json({
      success: true,
      message: 'Date/slot blocked.',
      data: { blocked, affectedAppointments: affected },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Remove blocked date
// @route   DELETE /api/admin/blocked-dates/:id
const removeBlockedDate = async (req, res, next) => {
  try {
    const blocked = await BlockedDate.findByIdAndDelete(req.params.id);
    if (!blocked) return res.status(404).json({ success: false, message: 'Blocked date not found.' });

    await auditService.log({
      actorId: req.user._id,
      actorRole: req.user.role,
      action: 'BLOCKED_DATE_REMOVED',
      entityType: 'BlockedDate',
      entityId: blocked._id,
      before: blocked.toObject(),
      ...auditService.fromReq(req),
    });

    res.json({ success: true, message: 'Blocked date removed.' });
  } catch (err) {
    next(err);
  }
};

// ─── FEATURE 5: CONTENT MANAGEMENT (FAQs) ────────────────────────────────────

// @desc    Get all FAQs (admin - includes inactive)
// @route   GET /api/admin/faqs
const getFAQs = async (req, res, next) => {
  try {
    const faqs = await FAQ.find({}).sort({ category: 1, order: 1 });
    res.json({ success: true, data: { faqs } });
  } catch (err) {
    next(err);
  }
};

// @desc    Create FAQ
// @route   POST /api/admin/faqs
const createFAQ = async (req, res, next) => {
  try {
    const { category, question, answer, order, isActive } = req.body;
    if (!category || !question || !answer) {
      return res.status(400).json({ success: false, message: 'category, question, and answer are required.' });
    }
    const faq = await FAQ.create({ category, question, answer, order: order || 0, isActive: isActive !== false });

    await auditService.log({
      actorId: req.user._id,
      actorRole: req.user.role,
      action: 'FAQ_UPDATED',
      entityType: 'FAQ',
      entityId: faq._id,
      after: faq.toObject(),
      meta: { action: 'created' },
      ...auditService.fromReq(req),
    });

    res.status(201).json({ success: true, message: 'FAQ created.', data: { faq } });
  } catch (err) {
    next(err);
  }
};

// @desc    Update FAQ
// @route   PUT /api/admin/faqs/:id
const updateFAQ = async (req, res, next) => {
  try {
    const faq = await FAQ.findById(req.params.id);
    if (!faq) return res.status(404).json({ success: false, message: 'FAQ not found.' });

    const before = faq.toObject();
    const { category, question, answer, order, isActive } = req.body;
    if (category !== undefined) faq.category = category;
    if (question !== undefined) faq.question = question;
    if (answer !== undefined) faq.answer = answer;
    if (order !== undefined) faq.order = order;
    if (isActive !== undefined) faq.isActive = isActive;
    await faq.save();

    await auditService.log({
      actorId: req.user._id,
      actorRole: req.user.role,
      action: 'FAQ_UPDATED',
      entityType: 'FAQ',
      entityId: faq._id,
      before,
      after: faq.toObject(),
      meta: { action: 'updated' },
      ...auditService.fromReq(req),
    });

    res.json({ success: true, message: 'FAQ updated.', data: { faq } });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete FAQ
// @route   DELETE /api/admin/faqs/:id
const deleteFAQ = async (req, res, next) => {
  try {
    const faq = await FAQ.findByIdAndDelete(req.params.id);
    if (!faq) return res.status(404).json({ success: false, message: 'FAQ not found.' });

    await auditService.log({
      actorId: req.user._id,
      actorRole: req.user.role,
      action: 'FAQ_UPDATED',
      entityType: 'FAQ',
      entityId: faq._id,
      before: faq.toObject(),
      meta: { action: 'deleted' },
      ...auditService.fromReq(req),
    });

    res.json({ success: true, message: 'FAQ deleted.' });
  } catch (err) {
    next(err);
  }
};

// ─── FEATURE 6: AUDIT LOGS & NOTIFICATION LOGS ──────────────────────────────

// @desc    Get audit logs with filters
// @route   GET /api/admin/audit-logs
const getAuditLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, actorId, action, entityType, from, to } = req.query;
    const query = {};
    if (actorId) query.actorId = actorId;
    if (action) query.action = { $regex: action, $options: 'i' };
    if (entityType) query.entityType = entityType;
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('actorId', 'name email role');

    res.json({
      success: true,
      data: {
        logs,
        pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) },
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get notification logs (global admin view)
// @route   GET /api/admin/notification-logs
const getNotificationLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, channel, userId } = req.query;
    const query = {};
    if (status) query.status = status;
    if (channel) query.channel = channel;
    if (userId) query.userId = userId;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await NotificationLog.countDocuments(query);
    const logs = await NotificationLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('userId', 'name email');

    res.json({
      success: true,
      data: {
        logs,
        pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) },
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Retry failed notification
// @route   POST /api/admin/notification-logs/:id/retry
const retryNotification = async (req, res, next) => {
  try {
    const log = await NotificationLog.findById(req.params.id).populate('userId', 'email phone');
    if (!log) return res.status(404).json({ success: false, message: 'Notification log not found.' });
    if (log.status !== 'failed') {
      return res.status(400).json({ success: false, message: 'Only failed notifications can be retried.' });
    }

    await notificationService.send({
      userId: log.userId._id,
      appointmentId: log.appointmentId,
      channels: [log.channel],
      subject: log.subject,
      body: log.body,
      toEmail: log.userId.email,
      toPhone: log.userId.phone,
      type: 'general',
    });

    res.json({ success: true, message: 'Retry sent. Check notification logs for result.' });
  } catch (err) {
    next(err);
  }
};

// @desc    Export data as CSV
// @route   GET /api/admin/export/:type
const exportData = async (req, res, next) => {
  try {
    const { type } = req.params; // users | appointments | audit-logs
    let data = [];
    let headers = [];

    if (type === 'users') {
      data = await User.find({ isDeleted: false }).lean();
      headers = ['_id', 'name', 'email', 'enrollmentNo', 'role', 'branch', 'year', 'gender', 'phone', 'isActive', 'createdAt', 'lastLoginAt'];
    } else if (type === 'appointments') {
      data = await Appointment.find({}).lean();
      headers = ['_id', 'name', 'email', 'enrollmentNo', 'branch', 'year', 'date', 'timeSlot', 'issueCategory', 'status', 'severity', 'isUrgent', 'createdAt'];
    } else if (type === 'audit-logs') {
      data = await AuditLog.find({}).populate('actorId', 'name email').lean();
      headers = ['_id', 'actorId', 'actorRole', 'action', 'entityType', 'entityId', 'ip', 'createdAt'];
    } else {
      return res.status(400).json({ success: false, message: 'Invalid export type. Use: users, appointments, audit-logs' });
    }

    const escapeCSV = (val) => {
      if (val === null || val === undefined) return '';
      const str = String(val instanceof Date ? val.toISOString() : val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const csv = [
      headers.join(','),
      ...data.map((row) =>
        headers.map((h) => {
          if (h === 'actorId' && row.actorId && typeof row.actorId === 'object') {
            return escapeCSV(row.actorId.email);
          }
          return escapeCSV(row[h]);
        }).join(',')
      ),
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${type}-export-${Date.now()}.csv"`);
    res.send(csv);
  } catch (err) {
    next(err);
  }
};

// @desc    Get announcement banner (public endpoint, called from home/dashboard)
// @route   GET /api/admin/announcement (public)
const getAnnouncement = async (req, res, next) => {
  try {
    const settings = await getSettings();
    const banner = settings.announcementBanner || { text: '', isActive: false };
    res.json({ success: true, data: { banner } });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboard,
  getAnalytics,
  getUsers,
  getUserById,
  createUser,
  updateUser,
  resetPassword,
  deleteUser,
  restoreUser,
  changeOwnPassword,
  importCSV,
  getAppointments,
  overrideAppointment,
  deleteAppointment,
  moderateFeedback,
  recalculateCapacity,
  getSettingsRoute,
  updateSettings,
  testNotification,
  getBlockedDates,
  addBlockedDate,
  removeBlockedDate,
  getFAQs,
  createFAQ,
  updateFAQ,
  deleteFAQ,
  getAuditLogs,
  getNotificationLogs,
  retryNotification,
  exportData,
  getAnnouncement,
};
