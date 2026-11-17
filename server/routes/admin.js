const express = require('express');
const rateLimit = require('express-rate-limit');
const { Contact, Career, Service, Package, STATUSES } = require('../models');
const { isDBReady } = require('../config/db');
const { issueToken, checkPassword, requireAdmin } = require('../middleware/auth');

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many sign-in attempts. Try again in 15 minutes.' }
});

router.post('/login', loginLimiter, (req, res) => {
  const ok = checkPassword(req.body.password);
  if (ok === null) return res.status(503).json({ success: false, message: 'Admin sign-in is not configured. Set ADMIN_PASSWORD in .env.' });
  if (!ok) return res.status(401).json({ success: false, message: 'Incorrect password.' });
  res.json({ success: true, ...issueToken() });
});

router.use(requireAdmin);
router.use((req, res, next) => {
  if (!isDBReady()) return res.status(503).json({ success: false, message: 'Database is not connected.' });
  next();
});

const wrap = (fn) => (req, res) =>
  fn(req, res).catch((err) => {
    const status = err.name === 'ValidationError' || err.name === 'CastError' ? 400 : 500;
    res.status(status).json({ success: false, message: err.message });
  });

// Enquiries and applications: list + status updates
for (const [path, Model] of [['contacts', Contact], ['careers', Career]]) {
  router.get(`/${path}`, wrap(async (req, res) => {
    res.json(await Model.find().sort({ date: -1 }).lean());
  }));
  router.patch(`/${path}/:id`, wrap(async (req, res) => {
    if (!STATUSES.includes(req.body.status)) return res.status(400).json({ success: false, message: 'Unknown status.' });
    const doc = await Model.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true });
    if (!doc) return res.status(404).json({ success: false, message: 'Not found.' });
    res.json(doc);
  }));
  router.delete(`/${path}/:id`, wrap(async (req, res) => {
    await Model.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  }));
}

// Site content: full CRUD
const pick = (body, keys) => Object.fromEntries(keys.filter((k) => body[k] !== undefined).map((k) => [k, body[k]]));
const SERVICE_FIELDS = ['slug', 'title', 'summary', 'description', 'points', 'image', 'imageAlt', 'order'];
const PACKAGE_FIELDS = ['category', 'name', 'price', 'features', 'isPremium', 'order'];

for (const [path, Model, fields] of [['services', Service, SERVICE_FIELDS], ['packages', Package, PACKAGE_FIELDS]]) {
  router.get(`/${path}`, wrap(async (req, res) => {
    res.json(await Model.find().sort({ order: 1, _id: 1 }).lean());
  }));
  router.post(`/${path}`, wrap(async (req, res) => {
    res.status(201).json(await Model.create(pick(req.body, fields)));
  }));
  router.put(`/${path}/:id`, wrap(async (req, res) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, pick(req.body, fields), { new: true, runValidators: true });
    if (!doc) return res.status(404).json({ success: false, message: 'Not found.' });
    res.json(doc);
  }));
  router.delete(`/${path}/:id`, wrap(async (req, res) => {
    await Model.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  }));
}

module.exports = router;
