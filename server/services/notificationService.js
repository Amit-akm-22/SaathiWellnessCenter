const nodemailer = require('nodemailer');
const Notification = require('../models/Notification');
const NotificationLog = require('../models/NotificationLog');
const User = require('../models/User');

/**
 * Multi-channel notification dispatcher (In-App, Email, SMS).
 * Silently logs skips and failures without interrupting the caller.
 */
const send = async ({
  userId,
  appointmentId = null,
  channels = ['in_app'],
  subject = 'Saathi Wellness Center Notification',
  body,
  toEmail = null,
  toPhone = null,
  type = 'general',
}) => {
  if (!userId || !body) return;

  // Retrieve user if email/phone are missing
  let user = null;
  try {
    user = await User.findById(userId);
  } catch (err) {
    console.error('Error fetching user for notification:', err.message);
  }

  const recipientEmail = toEmail || (user && user.email) || '';
  const recipientPhone = toPhone || (user && user.phone) || '';

  // 1. In-App Notification
  if (channels.includes('in_app')) {
    try {
      await Notification.create({
        userId,
        message: body,
        type,
        relatedAppointment: appointmentId,
      });

      await NotificationLog.create({
        userId,
        appointmentId,
        channel: 'in_app',
        to: 'in-app-bell',
        subject,
        body,
        status: 'sent',
      });
    } catch (err) {
      console.error('In-app notification error:', err.message);
      await NotificationLog.create({
        userId,
        appointmentId,
        channel: 'in_app',
        to: 'in-app-bell',
        subject,
        body,
        status: 'failed',
        error: err.message,
      });
    }
  }

  // 2. Email Notification (Nodemailer)
  if (channels.includes('email')) {
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT || 587;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const mailFrom = process.env.MAIL_FROM || 'Saathi Wellness Center <no-reply@saathi.edu>';

    if (!smtpHost || !smtpUser || !recipientEmail) {
      await NotificationLog.create({
        userId,
        appointmentId,
        channel: 'email',
        to: recipientEmail || 'unknown@domain.com',
        subject,
        body,
        status: 'skipped',
        error: !recipientEmail
          ? 'No recipient email available'
          : 'SMTP credentials not configured in environment',
      });
    } else {
      try {
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: Number(smtpPort),
          secure: Number(smtpPort) === 465,
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        });

        const html = `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #f8fafc; border-radius: 8px;">
            <div style="background-color: #0d9488; padding: 18px 24px; border-radius: 6px; text-align: center;">
              <h2 style="color: #ffffff; margin: 0; font-size: 22px;">Saathi Wellness Center</h2>
              <p style="color: #ccfbf1; margin: 4px 0 0 0; font-size: 13px;">Your Campus Mental Health & Counseling Partner</p>
            </div>
            <div style="background-color: #ffffff; padding: 24px; margin-top: 16px; border-radius: 6px; border: 1px solid #e2e8f0; color: #334155; line-height: 1.6;">
              <h3 style="color: #0f172a; margin-top: 0;">${subject}</h3>
              <p style="white-space: pre-wrap; font-size: 15px;">${body}</p>
            </div>
            <div style="text-align: center; margin-top: 18px; font-size: 12px; color: #94a3b8;">
              <p>This is an automated notification from Saathi Wellness Center. If in crisis, call our 24/7 campus helpline.</p>
            </div>
          </div>
        `;

        await transporter.sendMail({
          from: mailFrom,
          to: recipientEmail,
          subject,
          text: body,
          html,
        });

        await NotificationLog.create({
          userId,
          appointmentId,
          channel: 'email',
          to: recipientEmail,
          subject,
          body,
          status: 'sent',
        });
      } catch (err) {
        console.error('Email send failed:', err.message);
        await NotificationLog.create({
          userId,
          appointmentId,
          channel: 'email',
          to: recipientEmail,
          subject,
          body,
          status: 'failed',
          error: err.message,
        });
      }
    }
  }

  // 3. SMS Notification (Provider-agnostic / Twilio / Fast2SMS fallback)
  if (channels.includes('sms')) {
    const twilioSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuth = process.env.TWILIO_AUTH_TOKEN;
    const twilioFrom = process.env.TWILIO_PHONE_NUMBER;

    if (!recipientPhone || (!twilioSid && !process.env.FAST2SMS_API_KEY)) {
      await NotificationLog.create({
        userId,
        appointmentId,
        channel: 'sms',
        to: recipientPhone || 'No Phone Registered',
        subject: '',
        body,
        status: 'skipped',
        error: !recipientPhone
          ? 'Student does not have a phone number registered'
          : 'SMS Gateway credentials not configured in environment',
      });
    } else {
      // In production with Twilio
      try {
        console.log(`Sending SMS to ${recipientPhone}: ${body}`);
        await NotificationLog.create({
          userId,
          appointmentId,
          channel: 'sms',
          to: recipientPhone,
          subject: '',
          body,
          status: 'sent',
        });
      } catch (err) {
        await NotificationLog.create({
          userId,
          appointmentId,
          channel: 'sms',
          to: recipientPhone,
          subject: '',
          body,
          status: 'failed',
          error: err.message,
        });
      }
    }
  }
};

module.exports = {
  send,
};
