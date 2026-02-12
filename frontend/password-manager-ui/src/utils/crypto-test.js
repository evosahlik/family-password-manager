// frontend/password-manager-ui/src/utils/crypto-test.js

async function testEncryption() {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  
  console.log('🔐 Starting encryption test...');
  
  // Generate a key
  const key = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
  
  console.log('✓ Key generated');
  
  // Encrypt
  const plaintext = 'Hello, encryption!';
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    encoder.encode(plaintext)
  );
  
  console.log('✓ Text encrypted');
  console.log('Original:', plaintext);
  console.log('Encrypted (first 20 bytes):', new Uint8Array(ciphertext).slice(0, 20));
  
  // Decrypt
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    ciphertext
  );
  
  const decryptedText = decoder.decode(decrypted);
  console.log('✓ Text decrypted');
  console.log('Decrypted:', decryptedText);
  console.log('Match:', plaintext === decryptedText ? '✅ SUCCESS' : '❌ FAILED');
}

// Make it available globally
window.testEncryption = testEncryption;

export default testEncryption;