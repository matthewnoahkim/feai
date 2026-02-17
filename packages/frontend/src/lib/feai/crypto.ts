/**
 * .feai crypto: HKDF key derivation, AES-256-GCM, Ed25519 sign/verify
 * Uses Node crypto only; no plaintext ZIP leaves the server.
 */

import * as crypto from 'crypto';

const AES_KEY_LEN = 32;
const IV_LEN = 12;
const AUTH_TAG_LEN = 16;
const HKDF_INFO = Buffer.from('feai-export-v1', 'utf8');

function getExportSecret(): Buffer {
  const secret = process.env.FEAI_EXPORT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('FEAI_EXPORT_SECRET must be set and at least 32 characters');
  }
  return Buffer.from(secret, 'utf8');
}

/**
 * Derive 32-byte AES key from server secret + user_id using HKDF-SHA256
 */
export function deriveKey(userId: string): Buffer {
  const secret = getExportSecret();
  const salt = Buffer.from(userId, 'utf8');
  const derived = crypto.hkdfSync('sha256', secret, salt, HKDF_INFO, AES_KEY_LEN);
  return Buffer.isBuffer(derived) ? derived : Buffer.from(derived);
}

/**
 * Encrypt payload with AES-256-GCM. Returns [IV, ciphertext, authTag] concatenated.
 */
export function encrypt(key: Buffer, plaintext: Buffer): Buffer {
  const iv = crypto.randomBytes(IV_LEN);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv, { authTagLength: AUTH_TAG_LEN });
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, encrypted, authTag]);
}

/**
 * Decrypt .feai payload. Expects buffer = IV (12) + ciphertext + authTag (16).
 */
export function decrypt(key: Buffer, buffer: Buffer): Buffer {
  if (buffer.length < IV_LEN + AUTH_TAG_LEN) {
    throw new Error('Ciphertext too short');
  }
  const iv = buffer.subarray(0, IV_LEN);
  const authTag = buffer.subarray(buffer.length - AUTH_TAG_LEN);
  const ciphertext = buffer.subarray(IV_LEN, buffer.length - AUTH_TAG_LEN);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv, { authTagLength: AUTH_TAG_LEN });
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}

function getSigningKeyPair(): { privateKey: Buffer; publicKey: Buffer } {
  const privateKeyB64 = process.env.FEAI_SIGNING_PRIVATE_KEY;
  const publicKeyB64 = process.env.FEAI_SIGNING_PUBLIC_KEY;
  if (!privateKeyB64 || !publicKeyB64) {
    throw new Error('FEAI_SIGNING_PRIVATE_KEY and FEAI_SIGNING_PUBLIC_KEY must be set (base64 Ed25519 keys)');
  }
  return {
    privateKey: Buffer.from(privateKeyB64, 'base64'),
    publicKey: Buffer.from(publicKeyB64, 'base64'),
  };
}

/**
 * Sign SHA-256 hash of data with server Ed25519 private key. Returns signature (64 bytes).
 */
export function sign(data: Buffer): Buffer {
  const { privateKey } = getSigningKeyPair();
  const hash = crypto.createHash('sha256').update(data).digest();
  return crypto.sign(null, hash, { key: privateKey, format: 'der', type: 'pkcs8' });
}

/**
 * Verify Ed25519 signature over SHA-256 hash of data. Throws if invalid.
 */
export function verify(data: Buffer, signature: Buffer): void {
  const { publicKey } = getSigningKeyPair();
  const hash = crypto.createHash('sha256').update(data).digest();
  const ok = crypto.verify(null, hash, { key: publicKey, format: 'der', type: 'spki' }, signature);
  if (!ok) {
    throw new Error('Signature verification failed');
  }
}

/**
 * Generate a new Ed25519 key pair for signing (for initial setup).
 * Output: FEAI_SIGNING_PRIVATE_KEY and FEAI_SIGNING_PUBLIC_KEY (base64).
 */
export function generateSigningKeyPair(): { privateKeyBase64: string; publicKeyBase64: string } {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519', {
    publicKeyEncoding: { type: 'spki', format: 'der' },
    privateKeyEncoding: { type: 'pkcs8', format: 'der' },
  });
  return {
    privateKeyBase64: privateKey.toString('base64'),
    publicKeyBase64: publicKey.toString('base64'),
  };
}
