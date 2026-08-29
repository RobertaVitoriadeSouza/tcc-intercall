const crypto = require('node:crypto');

const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7; // 7 dias

function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

function createPasswordRecord(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = hashPassword(password, salt);
  return { salt, hash };
}

function verifyPassword(password, salt, storedHash) {
  const hash = hashPassword(password, salt);
  const a = Buffer.from(hash, 'hex');
  const b = Buffer.from(storedHash, 'hex');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function createSessionToken() {
  return crypto.randomBytes(32).toString('hex');
}

function sessionExpiry() {
  return new Date(Date.now() + SESSION_DURATION_MS).toISOString();
}

module.exports = {
  createPasswordRecord,
  verifyPassword,
  createSessionToken,
  sessionExpiry,
};
