const express = require('express');
const rateLimit = require('express-rate-limit');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Chat } = require('../models');
const { isDBReady } = require('../config/db');

const router = express.Router();

const chatLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Chat limit reached. Please try again in an hour, or email info@enlighttechz.in.' }
});

const systemInstruction = `
You are the assistant for Enlight Techz, an IT company in Karaikal and Puducherry.
Help visitors understand our services and encourage them to book a free consultation
through the contact form or by emailing info@enlighttechz.in.

RULES:
1. Only discuss Enlight Techz and its services. Politely steer unrelated questions back.
2. Be plain, specific and friendly. Short sentences. No hype words.
3. Never invent prices, timelines, clients, statistics or promises. For prices, say pricing is
   quoted after a free consultation (fixed-price, hourly, or subscription-based managed services).
4. Use **double asterisks** for key terms. For lists use "• " at the start of each line. Never use single asterisks.

COMPANY DETAILS:
- Location: Karaikal and Puducherry. Email: info@enlighttechz.in
- Services: Mobile apps (iOS & Android), Web development, SEO & AEO, AI agent development,
  AR/VR development, 3D modelling, Digital marketing. Also enterprise software, custom CRM and GEO.
- Industries: finance, healthcare, education, e-commerce, manufacturing, logistics, tours and travel.
- Clients we have worked with: Chola Taxi, Favoflex, Ansha Accessories.
- Support: 24/7 support for live projects by phone, email and remote assistance.
- Timelines: small projects take a few weeks; enterprise-scale solutions take several months.
- Process: free consultation, then a custom quote, then build and support.
`;

let model = null;
if (process.env.GEMINI_API_KEY) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-flash-latest', systemInstruction });
}

const MAX_HISTORY = 20;

router.post('/', chatLimiter, async (req, res) => {
  const message = typeof req.body.message === 'string' ? req.body.message.trim().slice(0, 1000) : '';
  const sessionId = typeof req.body.sessionId === 'string' ? req.body.sessionId.slice(0, 64) : '';
  if (!message || !sessionId) return res.status(400).json({ success: false, message: 'Please type a message.' });

  if (!model) {
    return res.status(503).json({ success: false, message: 'The assistant is offline right now. Email info@enlighttechz.in and we will reply directly.' });
  }

  try {
    let chat = null;
    if (isDBReady()) {
      chat = (await Chat.findOne({ sessionId })) || new Chat({ sessionId, messages: [] });
    }
    const history = (chat ? chat.messages.slice(-MAX_HISTORY) : []).map((m) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));

    const result = await model.startChat({ history }).sendMessage(message);
    const reply = result.response.text();

    if (chat) {
      chat.messages.push({ role: 'user', content: message }, { role: 'bot', content: reply });
      await chat.save();
    }
    res.json({ success: true, response: reply });
  } catch (err) {
    console.error('Chat error:', err.message);
    res.status(500).json({ success: false, message: 'I could not answer that just now. Please try again in a moment.' });
  }
});

module.exports = router;
