// Create file: frontend/password-manager-ui/src/utils/crypto-test.js
   
   async function testEncryption() {
     const encoder = new TextEncoder();
     const decoder = new TextDecoder();
     
     // Generate a key
     const key = await crypto.subtle.generateKey(
       { name: 'AES-GCM', length: 256 },
       true,
       ['encrypt', 'decrypt']
     );
     
     // Encrypt
     const plaintext = 'Hello, encryption!';
     const iv = crypto.getRandomValues(new Uint8Array(12));
     const ciphertext = await crypto.subtle.encrypt(
       { name: 'AES-GCM', iv: iv },
       key,
       encoder.encode(plaintext)
     );
     
     // Decrypt
     const decrypted = await crypto.subtle.decrypt(
       { name: 'AES-GCM', iv: iv },
       key,
       ciphertext
     );
     
     console.log('Original:', plaintext);
     console.log('Decrypted:', decoder.decode(decrypted));
     console.log('Match:', plaintext === decoder.decode(decrypted));
   }
   
   testEncryption();