const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const SlotCapacity = require('../models/SlotCapacity');
const NotificationLog = require('../models/NotificationLog');
const notificationService = require('../services/notificationService');
const meetingService = require('../services/meetingService');
const { validateTransition } = require('../utils/stateMachine');
const { TIME_SLOTS, MAX_BOOKINGS_PER_SLOT } = require('../config/constants');

const SCREENING_QUESTIONS = [
  'Little interest or pleasure in doing things',
  'Feeling down, hopeless or depressed',
  'Feeling nervous, anxious or on edge',
  'Not being able to stop or control worrying',
  'Have you had thoughts of hurting yourself?',
];

const SCREENING_OPTIONS = [
  { value: 0, label: 'Not at all' },
  { value: 1, label: 'Several days' },
  { value: 2, label: 'More than half the days' },
  { value: 3, label: 'Nearly every day' },
];

/**
 * 1. COUNSELOR DASHBOARD
 * GET /api/counselor/dashboard
 */
const getDashboard = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Week start (Monday)
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const startOfWeek = new Date(today);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    // 1. Metric: Today's sessions
    const todaySessionsCount = await Appointment.countDocuments({
      date: { $gte: today, $lt: tomorrow },
      status: { $in: ['approved', 'in_progress', 'completed'] },
    });

    // 2. Metric: Pending requests
    const pendingRequestsCount = await Appointment.countDocuments({
      status: 'pending',
    });

    // 3. Metric: Urgent cases needing action
    const urgentCasesCount = await Appointment.countDocuments({
      status: 'pending',
      $or: [{ isUrgent: true }, { urgentFlag: true }, { severity: 'Severe' }],
    });

    // 4. Metric: Completed this week
    const completedThisWeek = await Appointment.countDocuments({
      status: 'completed',
      date: { $gte: startOfWeek, $lt: tomorrow },
    });

    // 5. Metric: Average feedback rating & helpful percentage
    const feedbackAgg = await Appointment.aggregate([
      { $match: { 'feedback.rating': { $exists: true, $ne: null } } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$feedback.rating' },
          totalFeedback: { $sum: 1 },
          helpfulCount: {
            $sum: { $cond: [{ $eq: ['$feedback.wasHelpful', true] }, 1, 0] },
          },
        },
      },
    ]);

    const avgRating = feedbackAgg.length > 0 ? Number(feedbackAgg[0].avgRating.toFixed(1)) : 0;
    const helpfulPercentage =
      feedbackAgg.length > 0 && feedbackAgg[0].totalFeedback > 0
        ? Math.round((feedbackAgg[0].helpfulCount / feedbackAgg[0].totalFeedback) * 100)
        : 100;

    // 6. Today's Queue list (ordered by slot time)
    const todayQueue = await Appointment.find({
      date: { $gte: today, $lt: tomorrow },
      status: { $in: ['approved', 'in_progress', 'completed', 'rescheduled'] },
    })
      .populate('studentId', 'name email enrollmentNo branch year gender phone')
      .sort({ timeSlot: 1 });

    // 7. Priority Alert Strip (Unhandled urgent or Severe pending appointments)
    const priorityAlerts = await Appointment.find({
      status: 'pending',
      $or: [{ isUrgent: true }, { urgentFlag: true }, { severity: 'Severe' }],
    })
      .populate('studentId', 'name email enrollmentNo branch year gender phone')
      .sort({ createdAt: 1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        metrics: {
          todaySessions: todaySessionsCount,
          pendingRequests: pendingRequestsCount,
          urgentCases: urgentCasesCount,
          completedThisWeek,
          averageRating: avgRating,
          helpfulPercentage,
        },
        todayQueue,
        priorityAlerts,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 2. APPOINTMENT REQUESTS LIST
 * GET /api/counselor/appointments
 */
const getAppointments = async (req, res, next) => {
  try {
    const {
      status,
      severity,
      issueCategory,
      branch,
      year,
      gender,
      isUrgent,
      startDate,
      endDate,
      search,
      sortBy = 'priority',
      page = 1,
      limit = 15,
    } = req.query;

    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }
    if (severity && severity !== 'all') {
      query.severity = severity;
    }
    if (issueCategory && issueCategory !== 'all') {
      query.issueCategory = issueCategory;
    }
    if (branch && branch !== 'all') {
      query.branch = branch;
    }
    if (year && year !== 'all') {
      query.year = year;
    }
    if (gender && gender !== 'all') {
      query.gender = gender;
    }
    if (isUrgent === 'true') {
      query.$or = [{ isUrgent: true }, { urgentFlag: true }];
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        const s = new Date(startDate);
        s.setHours(0, 0, 0, 0);
        query.date.$gte = s;
      }
      if (endDate) {
        const e = new Date(endDate);
        e.setHours(23, 59, 59, 999);
        query.date.$lte = e;
      }
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      const searchConditions = [
        { name: searchRegex },
        { email: searchRegex },
        { enrollmentNo: searchRegex },
        { customCategory: searchRegex },
      ];
      if (query.$or) {
        query.$and = [{ $or: query.$or }, { $or: searchConditions }];
        delete query.$or;
      } else {
        query.$or = searchConditions;
      }
    }

    // Default sort = Priority (urgent first, Severe > Moderate > Mild, earliest date/slot, oldest request)
    let appointments;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 15;
    const skip = (pageNum - 1) * limitNum;

    if (sortBy === 'priority') {
      // Use aggregation pipeline to compute priority score for accurate multi-level sort
      const pipeline = [
        { $match: query },
        {
          $addFields: {
            isHighPriority: {
              $cond: [
                {
                  $or: [
                    { $eq: ['$isUrgent', true] },
                    { $eq: ['$urgentFlag', true] },
                  ],
                },
                1,
                0,
              ],
            },
            severityRank: {
              $switch: {
                branches: [
                  { case: { $eq: ['$severity', 'Severe'] }, then: 3 },
                  { case: { $eq: ['$severity', 'Moderate'] }, then: 2 },
                  { case: { $eq: ['$severity', 'Mild'] }, then: 1 },
                ],
                default: 0,
              },
            },
          },
        },
        {
          $sort: {
            isHighPriority: -1,
            severityRank: -1,
            date: 1,
            timeSlot: 1,
            createdAt: 1,
          },
        },
        { $skip: skip },
        { $limit: limitNum },
      ];

      appointments = await Appointment.aggregate(pipeline);
      // Populate student info
      appointments = await Appointment.populate(appointments, {
        path: 'studentId',
        select: 'name email enrollmentNo branch year gender phone',
      });
    } else {
      let sortObj = { createdAt: -1 };
      if (sortBy === 'date_asc') sortObj = { date: 1, timeSlot: 1 };
      else if (sortBy === 'date_desc') sortObj = { date: -1, timeSlot: -1 };
      else if (sortBy === 'created_asc') sortObj = { createdAt: 1 };
      else if (sortBy === 'created_desc') sortObj = { createdAt: -1 };

      appointments = await Appointment.find(query)
        .populate('studentId', 'name email enrollmentNo branch year gender phone')
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum);
    }

    const total = await Appointment.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        appointments,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 3. GET SINGLE APPOINTMENT DETAILS (FOR COUNSELOR DRAWER)
 * GET /api/counselor/appointments/:id
 */
const getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id).populate(
      'studentId',
      'name email enrollmentNo branch year gender phone'
    );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found.',
      });
    }

    // Format full screening answers with questions and labels
    const formattedScreening = (appointment.screeningAnswers || []).map(
      (val, idx) => ({
        question: SCREENING_QUESTIONS[idx] || `Question ${idx + 1}`,
        score: val,
        label:
          SCREENING_OPTIONS.find((o) => o.value === val)?.label || `${val}`,
      })
    );

    // Retrieve previous appointment history for this student
    const studentHistory = await Appointment.find({
      studentId: appointment.studentId?._id || appointment.studentId,
      _id: { $ne: appointment._id },
    })
      .sort({ createdAt: -1 })
      .select(
        'date timeSlot issueCategory status sessionNotes feedback meeting createdAt'
      );

    res.status(200).json({
      success: true,
      data: {
        appointment,
        formattedScreening,
        studentHistory,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 4. APPROVE APPOINTMENT
 * PATCH /api/counselor/appointments/:id/approve
 */
const approveAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    validateTransition(appointment.status, 'approved');

    appointment.status = 'approved';
    appointment.approvedBy = req.user._id;
    appointment.approvedAt = new Date();
    appointment.counselorId = req.user._id;

    if (req.body.meetingMode) {
      appointment.meetingMode = req.body.meetingMode;
      if (req.body.meetingLink) {
        appointment.meetingLink = req.body.meetingLink;
        appointment.meeting = {
          mode: req.body.meetingMode,
          link: req.body.meetingLink,
          provider: 'manual',
          createdBy: req.user._id,
        };
      }
    }

    await appointment.save();

    const dateStr = new Date(appointment.date).toISOString().split('T')[0];
    await notificationService.send({
      userId: appointment.studentId,
      appointmentId: appointment._id,
      channels: ['in_app', 'email'],
      type: 'appointment_approved',
      subject: 'Counseling Appointment Approved',
      body: `Your counseling appointment for ${dateStr} at ${appointment.timeSlot} has been approved by ${req.user.name}.`,
    });

    res.status(200).json({
      success: true,
      message: 'Appointment approved successfully.',
      data: { appointment },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 5. REJECT APPOINTMENT
 * PATCH /api/counselor/appointments/:id/reject
 */
const rejectAppointment = async (req, res, next) => {
  try {
    const { reason } = req.body;
    if (!reason || reason.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'A rejection reason of at least 10 characters is required.',
      });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    validateTransition(appointment.status, 'rejected');

    appointment.status = 'rejected';
    appointment.rejectedBy = req.user._id;
    appointment.rejectedAt = new Date();
    appointment.rejectionReason = reason.trim();
    await appointment.save();

    // Atomically decrement slot capacity to free up the seat
    const dateStr = new Date(appointment.date).toISOString().split('T')[0];
    await SlotCapacity.findOneAndUpdate(
      { date: dateStr, slot: appointment.timeSlot, bookedCount: { $gt: 0 } },
      { $inc: { bookedCount: -1 } }
    );

    // Notify student with the reason
    await notificationService.send({
      userId: appointment.studentId,
      appointmentId: appointment._id,
      channels: ['in_app', 'email'],
      type: 'appointment_rejected',
      subject: 'Update Regarding Your Counseling Appointment Request',
      body: `Your appointment request for ${dateStr} at ${appointment.timeSlot} could not be approved. Reason: ${reason.trim()}`,
    });

    res.status(200).json({
      success: true,
      message: 'Appointment rejected and slot capacity freed.',
      data: { appointment },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 6. START SESSION
 * PATCH /api/counselor/appointments/:id/start-session
 */
const startSession = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    validateTransition(appointment.status, 'in_progress');

    appointment.status = 'in_progress';
    appointment.sessionStartedAt = new Date();
    appointment.counselorId = req.user._id;
    await appointment.save();

    res.status(200).json({
      success: true,
      message: 'Session started successfully.',
      data: { appointment },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 7. END SESSION
 * PATCH /api/counselor/appointments/:id/end-session
 */
const endSession = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    validateTransition(appointment.status, 'completed');

    const endedAt = new Date();
    appointment.status = 'completed';
    appointment.sessionEndedAt = endedAt;

    if (appointment.sessionStartedAt) {
      const durationMs = endedAt.getTime() - new Date(appointment.sessionStartedAt).getTime();
      appointment.actualDurationMins = Math.max(1, Math.round(durationMs / 60000));
    } else {
      appointment.actualDurationMins = 45;
    }

    await appointment.save();

    // Notify student for feedback
    await notificationService.send({
      userId: appointment.studentId,
      appointmentId: appointment._id,
      channels: ['in_app', 'email'],
      type: 'feedback_reminder',
      subject: 'How was your counseling session?',
      body: 'Your counseling session has ended. We would love to hear your feedback to help us support you better.',
    });

    res.status(200).json({
      success: true,
      message: 'Session ended successfully. Feedback notification sent to student.',
      data: { appointment },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 8. MARK NO-SHOW
 * PATCH /api/counselor/appointments/:id/no-show
 */
const markNoShow = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    validateTransition(appointment.status, 'no_show');

    appointment.status = 'no_show';
    await appointment.save();

    res.status(200).json({
      success: true,
      message: 'Appointment marked as No-show.',
      data: { appointment },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 9. SESSION NOTES
 * PUT /api/counselor/appointments/:id/notes
 */
const saveSessionNotes = async (req, res, next) => {
  try {
    const {
      summary,
      advice,
      followUpNeeded = false,
      followUpDate = null,
      forwarded = false,
      forwardedTo = '',
      forwardedReason = '',
    } = req.body;

    if (!summary || !summary.trim()) {
      return res.status(400).json({ success: false, message: 'Summary of discussion is required.' });
    }
    if (!advice || !advice.trim()) {
      return res.status(400).json({ success: false, message: 'Advice given is required.' });
    }

    if (forwarded) {
      if (!forwardedTo || !forwardedTo.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Forwarded recipient (forwardedTo) is required when forwarding.',
        });
      }
      if (!forwardedReason || !forwardedReason.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Reason for forwarding is required when forwarding.',
        });
      }
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    appointment.sessionNotes = {
      summary: summary.trim(),
      advice: advice.trim(),
      followUpNeeded: Boolean(followUpNeeded),
      followUpDate: followUpDate ? new Date(followUpDate) : null,
      forwarded: Boolean(forwarded),
      forwardedTo: forwarded ? forwardedTo.trim() : '',
      forwardedReason: forwarded ? forwardedReason.trim() : '',
      updatedAt: new Date(),
    };

    await appointment.save();

    res.status(200).json({
      success: true,
      message: 'Session notes saved successfully.',
      data: { sessionNotes: appointment.sessionNotes },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 10. HANDLE URGENT (APPROVE + ONLINE MEET)
 * PATCH /api/counselor/appointments/:id/urgent
 */
const handleUrgent = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    validateTransition(appointment.status, 'approved');

    const meetData = await meetingService.createMeetLink(
      appointment,
      req.body.meetingLink || ''
    );

    appointment.status = 'approved';
    appointment.approvedBy = req.user._id;
    appointment.approvedAt = new Date();
    appointment.counselorId = req.user._id;
    appointment.meetingMode = 'online';
    appointment.meetingLink = meetData.link;
    appointment.meeting = {
      mode: 'online',
      link: meetData.link,
      provider: meetData.provider,
      createdBy: req.user._id,
    };

    await appointment.save();

    const dateStr = new Date(appointment.date).toISOString().split('T')[0];
    await notificationService.send({
      userId: appointment.studentId,
      appointmentId: appointment._id,
      channels: ['in_app', 'email', 'sms'],
      type: 'meeting_link_shared',
      subject: 'URGENT: Counseling Session Confirmed (Online Meeting)',
      body: `Your urgent session for ${dateStr} at ${appointment.timeSlot} has been approved. Join online here: ${meetData.link}`,
    });

    res.status(200).json({
      success: true,
      message: 'Urgent appointment approved with online meeting link generated.',
      data: { appointment },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 11. SWITCH TO ONLINE MEETING
 * PATCH /api/counselor/appointments/:id/online-meeting
 */
const setOnlineMeeting = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    const meetData = await meetingService.createMeetLink(
      appointment,
      req.body.meetingLink || ''
    );

    appointment.meetingMode = 'online';
    appointment.meetingLink = meetData.link;
    appointment.meeting = {
      mode: 'online',
      link: meetData.link,
      provider: meetData.provider,
      createdBy: req.user._id,
    };

    await appointment.save();

    await notificationService.send({
      userId: appointment.studentId,
      appointmentId: appointment._id,
      channels: ['in_app', 'email', 'sms'],
      type: 'meeting_link_shared',
      subject: 'Online Meeting Link Shared',
      body: `Your counseling session has been set to online. Join here: ${meetData.link}`,
    });

    res.status(200).json({
      success: true,
      message: 'Online meeting set and student notified.',
      data: { appointment },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 12. DELAY SESSION (OVERRUN MANAGEMENT)
 * PATCH /api/counselor/appointments/:id/delay
 */
const delaySession = async (req, res, next) => {
  try {
    const { delayMinutes, delayMessage = '' } = req.body;
    const mins = parseInt(delayMinutes, 10);
    if (isNaN(mins) || mins <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid delay minutes (> 0).',
      });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    appointment.delayMinutes = mins;
    appointment.delayNotifiedAt = new Date();
    appointment.delayMessage = delayMessage.trim();
    await appointment.save();

    const bodyText = `Counselor is running late. Please come after ${mins} minutes.${delayMessage ? ' Note: ' + delayMessage : ''}`;
    await notificationService.send({
      userId: appointment.studentId,
      appointmentId: appointment._id,
      channels: ['in_app', 'email', 'sms'],
      type: 'appointment_delayed',
      subject: 'Session Timing Delay Alert',
      body: bodyText,
    });

    res.status(200).json({
      success: true,
      message: `Delay notification sent to student (${mins} mins).`,
      data: { appointment },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 13. RESCHEDULE APPOINTMENT (ATOMIC CAPACITY SHIFT)
 * POST /api/counselor/appointments/:id/reschedule
 */
const rescheduleAppointment = async (req, res, next) => {
  try {
    const { newDate, newSlot, reason } = req.body;
    if (!newDate || !newSlot || !reason || !reason.trim()) {
      return res.status(400).json({
        success: false,
        message: 'New date, new slot, and a reason are required for rescheduling.',
      });
    }

    if (!TIME_SLOTS.includes(newSlot)) {
      return res.status(400).json({ success: false, message: 'Invalid new time slot.' });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    validateTransition(appointment.status, 'rescheduled');

    const newTargetDate = new Date(newDate);
    newTargetDate.setHours(0, 0, 0, 0);
    const newDateStr = newTargetDate.toISOString().split('T')[0];

    // ATOMIC RESERVATION of the new slot
    const slotResult = await SlotCapacity.findOneAndUpdate(
      {
        date: newDateStr,
        slot: newSlot,
        bookedCount: { $lt: MAX_BOOKINGS_PER_SLOT },
      },
      { $inc: { bookedCount: 1 } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    if (!slotResult || slotResult.bookedCount > MAX_BOOKINGS_PER_SLOT) {
      if (slotResult && slotResult.bookedCount > MAX_BOOKINGS_PER_SLOT) {
        await SlotCapacity.findOneAndUpdate(
          { date: newDateStr, slot: newSlot },
          { $inc: { bookedCount: -1 } }
        );
      }
      return res.status(409).json({
        success: false,
        message: 'The selected new time slot is full. No changes were made.',
      });
    }

    // ATOMIC RELEASE of old slot capacity
    const oldDateStr = new Date(appointment.date).toISOString().split('T')[0];
    await SlotCapacity.findOneAndUpdate(
      { date: oldDateStr, slot: appointment.timeSlot, bookedCount: { $gt: 0 } },
      { $inc: { bookedCount: -1 } }
    );

    // Record history
    appointment.rescheduleHistory.push({
      oldDate: appointment.date,
      oldSlot: appointment.timeSlot,
      newDate: newTargetDate,
      newSlot,
      reason: reason.trim(),
      by: req.user._id,
      at: new Date(),
    });

    appointment.date = newTargetDate;
    appointment.timeSlot = newSlot;
    appointment.status = 'approved'; // consistent approved status with history recorded
    appointment.delayMinutes = 0;
    appointment.delayMessage = '';
    await appointment.save();

    await notificationService.send({
      userId: appointment.studentId,
      appointmentId: appointment._id,
      channels: ['in_app', 'email', 'sms'],
      type: 'appointment_rescheduled',
      subject: 'Your Counseling Session Has Been Rescheduled',
      body: `Your appointment has been rescheduled to ${newDateStr} at ${newSlot}. Reason: ${reason.trim()}`,
    });

    res.status(200).json({
      success: true,
      message: 'Appointment successfully rescheduled with capacity safely shifted.',
      data: { appointment },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 14. STUDENT DIRECTORY (UNIQUE STUDENTS LIST)
 * GET /api/counselor/students
 */
const getStudents = async (req, res, next) => {
  try {
    const {
      gender,
      year,
      branch,
      severity,
      status,
      urgent,
      startDate,
      endDate,
      search,
      page = 1,
      limit = 15,
    } = req.query;

    const matchConditions = {};

    if (gender && gender !== 'all') matchConditions.gender = gender;
    if (year && year !== 'all') matchConditions.year = year;
    if (branch && branch !== 'all') matchConditions.branch = branch;
    if (severity && severity !== 'all') matchConditions.severity = severity;
    if (status && status !== 'all') matchConditions.status = status;
    if (urgent === 'true') {
      matchConditions.$or = [{ isUrgent: true }, { urgentFlag: true }];
    }

    if (startDate || endDate) {
      matchConditions.date = {};
      if (startDate) matchConditions.date.$gte = new Date(startDate);
      if (endDate) {
        const e = new Date(endDate);
        e.setHours(23, 59, 59, 999);
        matchConditions.date.$lte = e;
      }
    }

    if (search && search.trim()) {
      const rgx = new RegExp(search.trim(), 'i');
      matchConditions.$or = [
        { name: rgx },
        { email: rgx },
        { enrollmentNo: rgx },
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 15;
    const skip = (pageNum - 1) * limitNum;

    const aggregation = [
      { $match: matchConditions },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$studentId',
          totalAppointments: { $sum: 1 },
          latestAppointment: { $first: '$$ROOT' },
          latestSeverity: { $first: '$severity' },
          latestStatus: { $first: '$status' },
          name: { $first: '$name' },
          email: { $first: '$email' },
          enrollmentNo: { $first: '$enrollmentNo' },
          branch: { $first: '$branch' },
          year: { $first: '$year' },
          gender: { $first: '$gender' },
        },
      },
      { $sort: { 'latestAppointment.createdAt': -1 } },
      {
        $facet: {
          metadata: [{ $count: 'total' }],
          data: [{ $skip: skip }, { $limit: limitNum }],
        },
      },
    ];

    const result = await Appointment.aggregate(aggregation);
    const total = result[0]?.metadata[0]?.total || 0;
    const students = result[0]?.data || [];

    res.status(200).json({
      success: true,
      data: {
        students,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 15. STUDENT FULL PROFILE & COUNSELOR HISTORY
 * GET /api/counselor/students/:id
 */
const getStudentProfileAndHistory = async (req, res, next) => {
  try {
    const student = await User.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    const appointments = await Appointment.find({ studentId: student._id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        student: student.toJSON(),
        appointments,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 16. REPORTS BUILDER (1D & 2D CROSS-TABS)
 * GET /api/counselor/reports
 */
const getReports = async (req, res, next) => {
  try {
    const {
      startDate,
      endDate,
      gender,
      issueCategory,
      year,
      branch,
      severity,
      status,
      isUrgent,
      groupBy = 'issueCategory', // can be comma-separated like "branch,issueCategory"
    } = req.query;

    const matchConditions = {};

    if (startDate || endDate) {
      matchConditions.date = {};
      if (startDate) {
        const s = new Date(startDate);
        s.setHours(0, 0, 0, 0);
        matchConditions.date.$gte = s;
      }
      if (endDate) {
        const e = new Date(endDate);
        e.setHours(23, 59, 59, 999);
        matchConditions.date.$lte = e;
      }
    }

    if (gender && gender !== 'all') matchConditions.gender = gender;
    if (issueCategory && issueCategory !== 'all') matchConditions.issueCategory = issueCategory;
    if (year && year !== 'all') matchConditions.year = year;
    if (branch && branch !== 'all') matchConditions.branch = branch;
    if (severity && severity !== 'all') matchConditions.severity = severity;
    if (status && status !== 'all') matchConditions.status = status;
    if (isUrgent === 'true') {
      matchConditions.$or = [{ isUrgent: true }, { urgentFlag: true }];
    }

    const dimensions = groupBy.split(',').map((s) => s.trim()).filter(Boolean);
    const dim1 = dimensions[0] || 'issueCategory';
    const dim2 = dimensions[1] || null;

    // Row-level list matching filters
    const rowLevel = await Appointment.find(matchConditions)
      .select('date timeSlot name enrollmentNo branch year gender issueCategory severity status actualDurationMins createdAt')
      .sort({ date: -1 })
      .limit(200);

    const totalCount = await Appointment.countDocuments(matchConditions);

    let reportData = [];

    if (!dim2) {
      // 1-Dimension aggregation
      const aggGroupField = dim1 === 'month' ? { $month: '$date' } : `$${dim1}`;
      reportData = await Appointment.aggregate([
        { $match: matchConditions },
        {
          $group: {
            _id: aggGroupField,
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]);

      // Calculate percentages
      reportData = reportData.map((item) => ({
        dimension: item._id !== null ? String(item._id) : 'Unspecified',
        count: item.count,
        percentage: totalCount > 0 ? Number(((item.count / totalCount) * 100).toFixed(1)) : 0,
      }));
    } else {
      // 2-Dimension cross-tab aggregation
      const f1 = dim1 === 'month' ? { $month: '$date' } : `$${dim1}`;
      const f2 = dim2 === 'month' ? { $month: '$date' } : `$${dim2}`;

      reportData = await Appointment.aggregate([
        { $match: matchConditions },
        {
          $group: {
            _id: {
              dim1: f1,
              dim2: f2,
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.dim1': 1, count: -1 } },
      ]);
    }

    res.status(200).json({
      success: true,
      data: {
        dim1,
        dim2,
        totalCount,
        reportData,
        rowLevel,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 17. EXPORT CSV
 * GET /api/counselor/reports/export-csv
 */
const exportReportCSV = async (req, res, next) => {
  try {
    const {
      startDate,
      endDate,
      gender,
      issueCategory,
      year,
      branch,
      severity,
      status,
      isUrgent,
    } = req.query;

    const matchConditions = {};
    if (startDate || endDate) {
      matchConditions.date = {};
      if (startDate) matchConditions.date.$gte = new Date(startDate);
      if (endDate) {
        const e = new Date(endDate);
        e.setHours(23, 59, 59, 999);
        matchConditions.date.$lte = e;
      }
    }
    if (gender && gender !== 'all') matchConditions.gender = gender;
    if (issueCategory && issueCategory !== 'all') matchConditions.issueCategory = issueCategory;
    if (year && year !== 'all') matchConditions.year = year;
    if (branch && branch !== 'all') matchConditions.branch = branch;
    if (severity && severity !== 'all') matchConditions.severity = severity;
    if (status && status !== 'all') matchConditions.status = status;
    if (isUrgent === 'true') {
      matchConditions.$or = [{ isUrgent: true }, { urgentFlag: true }];
    }

    const rows = await Appointment.find(matchConditions).sort({ date: -1 });

    const headers = [
      'Appointment Date',
      'Time Slot',
      'Student Name',
      'Email',
      'Enrollment No',
      'Branch',
      'Year',
      'Gender',
      'Issue Category',
      'Severity',
      'Urgent',
      'Status',
      'Meeting Mode',
      'Duration (Mins)',
    ];

    const csvLines = [headers.join(',')];

    for (const r of rows) {
      const dateStr = new Date(r.date).toISOString().split('T')[0];
      const isUrg = r.isUrgent || r.urgentFlag ? 'YES' : 'NO';
      const row = [
        `"${dateStr}"`,
        `"${r.timeSlot}"`,
        `"${(r.name || '').replace(/"/g, '""')}"`,
        `"${(r.email || '').replace(/"/g, '""')}"`,
        `"${r.enrollmentNo || ''}"`,
        `"${r.branch || ''}"`,
        `"${r.year || ''}"`,
        `"${r.gender || ''}"`,
        `"${(r.issueCategory || '').replace(/"/g, '""')}"`,
        `"${r.severity || 'N/A'}"`,
        `"${isUrg}"`,
        `"${r.status}"`,
        `"${r.meetingMode || 'offline'}"`,
        `"${r.actualDurationMins || 0}"`,
      ];
      csvLines.push(row.join(','));
    }

    const csvContent = csvLines.join('\n');
    const todayStr = new Date().toISOString().split('T')[0];

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=saathi-report-${todayStr}.csv`
    );
    res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};

/**
 * 18. ANALYTICS (REAL AGGREGATIONS FOR CHARTS)
 * GET /api/counselor/analytics
 */
const getAnalytics = async (req, res, next) => {
  try {
    const { range = '30d', branch, year, startDate, endDate } = req.query;

    const matchConditions = {};
    const now = new Date();

    if (range === '7d') {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      matchConditions.date = { $gte: d };
    } else if (range === '30d') {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      matchConditions.date = { $gte: d };
    } else if (range === '6m') {
      const d = new Date();
      d.setMonth(d.getMonth() - 6);
      matchConditions.date = { $gte: d };
    } else if (range === 'custom' && (startDate || endDate)) {
      matchConditions.date = {};
      if (startDate) matchConditions.date.$gte = new Date(startDate);
      if (endDate) {
        const e = new Date(endDate);
        e.setHours(23, 59, 59, 999);
        matchConditions.date.$lte = e;
      }
    }

    if (branch && branch !== 'all') matchConditions.branch = branch;
    if (year && year !== 'all') matchConditions.year = year;

    // 1. Issue categories distribution
    const issueCategories = await Appointment.aggregate([
      { $match: matchConditions },
      { $group: { _id: '$issueCategory', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { category: '$_id', count: 1, _id: 0 } },
    ]);

    // 2. Severity distribution
    const severities = await Appointment.aggregate([
      { $match: matchConditions },
      { $group: { _id: '$severity', count: { $sum: 1 } } },
      { $project: { severity: { $ifNull: ['$_id', 'Unspecified'] }, count: 1, _id: 0 } },
    ]);

    // 3. Demographic counts
    const genderCounts = await Appointment.aggregate([
      { $match: matchConditions },
      { $group: { _id: '$gender', count: { $sum: 1 } } },
      { $project: { gender: '$_id', count: 1, _id: 0 } },
    ]);

    const yearCounts = await Appointment.aggregate([
      { $match: matchConditions },
      { $group: { _id: '$year', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $project: { year: '$_id', count: 1, _id: 0 } },
    ]);

    const branchCounts = await Appointment.aggregate([
      { $match: matchConditions },
      { $group: { _id: '$branch', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { branch: '$_id', count: 1, _id: 0 } },
    ]);

    // 4. Appointments trend over time
    const trends = await Appointment.aggregate([
      { $match: matchConditions },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { date: '$_id', count: 1, _id: 0 } },
    ]);

    // 5. Status funnel
    const statusFunnel = await Appointment.aggregate([
      { $match: matchConditions },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $project: { status: '$_id', count: 1, _id: 0 } },
    ]);

    // 6. Peak time slots
    const peakSlots = await Appointment.aggregate([
      { $match: matchConditions },
      { $group: { _id: '$timeSlot', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $project: { slot: '$_id', count: 1, _id: 0 } },
    ]);

    // 7. Feedback ratings & helpful percentage
    const feedbackStats = await Appointment.aggregate([
      {
        $match: {
          ...matchConditions,
          'feedback.rating': { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$feedback.rating' },
          total: { $sum: 1 },
          helpfulCount: {
            $sum: { $cond: [{ $eq: ['$feedback.wasHelpful', true] }, 1, 0] },
          },
        },
      },
    ]);

    const totalAppointments = await Appointment.countDocuments(matchConditions);
    const urgentCount = await Appointment.countDocuments({
      ...matchConditions,
      $or: [{ isUrgent: true }, { urgentFlag: true }],
    });
    const severeCount = await Appointment.countDocuments({
      ...matchConditions,
      severity: 'Severe',
    });

    const avgRating = feedbackStats[0] ? Number(feedbackStats[0].avgRating.toFixed(1)) : 0;
    const helpfulPct =
      feedbackStats[0] && feedbackStats[0].total > 0
        ? Math.round((feedbackStats[0].helpfulCount / feedbackStats[0].total) * 100)
        : 100;

    const insights = {
      mostCommonIssue: issueCategories[0]?.category || 'N/A',
      severePercentage: totalAppointments > 0 ? Math.round((severeCount / totalAppointments) * 100) : 0,
      urgentCasesCount: urgentCount,
      totalAppointments,
    };

    res.status(200).json({
      success: true,
      data: {
        issueCategories,
        severities,
        genderCounts,
        yearCounts,
        branchCounts,
        trends,
        statusFunnel,
        peakSlots,
        feedbackStats: {
          averageRating: avgRating,
          helpfulPercentage: helpfulPct,
          totalRated: feedbackStats[0]?.total || 0,
        },
        insights,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 19. NOTIFICATION AUDIT LOG
 * GET /api/counselor/notifications/log
 */
const getNotificationLogs = async (req, res, next) => {
  try {
    const { channel, status, search, page = 1, limit = 20 } = req.query;

    const query = {};
    if (channel && channel !== 'all') query.channel = channel;
    if (status && status !== 'all') query.status = status;
    if (search && search.trim()) {
      const rgx = new RegExp(search.trim(), 'i');
      query.$or = [{ to: rgx }, { subject: rgx }, { body: rgx }];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const logs = await NotificationLog.find(query)
      .populate('userId', 'name email role')
      .populate('appointmentId', 'date timeSlot status issueCategory')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await NotificationLog.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        logs,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard,
  getAppointments,
  getAppointmentById,
  approveAppointment,
  rejectAppointment,
  startSession,
  endSession,
  markNoShow,
  saveSessionNotes,
  handleUrgent,
  setOnlineMeeting,
  delaySession,
  rescheduleAppointment,
  getStudents,
  getStudentProfileAndHistory,
  getReports,
  exportReportCSV,
  getAnalytics,
  getNotificationLogs,
};
