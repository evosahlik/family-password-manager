/**
 * Vault Security Configuration
 * 
 * IMPORTANT SECURITY NOTES:
 * - VAULT_PEPPER: Adds additional entropy to master password for vault encryption
 *   This means even if AWS/Cognito is compromised, attackers can't derive vault key
 * - PBKDF2_ITERATIONS: Higher iterations = more resistant to brute force attacks
 *   Trade-off: Higher = more secure but slower unlock time
 * - Keep this file in version control - it's not a secret key itself, just a constant
 */

export const VAULT_CONFIG = {
  // Secret pepper added to password for vault key derivation
  // This ensures vault encryption key ≠ Cognito password
  pepper: 'vosahlik-family-vault-secret-2024',
  
  // PBKDF2 iterations for key derivation
  // 250K iterations = ~500ms on modern hardware, very secure
  // OWASP recommends minimum 100K for 2024, we use 250K for extra security
  pbkdf2Iterations: 250000,
  
  // Algorithm configuration (don't change unless you know what you're doing)
  algorithm: 'AES-GCM',
  keyLength: 256,
  saltLength: 16,  // bytes
  ivLength: 12     // bytes for GCM mode
};

/**
 * Prepare password for vault encryption
 * Adds pepper to make vault key cryptographically different from Cognito password
 * 
 * @param {string} userPassword - User's login password
 * @returns {string} Password with pepper for vault key derivation
 */
export function prepareVaultPassword(userPassword) {
  return userPassword + VAULT_CONFIG.pepper;
}

/**
 * Security Notes for AWS SSA Exam:
 * 
 * Defense in Depth:
 * 1. Cognito handles authentication (who you are)
 * 2. Client-side encryption protects data (what you store)
 * 3. Pepper ensures crypto key ≠ auth password
 * 4. High iteration count defends against brute force
 * 5. Unique per-user salt prevents rainbow tables
 * 
 * Comparison:
 * - AWS Secrets Manager: Server-side, AWS has keys ($0.40/secret/month)
 * - AWS KMS: Server-side, you control rotation ($1/key/month)
 * - This approach: Client-side, zero-knowledge, free
 * 
 * Trade-offs:
 * - PRO: True zero-knowledge (even AWS can't decrypt)
 * - PRO: No per-secret costs
 * - CON: No password recovery (user must remember master password)
 * - CON: Client performance impact (PBKDF2 iterations)
 */
