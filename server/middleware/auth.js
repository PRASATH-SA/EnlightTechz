const crypto = require('crypto');

const TOKEN_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

function secret() {
  return process.env.ADMIN_SECRET || `${process.env.ADMIN_PASSWORD || ''}:enlighttechz-admin`;
}

function sign(payload) {
  return crypto.createHmac('sha256', secret()).update(payload).digest('base64url');
}

function safeEqual(a, b) {
  const ab = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
}

function issueToken() {
  const exp = Date.now() + TOKEN_TTL_MS;
  const payload = Buffer.from(JSON.stringify({ exp })).toString('base64url');
  return { token: `${payload}.${sign(payload)}`, expiresAt: exp };
}

function verifyToken(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return false;
  const [payload, sig] = token.split('.');
  if (!safeEqual(sig, sign(payload))) return false;
  try {
    const { exp } = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return typeof exp === 'number' && exp > Date.now();
  } catch {
    return false;
  }
}

function checkPassword(password) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return null; // admin login disabled until configured
  return safeEqual(password || '', expected);
}

function requireAdmin(req, res, next) {
  const header = req.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!verifyToken(token)) return res.status(401).json({ success: false, message: 'Please sign in again.' });
  next();
}

module.exports = { issueToken, checkPassword, requireAdmin };
