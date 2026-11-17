const nodemailer = require('nodemailer');

const INBOX = process.env.NOTIFY_EMAIL || 'info@enlighttechz.in';
const enabled = Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);

const transporter = enabled
  ? nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    })
  : null;

// Best effort: a failed notification never fails the request, because the
// submission is already saved in MongoDB and visible in /admin.
async function notify(subject, fields) {
  if (!transporter) return false;
  const text = Object.entries(fields)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n');
  try {
    await transporter.sendMail({ from: process.env.EMAIL_USER, to: INBOX, replyTo: fields.Email, subject, text });
    return true;
  } catch (err) {
    console.error('Email notification failed:', err.message);
    return false;
  }
}

module.exports = { notify };
