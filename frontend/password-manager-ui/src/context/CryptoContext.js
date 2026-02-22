import React, { createContext, useState, useContext } from 'react';
import {
  deriveMasterKey,
  generateSalt,
  generateVaultKey,
  exportVaultKey,
  importVaultKey,
  encrypt,
  decrypt,
  utils
} from '../utils/crypto';
import { prepareVaultPassword } from '../config/vaultConfig';

/**
 * CryptoContext - Manages vault encryption key in memory
 * 
 * Provides:
 * - vaultKey: The active vault encryption key (CryptoKey object)
 * - isUnlocked: Boolean indicating if vault is unlocked
 * - unlock(): Decrypt and load vault key into memory
 * - lock(): Clear vault key from memory
 * - setupNewVault(): First-time vault creation for new users
 */

const CryptoContext = createContext();

export function CryptoProvider({ children }) {
  const [vaultKey, setVaultKey] = useState(null);
  const [isUnlocked, setIsUnlocked] = useState(false);

  /**
   * Setup a new vault for first-time users
   * Called during registration or first login
   * 
   * @param {string} masterPassword - User's master password
   * @returns {Object} Encrypted vault data to store in DynamoDB
   */
  const setupNewVault = async (masterPassword) => {
    try {
      console.log('🔧 Setting up new vault...');

      // 1. Generate cryptographic salt
      const salt = generateSalt();
      const saltBase64 = utils.arrayBufferToBase64(salt);

      // 2. Add pepper to password for vault encryption
      const vaultPassword = prepareVaultPassword(masterPassword);

      // 3. Derive master key from peppered password
      const masterKey = await deriveMasterKey(vaultPassword, salt);

      // 4. Generate new vault encryption key
      const newVaultKey = await generateVaultKey();

      // 5. Export vault key and encrypt it with master key
      const vaultKeyRaw = await exportVaultKey(newVaultKey);
      const vaultKeyBase64 = utils.arrayBufferToBase64(vaultKeyRaw);
      const encryptedVaultKey = await encrypt(masterKey, vaultKeyBase64);

      // 6. Store vault key in memory
      setVaultKey(newVaultKey);
      setIsUnlocked(true);

      console.log('✅ New vault created and unlocked');

      // Return data to store in DynamoDB user profile
      return {
        saltBase64,
        encryptedVaultKey: {
          ciphertext: encryptedVaultKey.ciphertext,
          iv: encryptedVaultKey.iv
        }
      };
    } catch (error) {
      console.error('❌ Failed to setup vault:', error);
      throw error;
    }
  };

  /**
   * Unlock existing vault
   * Called during login after Cognito authentication
   * 
   * @param {string} masterPassword - User's master password
   * @param {Object} userProfile - User profile from DynamoDB containing encrypted vault key
   * @returns {boolean} Success status
   */
  const unlock = async (masterPassword, userProfile) => {
    try {
      console.log('🔓 Unlocking vault...');

      // 1. Retrieve salt from user profile
      const salt = utils.base64ToArrayBuffer(userProfile.saltBase64);

      // 2. Add pepper to password for vault encryption
      const vaultPassword = prepareVaultPassword(masterPassword);

      // 3. Derive master key from peppered password
      const masterKey = await deriveMasterKey(vaultPassword, salt);

      // 4. Decrypt vault key
      const vaultKeyBase64 = await decrypt(
        masterKey,
        userProfile.encryptedVaultKey.ciphertext,
        userProfile.encryptedVaultKey.iv
      );

      // 5. Import vault key for use
      const vaultKeyRaw = utils.base64ToArrayBuffer(vaultKeyBase64);
      const decryptedVaultKey = await importVaultKey(vaultKeyRaw);

      // 6. Store in memory
      setVaultKey(decryptedVaultKey);
      setIsUnlocked(true);

      console.log('✅ Vault unlocked successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to unlock vault:', error);
      // Wrong password or corrupted data
      setVaultKey(null);
      setIsUnlocked(false);
      return false;
    }
  };

  /**
   * Lock vault - clear encryption key from memory
   * Called during logout or when user explicitly locks vault
   */
  const lock = () => {
    console.log('🔒 Locking vault...');
    setVaultKey(null);
    setIsUnlocked(false);
    console.log('✅ Vault locked');
  };

  /**
   * Encrypt a password entry
   * 
   * @param {Object} entry - Password entry object
   * @returns {Object} Encrypted entry for DynamoDB storage
   */
  const encryptEntry = async (entry) => {
    if (!vaultKey) {
      throw new Error('Vault is locked. Unlock vault first.');
    }

    try {
      // Encrypt the entire entry object as JSON
      const entryJson = JSON.stringify(entry);
      const encrypted = await encrypt(vaultKey, entryJson);

      return {
        id: entry.id,
        encryptedData: encrypted.ciphertext,
        iv: encrypted.iv,
        createdAt: entry.createdAt,
        updatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Failed to encrypt entry:', error);
      throw error;
    }
  };

  /**
   * Decrypt a password entry
   * 
   * @param {Object} encryptedEntry - Encrypted entry from DynamoDB
   * @returns {Object} Decrypted password entry
   */
  const decryptEntry = async (encryptedEntry) => {
    if (!vaultKey) {
      throw new Error('Vault is locked. Unlock vault first.');
    }

    try {
      const decryptedJson = await decrypt(
        vaultKey,
        encryptedEntry.encryptedData,
        encryptedEntry.iv
      );

      return JSON.parse(decryptedJson);
    } catch (error) {
      console.error('❌ Failed to decrypt entry:', error);
      throw error;
    }
  };

  const value = {
    // State
    vaultKey,
    isUnlocked,

    // Methods
    setupNewVault,
    unlock,
    lock,
    encryptEntry,
    decryptEntry
  };

  return (
    <CryptoContext.Provider value={value}>
      {children}
    </CryptoContext.Provider>
  );
}

/**
 * Custom hook to use crypto context
 * Usage: const { isUnlocked, unlock, lock } = useCrypto();
 */
export function useCrypto() {
  const context = useContext(CryptoContext);
  if (context === undefined) {
    throw new Error('useCrypto must be used within a CryptoProvider');
  }
  return context;
}

export default CryptoContext;
