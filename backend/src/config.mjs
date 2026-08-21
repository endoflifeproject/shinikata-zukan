import path from 'node:path';

function bool(name, fallback = false) {
  const raw = process.env[name];
  if (raw == null) return fallback;
  return ['1', 'true', 'yes', 'on'].includes(String(raw).toLowerCase());
}

function int(name, fallback, min, max) {
  const n = Number(process.env[name]);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.trunc(n)));
}

function csv(name, fallback = []) {
  const raw = process.env[name];
  if (!raw) return fallback;
  return raw.split(',').map(v => v.trim()).filter(Boolean);
}

export function loadConfig(overrides = {}) {
  const config = {
    port: int('PORT', 8787, 1, 65535),
    dbPath: process.env.DB_PATH || path.resolve('data/experience.sqlite'),
    enableWrites: bool('ENABLE_WRITES', false),
    enableReviewWrites: bool('ENABLE_REVIEW_WRITES', false),
    enableInvites: bool('ENABLE_INVITES', false),
    inviteTtlDays: int('INVITE_TTL_DAYS', 30, 1, 365),
    minPublicCellSize: int('PUBLIC_MIN_CELL_SIZE', 10, 3, 100),
    maxBodyBytes: int('MAX_BODY_BYTES', 256 * 1024, 16 * 1024, 1024 * 1024),
    rateLimitPerMinute: int('RATE_LIMIT_PER_MINUTE', 30, 5, 300),
    allowedOrigins: csv('ALLOWED_ORIGINS', [
      'http://127.0.0.1:8000',
      'http://localhost:8000',
      'https://endoflifeproject.github.io'
    ]),
    encryptionKey: process.env.DATA_ENCRYPTION_KEY || '',
    allowInsecureLocalStorage: bool('ALLOW_INSECURE_LOCAL_STORAGE', false),
    ...overrides
  };

  if (!config.encryptionKey && !config.allowInsecureLocalStorage) {
    throw new Error('DATA_ENCRYPTION_KEY is required unless ALLOW_INSECURE_LOCAL_STORAGE=1 is explicitly set for local development.');
  }
  return config;
}
