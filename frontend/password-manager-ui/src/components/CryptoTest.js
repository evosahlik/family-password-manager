import React, { useEffect, useState } from 'react';
import {
  deriveMasterKey,
  generateSalt,
  generateIV,
  encrypt,
  decrypt,
  generatePassword,
  generateVaultKey,
  exportVaultKey,
  importVaultKey,
  sha256Hash,
  utils
} from '../utils/crypto.js';

function CryptoTest() {
  const [results, setResults] = useState(null);
  const [testLog, setTestLog] = useState([]);

  const addLog = (message, type = 'info') => {
    setTestLog(prev => [...prev, { message, type, time: new Date().toLocaleTimeString() }]);
  };

  const runAllTests = async () => {
    addLog('🔐 Starting Crypto Module Tests...', 'header');
    
    let passCount = 0;
    let failCount = 0;

    // Test 1: Salt Generation
    try {
      const salt = generateSalt();
      if (salt.length === 16 && salt instanceof Uint8Array) {
        addLog('✅ Test 1 PASS: Salt generation (16 bytes)', 'pass');
        passCount++;
      } else {
        throw new Error('Invalid salt');
      }
    } catch (error) {
      addLog(`❌ Test 1 FAIL: ${error.message}`, 'fail');
      failCount++;
    }

    // Test 2: IV Generation
    try {
      const iv = generateIV();
      if (iv.length === 12 && iv instanceof Uint8Array) {
        addLog('✅ Test 2 PASS: IV generation (12 bytes)', 'pass');
        passCount++;
      } else {
        throw new Error('Invalid IV');
      }
    } catch (error) {
      addLog(`❌ Test 2 FAIL: ${error.message}`, 'fail');
      failCount++;
    }

    // Test 3: Key Derivation
    try {
      const masterPassword = 'MySecurePassword123!';
      const salt = generateSalt();
      const key = await deriveMasterKey(masterPassword, salt);
      
      if (key.type === 'secret' && key.algorithm.name === 'AES-GCM') {
        addLog('✅ Test 3 PASS: PBKDF2 key derivation', 'pass');
        passCount++;
      } else {
        throw new Error('Invalid key');
      }
    } catch (error) {
      addLog(`❌ Test 3 FAIL: ${error.message}`, 'fail');
      failCount++;
    }

    // Test 4: Encryption/Decryption Round-trip
    try {
      const masterPassword = 'TestPassword456!';
      const salt = generateSalt();
      const key = await deriveMasterKey(masterPassword, salt);
      
      const plaintext = 'This is my secret password: hunter2';
      const encrypted = await encrypt(key, plaintext);
      const decrypted = await decrypt(key, encrypted.ciphertext, encrypted.iv);
      
      if (decrypted === plaintext) {
        addLog('✅ Test 4 PASS: Encryption/decryption round-trip', 'pass');
        addLog(`   Original:  "${plaintext}"`, 'detail');
        addLog(`   Encrypted: "${encrypted.ciphertext.substring(0, 20)}..."`, 'detail');
        addLog(`   Decrypted: "${decrypted}"`, 'detail');
        passCount++;
      } else {
        throw new Error('Decrypted text does not match original');
      }
    } catch (error) {
      addLog(`❌ Test 4 FAIL: ${error.message}`, 'fail');
      failCount++;
    }

    // Test 5: Password Generation
    try {
      const password1 = generatePassword(16);
      const password2 = generatePassword(16);
      
      if (password1.length === 16 && password2.length === 16 && password1 !== password2) {
        addLog('✅ Test 5 PASS: Secure password generation', 'pass');
        addLog(`   Generated: "${password1}"`, 'detail');
        passCount++;
      } else {
        throw new Error('Invalid password generation');
      }
    } catch (error) {
      addLog(`❌ Test 5 FAIL: ${error.message}`, 'fail');
      failCount++;
    }

    // Test 6: Password Generation Options
    try {
      const numbersOnly = generatePassword(8, {
        uppercase: false,
        lowercase: false,
        symbols: false,
        numbers: true
      });
      
      if (/^\d+$/.test(numbersOnly)) {
        addLog('✅ Test 6 PASS: Password generation with options', 'pass');
        addLog(`   Numbers only: "${numbersOnly}"`, 'detail');
        passCount++;
      } else {
        throw new Error('Password options not working');
      }
    } catch (error) {
      addLog(`❌ Test 6 FAIL: ${error.message}`, 'fail');
      failCount++;
    }

    // Test 7: Vault Key Generation
    try {
      const vaultKey = await generateVaultKey();
      if (vaultKey.type === 'secret' && vaultKey.algorithm.name === 'AES-GCM') {
        addLog('✅ Test 7 PASS: Vault key generation', 'pass');
        passCount++;
      } else {
        throw new Error('Invalid vault key');
      }
    } catch (error) {
      addLog(`❌ Test 7 FAIL: ${error.message}`, 'fail');
      failCount++;
    }

    // Test 8: Vault Key Export/Import
    try {
      const vaultKey = await generateVaultKey();
      const exported = await exportVaultKey(vaultKey);
      const imported = await importVaultKey(exported);
      
      // Test that imported key works for encryption
      const testData = 'Test vault encryption';
      const enc = await encrypt(imported, testData);
      const dec = await decrypt(imported, enc.ciphertext, enc.iv);
      
      if (dec === testData) {
        addLog('✅ Test 8 PASS: Vault key export/import', 'pass');
        passCount++;
      } else {
        throw new Error('Imported key does not work');
      }
    } catch (error) {
      addLog(`❌ Test 8 FAIL: ${error.message}`, 'fail');
      failCount++;
    }

    // Test 9: SHA-256 Hashing
    try {
      const hash1 = await sha256Hash('test');
      const hash2 = await sha256Hash('test');
      const hash3 = await sha256Hash('different');
      
      if (hash1 === hash2 && hash1 !== hash3 && hash1.length === 64) {
        addLog('✅ Test 9 PASS: SHA-256 hashing', 'pass');
        addLog(`   Hash: ${hash1.substring(0, 32)}...`, 'detail');
        passCount++;
      } else {
        throw new Error('Hash mismatch');
      }
    } catch (error) {
      addLog(`❌ Test 9 FAIL: ${error.message}`, 'fail');
      failCount++;
    }

    // Test 10: Full Workflow (Master Key → Vault Key → Password Entry)
    try {
      // User's master password
      const masterPassword = 'MyMasterPassword2024!';
      const salt = generateSalt();
      
      // Derive master key from password
      const masterKey = await deriveMasterKey(masterPassword, salt);
      
      // Generate vault key
      const vaultKey = await generateVaultKey();
      
      // Encrypt vault key with master key (for storage)
      const vaultKeyRaw = await exportVaultKey(vaultKey);
      const vaultKeyBase64 = utils.arrayBufferToBase64(vaultKeyRaw);
      const encryptedVaultKey = await encrypt(masterKey, vaultKeyBase64);
      
      // Encrypt a password entry with vault key
      const passwordEntry = JSON.stringify({
        site: 'github.com',
        username: 'ericvosahlik',
        password: 'SuperSecret123!'
      });
      const encryptedEntry = await encrypt(vaultKey, passwordEntry);
      
      // Simulate retrieval: decrypt vault key, then decrypt entry
      const decryptedVaultKeyBase64 = await decrypt(
        masterKey,
        encryptedVaultKey.ciphertext,
        encryptedVaultKey.iv
      );
      const decryptedVaultKeyRaw = utils.base64ToArrayBuffer(decryptedVaultKeyBase64);
      const decryptedVaultKey = await importVaultKey(decryptedVaultKeyRaw);
      
      const decryptedEntry = await decrypt(
        decryptedVaultKey,
        encryptedEntry.ciphertext,
        encryptedEntry.iv
      );
      
      const retrievedEntry = JSON.parse(decryptedEntry);
      
      if (retrievedEntry.password === 'SuperSecret123!') {
        addLog('✅ Test 10 PASS: Full zero-knowledge workflow', 'pass');
        addLog('   Master Password → Master Key → Vault Key → Password Entry', 'detail');
        passCount++;
      } else {
        throw new Error('Workflow failed');
      }
    } catch (error) {
      addLog(`❌ Test 10 FAIL: ${error.message}`, 'fail');
      failCount++;
    }

    // Summary
    addLog('═'.repeat(50), 'divider');
    addLog(`📊 Test Results: ${passCount} passed, ${failCount} failed`, 'summary');
    addLog('═'.repeat(50), 'divider');
    
    if (failCount === 0) {
      addLog('🎉 All tests passed! Crypto module is ready.', 'success');
    } else {
      addLog('⚠️  Some tests failed. Review errors above.', 'warning');
    }
    
    setResults({ passCount, failCount });
  };

  useEffect(() => {
    runAllTests();
  }, []);

  const getLogColor = (type) => {
    switch (type) {
      case 'header': return '#4A90E2';
      case 'pass': return '#27AE60';
      case 'fail': return '#E74C3C';
      case 'detail': return '#95A5A6';
      case 'divider': return '#34495E';
      case 'summary': return '#8E44AD';
      case 'success': return '#27AE60';
      case 'warning': return '#F39C12';
      default: return '#2C3E50';
    }
  };

  return (
    <div style={{
      maxWidth: '900px',
      margin: '20px auto',
      padding: '20px',
      backgroundColor: '#F8F9FA',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ 
        marginBottom: '20px',
        color: '#2C3E50',
        borderBottom: '2px solid #3498DB',
        paddingBottom: '10px'
      }}>
        🔐 Crypto Module Test Suite
      </h2>

      {results && (
        <div style={{
          display: 'flex',
          gap: '20px',
          marginBottom: '20px',
          padding: '15px',
          backgroundColor: 'white',
          borderRadius: '6px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: '32px', color: '#27AE60', fontWeight: 'bold' }}>
              {results.passCount}
            </div>
            <div style={{ color: '#7F8C8D', fontSize: '14px' }}>Tests Passed</div>
          </div>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: '32px', color: '#E74C3C', fontWeight: 'bold' }}>
              {results.failCount}
            </div>
            <div style={{ color: '#7F8C8D', fontSize: '14px' }}>Tests Failed</div>
          </div>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: '32px', color: '#3498DB', fontWeight: 'bold' }}>
              {((results.passCount / 10) * 100).toFixed(0)}%
            </div>
            <div style={{ color: '#7F8C8D', fontSize: '14px' }}>Success Rate</div>
          </div>
        </div>
      )}

      <div style={{
        backgroundColor: '#1E1E1E',
        padding: '20px',
        borderRadius: '6px',
        fontFamily: 'Monaco, Consolas, monospace',
        fontSize: '13px',
        maxHeight: '500px',
        overflowY: 'auto',
        lineHeight: '1.6'
      }}>
        {testLog.map((log, index) => (
          <div
            key={index}
            style={{
              color: getLogColor(log.type),
              marginBottom: log.type === 'divider' ? '5px' : '3px',
              whiteSpace: 'pre-wrap'
            }}
          >
            {log.message}
          </div>
        ))}
      </div>

      <div style={{
        marginTop: '20px',
        padding: '15px',
        backgroundColor: '#E8F5E9',
        borderLeft: '4px solid #27AE60',
        borderRadius: '4px'
      }}>
        <strong style={{ color: '#27AE60' }}>✓ Next Steps:</strong>
        <ul style={{ marginTop: '10px', marginBottom: '0', color: '#2C3E50' }}>
          <li>Create CryptoContext for vault key management</li>
          <li>Integrate with login flow (unlock vault after Cognito auth)</li>
          <li>Add vault status indicator to Dashboard</li>
          <li>Implement password entry encryption/decryption</li>
        </ul>
      </div>
    </div>
  );
}

export default CryptoTest;
