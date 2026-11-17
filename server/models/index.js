const mongoose = require('mongoose');

const STATUSES = ['Pending', 'In progress', 'Completed', 'Rejected'];

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 200 },
  phone: { type: String, trim: true, maxlength: 40 },
  service: { type: String, trim: true, maxlength: 160 },
  message: { type: String, required: true, trim: true, maxlength: 5000 },
  status: { type: String, enum: STATUSES, default: 'Pending' },
  date: { type: Date, default: Date.now }
});

const careerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 200 },
  phone: { type: String, trim: true, maxlength: 40 },
  position: { type: String, required: true, trim: true, maxlength: 160 },
  type: { type: String, enum: ['Job', 'Internship'], default: 'Job' },
  portfolio: { type: String, trim: true, maxlength: 500 },
  message: { type: String, trim: true, maxlength: 5000 },
  status: { type: String, enum: STATUSES, default: 'Pending' },
  date: { type: Date, default: Date.now }
});

const serviceSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true, trim: true },
  title: { type: String, required: true, trim: true },
  summary: { type: String, trim: true },
  description: { type: String, trim: true },
  points: [String],
  image: { type: String, trim: true },
  imageAlt: { type: String, trim: true },
  order: { type: Number, default: 0 }
});

const packageSchema = new mongoose.Schema({
  category: { type: String, required: true, trim: true },
  name: { type: String, required: true, trim: true },
  price: { type: String, trim: true, default: '' },
  features: [String],
  isPremium: { type: Boolean, default: false },
  order: { type: Number, default: 0 }
});

const chatSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, index: true },
  messages: [
    {
      role: { type: String, enum: ['user', 'bot'] },
      content: String,
      timestamp: { type: Date, default: Date.now }
    }
  ]
});

module.exports = {
  STATUSES,
  Contact: mongoose.model('Contact', contactSchema),
  Career: mongoose.model('Career', careerSchema),
  Service: mongoose.model('Service', serviceSchema),
  Package: mongoose.model('Package', packageSchema),
  Chat: mongoose.model('Chat', chatSchema)
};
