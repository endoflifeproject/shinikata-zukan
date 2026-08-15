import crypto from 'node:crypto';

export function randomId(prefix, bytes = 18) {
  return `${prefix}_${crypto.randomBytes(bytes).toString('base64url')}`;
}

export function randomSecret(bytes = 32) {
  return crypto.randomBytes(bytes).toString('base64url');
}

export function hashSecret(secret) {
  return crypto.createHash('sha256').update(String(secret)).digest('hex');
}

function decodeKey(raw) {
  if (!raw) return null;
  if (/^[0-9a-f]{64}$/i.test(raw)) return Buffer.from(raw, 'hex');
  const b64 = Buffer.from(raw, 'base64');
  if (b64.length === 32) return b64;
  throw new Error('DATA_ENCRYPTION_KEY must be 32 bytes encoded as 64 hex characters or base64.');
}

export function createPayloadCodec(rawKey, allowPlaintext = false) {
  const key = decodeKey(rawKey);
  if (!key && !allowPlaintext) throw new Error('Payload encryption key is missing.');

  return {
    encode(value) {
      const json = JSON.stringify(value);
      if (!key) {
        return JSON.stringify({ v: 1, alg: 'none-local-dev', data: Buffer.from(json).toString('base64') });
      }
      const iv = crypto.randomBytes(12);
      const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
      const encrypted = Buffer.concat([cipher.update(json, 'utf8'), cipher.final()]);
      return JSON.stringify({
        v: 1,
        alg: 'aes-256-gcm',
        iv: iv.toString('base64'),
        tag: cipher.getAuthTag().toString('base64'),
        data: encrypted.toString('base64')
      });
    },
    decode(envelopeText) {
      if (!envelopeText) return null;
      const envelope = JSON.parse(envelopeText);
      if (envelope.alg === 'none-local-dev') {
        if (!allowPlaintext) throw new Error('Refusing to decode plaintext payload outside local development.');
        return JSON.parse(Buffer.from(envelope.data, 'base64').toString('utf8'));
      }
      if (envelope.alg !== 'aes-256-gcm' || !key) throw new Error('Unsupported or unavailable payload encryption.');
      const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(envelope.iv, 'base64'));
      decipher.setAuthTag(Buffer.from(envelope.tag, 'base64'));
      const json = Buffer.concat([
        decipher.update(Buffer.from(envelope.data, 'base64')),
        decipher.final()
      ]).toString('utf8');
      return JSON.parse(json);
    }
  };
}
