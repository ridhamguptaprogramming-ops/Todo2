const nodemailer = require('nodemailer');

const createTransporter = () => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = createTransporter();

  if (!transporter) {
    console.log('[email skipped]', { to, subject, text });
    return { skipped: true };
  }

  return transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
    html
  });
};

const sendVerificationEmail = async (email, firstName, token) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const verificationUrl = `${frontendUrl}/?verifyToken=${token}`;

  return sendEmail({
    to: email,
    subject: 'Verify your Event Attendance account',
    text: `Hi ${firstName}, verify your email here: ${verificationUrl}`,
    html: `
      <h2>Welcome, ${firstName}</h2>
      <p>Please verify your email address to activate your account.</p>
      <p><a href="${verificationUrl}">Verify email</a></p>
      <p>This link expires in 24 hours.</p>
    `
  });
};

const sendNotificationEmail = async (email, subject, message) => {
  return sendEmail({
    to: email,
    subject,
    text: message,
    html: `<p>${message}</p>`
  });
};

module.exports = {
  sendVerificationEmail,
  sendNotificationEmail
};
