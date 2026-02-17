/**
 * Generate FEAI signing key pair for .env
 * Run: node scripts/generate-feai-keys.js
 * Copy the output into your .env file.
 */
const crypto = require('crypto');

const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519', {
  publicKeyEncoding: { type: 'spki', format: 'der' },
  privateKeyEncoding: { type: 'pkcs8', format: 'der' },
});

const secret = crypto.randomBytes(32).toString('base64');

console.log('\n# Add these to your .env for .feai export/import:\n');
console.log('FEAI_EXPORT_SECRET="' + secret + '"');
console.log('FEAI_SIGNING_PRIVATE_KEY="' + privateKey.toString('base64') + '"');
console.log('FEAI_SIGNING_PUBLIC_KEY="' + publicKey.toString('base64') + '"');
console.log('');
