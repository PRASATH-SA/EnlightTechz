const express = require('express');
const rateLimit = require('express-rate-limit');
const { Contact, Career, Service, Package } = require('../models');
const { isDBReady } = require('../config/db');
const { notify, mailEnabled } = require('../lib/mailer');
const defaults = require('../data/defaults');

const router = express.Router();

const formLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many submissions. Please try again in a few minutes.' }
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const str = (v, max = 5000) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

function dbGuard(req, res, next) {
  if (!isDBReady()) {
    return res.status(503).json({
      success: false,
      message: 'We could not save that right now. Please email info@enlighttechz.in and we will reply directly.'
    });
  }
  next();
}

router.get('/health', (req, res) => {
  res.json({ status: 'ok', database: isDBReady() ? 'connected' : 'disconnected', email: mailEnabled ? 'configured' : 'not configured' });
});

router.get('/services', async (req, res) => {
  if (!isDBReady()) return res.json(defaults.services);
  try {
    const items = await Service.find().sort({ order: 1, _id: 1 }).lean();
    res.json(items.length ? items : defaults.services);
  } catch {
    res.json(defaults.services);
  }
});

router.get('/packages', async (req, res) => {
  if (!isDBReady()) return res.json(defaults.packages);
  try {
    const items = await Package.find().sort({ order: 1, _id: 1 }).lean();
    res.json(items.length ? items : defaults.packages);
  } catch {
    res.json(defaults.packages);
  }
});

router.post('/contact', formLimiter, dbGuard, async (req, res) => {
  const data = {
    name: str(req.body.name, 120),
    email: str(req.body.email, 200),
    phone: str(req.body.phone, 40),
    service: str(req.body.service, 160),
    message: str(req.body.message)
  };
  if (!data.name || !data.message) return res.status(400).json({ success: false, message: 'Please add your name and a short note about your project.' });
  if (!EMAIL_RE.test(data.email)) return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });

  try {
    await Contact.create(data);
    await notify(`New consultation request: ${data.service || 'General'}`, {
      Name: data.name, Email: data.email, Phone: data.phone, Service: data.service, Message: data.message
    }, {
      subject: 'We received your request – Enlight Techz',
      text: `Hi ${data.name},

Thanks for contacting Enlight Techz. We have your request${data.service ? ` about ${data.service}` : ''} and will reply within one working day.

Your message:
${data.message}

If anything is urgent, just reply to this email.

Enlight Techz
https://enlighttechz.in`
    });
    res.json({ success: true, message: 'Thanks. We have your request and will reply within one working day.' });
  } catch (err) {
    console.error('Contact save failed:', err.message);
    res.status(500).json({ success: false, message: 'Something went wrong. Please try again or email info@enlighttechz.in.' });
  }
});

router.post('/career', formLimiter, dbGuard, async (req, res) => {
  const data = {
    name: str(req.body.name, 120),
    email: str(req.body.email, 200),
    phone: str(req.body.phone, 40),
    position: str(req.body.position, 160),
    type: req.body.type === 'Internship' ? 'Internship' : 'Job',
    portfolio: str(req.body.portfolio, 500),
    message: str(req.body.message)
  };
  if (!data.name || !data.position) return res.status(400).json({ success: false, message: 'Please add your name and the role you are applying for.' });
  if (!EMAIL_RE.test(data.email)) return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });

  try {
    await Career.create(data);
    await notify(`New application: ${data.position} (${data.type})`, {
      Name: data.name, Email: data.email, Phone: data.phone, Position: data.position,
      Type: data.type, Portfolio: data.portfolio, Message: data.message
    }, {
      subject: `Application received: ${data.position} – Enlight Techz`,
      text: `Hi ${data.name},

Thanks for applying for the ${data.position} (${data.type}) role at Enlight Techz. We have your application and will be in touch if your profile matches the role.

Enlight Techz
https://enlighttechz.in`
    });
    res.json({ success: true, message: 'Application received. We will be in touch if your profile matches the role.' });
  } catch (err) {
    console.error('Career save failed:', err.message);
    res.status(500).json({ success: false, message: 'Something went wrong. Please try again or email info@enlighttechz.in.' });
  }
});

module.exports = router;
