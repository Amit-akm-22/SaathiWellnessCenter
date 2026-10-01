const { validationResult } = require('express-validator');
const Appointment = require('../models/Appointment');
const SlotCapacity = require('../models/SlotCapacity');
const Notification = require('../models/Notification');
const { TIME_SLOTS, MAX_BOOKINGS_PER_SLOT } = require('../config/constants');

// Helper: calculate screening score and severity on the server
const calculateScreening = (answers) => {
  if (!Array.isArray(answers) || answers.length !== 5) {
    return { score: 0, severity: '', urgentFlag: false };
  }

  // Validate each answer is 0-3
  for (const a of answers) {
    if (typeof a !== 'number' || a < 0 || a > 3) {
      return { score: 0, severity: '', urgentFlag: false };
    }
  }

  const selfHarmAnswer = answers[4];
  const urgentFlag = selfHarmAnswer > 0;

  // Score is sum of first 4 questions only (0-12)
  const score = answers[0] + answers[1] + answers[2] + answers[3];

  let severity;
  if (urgentFlag) {
    severity = 'Severe'; // Self-harm answer > 0 always means Severe
  } else if (score <= 4) {
    severity = 'Mild';
  } else if (score <= 8) {
    severity = 'Moderate';
  } else {
    severity = 'Severe';
  }

  return { score, severity, urgentFlag };
};

// @desc    Book a new appointment
// @route   POST /api/student/appointments
// @access  Private (student)
const bookAppointment = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array().map((e) => e.msg).join(', '),
      });
    }

    const student = req.user;
    const {
      branch,
      year,
      gender,
      date,
      timeSlot,
      issueCategory,
      customCategory,
      description,
      isUrgent,
      screeningAnswers,
    } = req.body;

    // Validate date
    const appointmentDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    appointmentDate.setHours(0, 0, 0, 0);

    if (appointmentDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Cannot book appointments in the past.',
      });
    }

    if (appointmentDate.getDay() === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot book appointments on Sundays.',
      });
    }

    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + 30);
    if (appointmentDate > maxDate) {
      return res.status(400).json({
        success: false,
        message: 'Cannot book more than 30 days in advance.',
      });
    }

    // Validate time slot
    if (!TIME_SLOTS.includes(timeSlot)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid time slot.',
      });
    }

    // Validate issue category
    if (issueCategory === 'Other' && (!customCategory || !customCategory.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please specify a custom category when selecting "Other".',
      });
    }

    // Check: student cannot have more than 1 active upcoming appointment
    const activeAppointment = await Appointment.findOne({
      studentId: student._id,
      status: { $in: ['pending', 'approved'] },
      date: { $gte: today },
    });

    if (activeAppointment) {
      return res.status(409).json({
        success: false,
        message:
          'You already have an active upcoming appointment. Please cancel it before booking a new one.',
      });
    }

    // Check: student cannot book same date+slot
    const duplicateBooking = await Appointment.findOne({
      studentId: student._id,
      date: appointmentDate,
      timeSlot,
      status: { $in: ['pending', 'approved'] },
    });

    if (duplicateBooking) {
      return res.status(409).json({
        success: false,
        message: 'You already have a booking for this date and time slot.',
      });
    }

    // ATOMIC slot capacity check - prevents race conditions
    const dateStr = appointmentDate.toISOString().split('T')[0];
    const slotResult = await SlotCapacity.findOneAndUpdate(
      {
        date: dateStr,
        slot: timeSlot,
        bookedCount: { $lt: MAX_BOOKINGS_PER_SLOT },
      },
      { $inc: { bookedCount: 1 } },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    // If the update didn't happen (slot is full), the document would have
    // bookedCount >= MAX. Check if we actually got the slot.
    if (!slotResult || slotResult.bookedCount > MAX_BOOKINGS_PER_SLOT) {
      // If somehow we exceeded, roll it back
      if (slotResult && slotResult.bookedCount > MAX_BOOKINGS_PER_SLOT) {
        await SlotCapacity.findOneAndUpdate(
          { date: dateStr, slot: timeSlot },
          { $inc: { bookedCount: -1 } }
        );
      }
      return res.status(409).json({
        success: false,
        message: 'This time slot is full. Please choose another slot.',
      });
    }

    // Calculate screening on backend (never trust client)
    const screening = calculateScreening(screeningAnswers);

    // Create appointment - name/email/enrollmentNo from DB, NOT from request
    const appointment = await Appointment.create({
      studentId: student._id,
      name: student.name,
      email: student.email,
      enrollmentNo: student.enrollmentNo,
      branch,
      year,
      gender,
      date: appointmentDate,
      timeSlot,
      issueCategory,
      customCategory: issueCategory === 'Other' ? customCategory.trim() : '',
      description: description ? description.trim().substring(0, 500) : '',
      isUrgent: isUrgent || screening.urgentFlag,
      screeningAnswers,
      screeningScore: screening.score,
      severity: screening.severity,
      urgentFlag: screening.urgentFlag,
      status: 'pending',
    });

    // Create notification
    await Notification.create({
      userId: student._id,
      message: `Your appointment for ${dateStr} at ${timeSlot} has been booked successfully. Status: Pending.`,
      type: 'appointment_booked',
      relatedAppointment: appointment._id,
    });

    // Return appointment without sensitive counselor fields
    const safeAppointment = appointment.toObject();
    delete safeAppointment.sessionNotes;
    delete safeAppointment.severity;
    delete safeAppointment.screeningScore;
    delete safeAppointment.screeningAnswers;
    delete safeAppointment.urgentFlag;

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully!',
      data: { appointment: safeAppointment },
    });
  } catch (error) {
    // If we get a duplicate key error from SlotCapacity upsert race, treat as full
    if (error.code === 11000 && error.keyPattern && error.keyPattern.date) {
      return res.status(409).json({
        success: false,
        message: 'This time slot is full. Please choose another slot.',
      });
    }
    next(error);
  }
};

// @desc    Get all appointments for the logged-in student
// @route   GET /api/student/appointments
// @access  Private (student)
const getMyAppointments = async (req, res, next) => {
  try {
    const { status } = req.query;

    const query = { studentId: req.user._id };
    if (status && status !== 'all') {
      query.status = status;
    }

    const appointments = await Appointment.find(query)
      .select(
        '-sessionNotes -severity -screeningScore -screeningAnswers -urgentFlag'
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { appointments },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single appointment by ID (ownership check)
// @route   GET /api/student/appointments/:id
// @access  Private (student)
const getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      studentId: req.user._id, // ownership check
    }).select(
      '-sessionNotes -severity -screeningScore -screeningAnswers -urgentFlag'
    );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: { appointment },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel an appointment
// @route   PATCH /api/student/appointments/:id/cancel
// @access  Private (student)
const cancelAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      studentId: req.user._id, // ownership check
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found.',
      });
    }

    if (!['pending', 'approved', 'rescheduled'].includes(appointment.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel an appointment with status: ${appointment.status}`,
      });
    }

    // Check 2-hour rule
    const now = new Date();
    const slotStartTime = appointment.timeSlot.split('-')[0]; // e.g. "10:00"
    const [hours, minutes] = slotStartTime.split(':').map(Number);
    const appointmentDateTime = new Date(appointment.date);
    appointmentDateTime.setHours(hours, minutes, 0, 0);

    const twoHoursBefore = new Date(
      appointmentDateTime.getTime() - 2 * 60 * 60 * 1000
    );

    if (now > twoHoursBefore) {
      return res.status(400).json({
        success: false,
        message:
          'Cannot cancel within 2 hours of the appointment. Please contact the counselor directly.',
      });
    }

    // Cancel the appointment
    appointment.status = 'cancelled';
    await appointment.save();

    // Free the slot capacity
    const dateStr = new Date(appointment.date).toISOString().split('T')[0];
    await SlotCapacity.findOneAndUpdate(
      { date: dateStr, slot: appointment.timeSlot, bookedCount: { $gt: 0 } },
      { $inc: { bookedCount: -1 } }
    );

    // Create notification
    await Notification.create({
      userId: req.user._id,
      message: `Your appointment for ${dateStr} at ${appointment.timeSlot} has been cancelled.`,
      type: 'appointment_cancelled',
      relatedAppointment: appointment._id,
    });

    res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully. The slot has been freed.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit feedback for a completed appointment
// @route   POST /api/student/appointments/:id/feedback
// @access  Private (student)
const submitFeedback = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array().map((e) => e.msg).join(', '),
      });
    }

    const appointment = await Appointment.findOne({
      _id: req.params.id,
      studentId: req.user._id, // ownership check
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found.',
      });
    }

    if (appointment.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Feedback can only be given for completed appointments.',
      });
    }

    if (appointment.feedback && appointment.feedback.submittedAt) {
      return res.status(409).json({
        success: false,
        message: 'Feedback has already been submitted for this appointment.',
      });
    }

    const { rating, comment, wasHelpful } = req.body;

    appointment.feedback = {
      rating,
      comment: comment ? comment.trim().substring(0, 300) : '',
      wasHelpful: wasHelpful !== undefined ? wasHelpful : null,
      submittedAt: new Date(),
    };

    await appointment.save();

    res.status(200).json({
      success: true,
      message: 'Feedback submitted successfully. Thank you!',
      data: { feedback: appointment.feedback },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student dashboard stats
// @route   GET /api/student/dashboard
// @access  Private (student)
const getDashboard = async (req, res, next) => {
  try {
    const studentId = req.user._id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Upcoming appointment (next pending/approved/rescheduled)
    const upcomingAppointment = await Appointment.findOne({
      studentId,
      status: { $in: ['pending', 'approved', 'rescheduled'] },
      date: { $gte: today },
    })
      .select(
        '-sessionNotes -severity -screeningScore -screeningAnswers -urgentFlag'
      )
      .sort({ date: 1 });

    // Completed sessions count
    const completedCount = await Appointment.countDocuments({
      studentId,
      status: 'completed',
    });

    // Pending feedback count
    const pendingFeedback = await Appointment.countDocuments({
      studentId,
      status: 'completed',
      'feedback.submittedAt': { $exists: false },
    });

    // Total appointments
    const totalAppointments = await Appointment.countDocuments({ studentId });

    res.status(200).json({
      success: true,
      data: {
        upcomingAppointment,
        completedCount,
        pendingFeedback,
        totalAppointments,
        user: req.user.toJSON(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get available slots for a date
// @route   GET /api/slots
// @access  Private (student)
const getAvailableSlots = async (req, res, next) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date parameter is required.',
      });
    }

    const dateStr = date; // YYYY-MM-DD

    // Check if it's a Sunday
    const dateObj = new Date(dateStr + 'T00:00:00');
    if (dateObj.getDay() === 0) {
      return res.status(400).json({
        success: false,
        message: 'Appointments are not available on Sundays.',
      });
    }

    // Get current capacity for all slots on this date
    const capacities = await SlotCapacity.find({ date: dateStr });
    const capacityMap = {};
    capacities.forEach((cap) => {
      capacityMap[cap.slot] = cap.bookedCount;
    });

    const slots = TIME_SLOTS.map((slot) => {
      const bookedCount = capacityMap[slot] || 0;
      const remaining = MAX_BOOKINGS_PER_SLOT - bookedCount;
      return {
        slot,
        bookedCount,
        remaining: Math.max(0, remaining),
        isFull: remaining <= 0,
      };
    });

    res.status(200).json({
      success: true,
      data: { date: dateStr, slots },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit screening (optional - can also be passed with booking)
// @route   POST /api/student/screening
// @access  Private (student)
const submitScreening = async (req, res, next) => {
  try {
    const { answers } = req.body;

    if (!Array.isArray(answers) || answers.length !== 5) {
      return res.status(400).json({
        success: false,
        message: 'Please provide exactly 5 screening answers.',
      });
    }

    for (const a of answers) {
      if (typeof a !== 'number' || a < 0 || a > 3) {
        return res.status(400).json({
          success: false,
          message: 'Each answer must be a number between 0 and 3.',
        });
      }
    }

    const screening = calculateScreening(answers);

    // CRITICAL PRIVACY: Severity, screening answers, and scores must NEVER appear in /api/student/*
    res.status(200).json({
      success: true,
      message: 'Screening assessment recorded successfully.',
      data: {
        isUrgent: screening.urgentFlag,
        note: screening.urgentFlag
          ? "We understand things might feel heavy right now. You're brave for reaching out. Our counselor is here for you — please go ahead and book a session."
          : "Thank you for checking in with yourself. Speaking with a counselor can help you feel supported and heard.",
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update student profile (e.g. phone, branch, year, gender)
// @route   PUT /api/student/profile
// @access  Private (student)
const updateProfile = async (req, res, next) => {
  try {
    const { phone, branch, year, gender } = req.body;
    const user = await req.user;
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (phone !== undefined) user.phone = phone.trim();
    if (branch) user.branch = branch;
    if (year) user.year = year;
    if (gender) user.gender = gender;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: user.toJSON() },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  bookAppointment,
  getMyAppointments,
  getAppointmentById,
  cancelAppointment,
  submitFeedback,
  getDashboard,
  getAvailableSlots,
  submitScreening,
  updateProfile,
};
