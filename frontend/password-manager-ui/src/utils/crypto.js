/**
 * Client-Side Cryptography Module
 * Zero-Knowledge Password Manager
 * 
 * Security Features:
 * - PBKDF2 key derivation (250,000 iterations with pepper)
 * - AES-256-GCM encryption
 * - Secure random salt/IV generation
 * - Browser Web Crypto API
 * - Password pepper for additional security
 */

import { VAULT_CONFIG } from '../config/vaultConfig';

// ============================================================================
// KEY DERIVATION
// ============================================================================

/**
 * Derive encryption key from master password using PBKDF2
 * @param {string} masterPassword - User's master password (should include pepper)
 * @param {Uint8Array} salt - Cryptographic salt (16 bytes)
 * @param {number} iterations - PBKDF2 iterations (default from config)
 * @returns {Promise<CryptoKey>} AES-256 encryption key
 */
export async function deriveMasterKey(masterPassword, salt, iterations = VAULT_CONFIG.pbkdf2Iterations) {
  // Convert password string to bytes
  const encoder = new TextEncoder();
  const passwordBytes = encoder.encode(masterPassword);

  // Import password as key material for PBKDF2
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    passwordBytes,
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  // Derive AES-256 key using PBKDF2
  const key = await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: iterations,
      hash: 'SHA-256'
    },
    keyMaterial,
    {
      name: 'AES-GCM',
      length: 256
    },
    false, // Key cannot be extracted (security)
    ['encrypt', 'decrypt']
  );

  return key;
}

/**
 * Generate cryptographically secure random salt
 * @returns {Uint8Array} 16-byte salt
 */
export function generateSalt() {
  return window.crypto.getRandomValues(new Uint8Array(16));
}

/**
 * Generate cryptographically secure random IV (initialization vector)
 * @returns {Uint8Array} 12-byte IV for AES-GCM
 */
export function generateIV() {
  return window.crypto.getRandomValues(new Uint8Array(12));
}

// ============================================================================
// ENCRYPTION / DECRYPTION
// ============================================================================

/**
 * Encrypt data using AES-256-GCM
 * @param {CryptoKey} key - AES-256 key from deriveMasterKey
 * @param {string} plaintext - Data to encrypt
 * @returns {Promise<Object>} {ciphertext: base64, iv: base64}
 */
export async function encrypt(key, plaintext) {
  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);
  
  const iv = generateIV();
  
  const ciphertext = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv
    },
    key,
    data
  );

  return {
    ciphertext: arrayBufferToBase64(ciphertext),
    iv: arrayBufferToBase64(iv)
  };
}

/**
 * Decrypt data using AES-256-GCM
 * @param {CryptoKey} key - AES-256 key from deriveMasterKey
 * @param {string} ciphertextBase64 - Encrypted data (base64)
 * @param {string} ivBase64 - Initialization vector (base64)
 * @returns {Promise<string>} Decrypted plaintext
 */
export async function decrypt(key, ciphertextBase64, ivBase64) {
  const ciphertext = base64ToArrayBuffer(ciphertextBase64);
  const iv = base64ToArrayBuffer(ivBase64);

  const decrypted = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv
    },
    key,
    ciphertext
  );

  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}

// ============================================================================
// PASSWORD GENERATION
// ============================================================================

/**
 * Generate a secure random password
 * @param {number} length - Password length (default 16)
 * @param {Object} options - Character set options
 * @returns {string} Generated password
 */
export function generatePassword(length = 16, options = {}) {
  const {
    uppercase = true,
    lowercase = true,
    numbers = true,
    symbols = true
  } = options;

  let charset = '';
  if (lowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
  if (uppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (numbers) charset += '0123456789';
  if (symbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

  if (charset === '') {
    throw new Error('At least one character type must be selected');
  }

  // Use crypto.getRandomValues for secure randomness
  const password = [];
  const randomValues = new Uint32Array(length);
  window.crypto.getRandomValues(randomValues);

  for (let i = 0; i < length; i++) {
    password.push(charset[randomValues[i] % charset.length]);
  }

  return password.join('');
}

// ============================================================================
// VAULT KEY MANAGEMENT
// ============================================================================

/**
 * Generate a new vault encryption key (for encrypting password entries)
 * This key is itself encrypted with the master key
 * @returns {Promise<CryptoKey>} AES-256 vault key
 */
export async function generateVaultKey() {
  return await window.crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256
    },
    true, // Extractable (so we can encrypt it with master key)
    ['encrypt', 'decrypt']
  );
}

/**
 * Export vault key to raw bytes for storage
 * @param {CryptoKey} vaultKey - Vault encryption key
 * @returns {Promise<ArrayBuffer>} Raw key bytes
 */
export async function exportVaultKey(vaultKey) {
  return await window.crypto.subtle.exportKey('raw', vaultKey);
}

/**
 * Import vault key from raw bytes
 * @param {ArrayBuffer} rawKey - Raw key bytes
 * @returns {Promise<CryptoKey>} AES-256 vault key
 */
export async function importVaultKey(rawKey) {
  return await window.crypto.subtle.importKey(
    'raw',
    rawKey,
    'AES-GCM',
    true,
    ['encrypt', 'decrypt']
  );
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Convert ArrayBuffer to Base64 string for storage
 * @param {ArrayBuffer} buffer
 * @returns {string} Base64 string
 */
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Convert Base64 string back to ArrayBuffer
 * @param {string} base64
 * @returns {ArrayBuffer}
 */
function base64ToArrayBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Hash data with SHA-256 (for verification, not encryption)
 * @param {string} data - Data to hash
 * @returns {Promise<string>} Hex hash
 */
export async function sha256Hash(data) {
  const encoder = new TextEncoder();
  const dataBytes = encoder.encode(data);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', dataBytes);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ============================================================================
// EXPORTS FOR TESTING
// ============================================================================

export const utils = {
  arrayBufferToBase64,
  base64ToArrayBuffer
};
