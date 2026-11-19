const nodemailer = require('nodemailer');

const INBOX = process.env.NOTIFY_EMAIL || 'info@enlighttechz.in';
const USER = (process.env.EMAIL_USER || '').trim();
// Gmail shows app passwords as "abcd efgh ijkl mnop"; the spaces must not be sent.
const PASS = (process.env.EMAIL_PASS || '').replace(/\s+/g, '');
const enabled = Boolean(USER && PASS);

if (!enabled) console.warn('Email disabled: EMAIL_USER / EMAIL_PASS are not set.');

const transporter = enabled
  ? nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user: USER, pass: PASS },
      // Keep well inside the serverless function's time limit.
      connectionTimeout: 8000,
      greetingTimeout: 8000,
      socketTimeout: 10000
    })
  : null;

const FROM = `"Enlight Techz" <${USER}>`;

const toText = (fields) => Object.entries(fields)
  .filter(([, v]) => v)
  .map(([k, v]) => `${k}: ${v}`)
  .join('\n');

async function send(mail, label) {
  if (!transporter) return false;
  try {
    await transporter.sendMail({ from: FROM, ...mail });
    return true;
  } catch (err) {
    console.error(`Email (${label}) failed:`, err.code || '', err.responseCode || '', err.message);
    return false;
  }
}

/**
 * Email the team about a new submission and send the visitor a confirmation.
 * Best effort: a failed email never fails the request, because the submission is
 * already saved in MongoDB and visible in /admin.
 *
 * MUST be awaited before responding — on Vercel the function is frozen as soon as
 * the response is sent, which silently kills any email still in flight.
 */
async function notify(subject, fields, confirmation) {
  const jobs = [send({ to: INBOX, replyTo: fields.Email, subject, text: toText(fields) }, 'team')];
  if (confirmation && fields.Email) {
    jobs.push(send({ to: fields.Email, replyTo: INBOX, subject: confirmation.subject, text: confirmation.text }, 'visitor'));
  }
  const [team, visitor] = await Promise.all(jobs);
  return { team, visitor };
}

module.exports = { notify, mailEnabled: enabled };
