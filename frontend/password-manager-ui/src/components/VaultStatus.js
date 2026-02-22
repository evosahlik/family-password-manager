import React, { useState } from 'react';
import { useCrypto } from '../context/CryptoContext';

function VaultStatus() {
  const { isUnlocked, unlock, lock } = useCrypto();
  const [masterPassword, setMasterPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleUnlock = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // TODO: Replace with actual user profile from DynamoDB in Sprint 3
      // For now, this demonstrates the unlock flow but will fail
      setError('⚠️ Vault unlock requires DynamoDB integration (Sprint 3). This shows the UI flow only.');
      setIsLoading(false);
      return;
      
      // Future code (Sprint 3):
      // const mockUserProfile = {
      //   saltBase64: 'your-salt-here',
      //   encryptedVaultKey: {
      //     ciphertext: 'your-encrypted-vault-key',
      //     iv: 'your-iv'
      //   }
      // };
      // const success = await unlock(masterPassword, mockUserProfile);
      // if (success) {
      //   setMasterPassword('');
      // } else {
      //   setError('Incorrect master password');
      // }
    } catch (err) {
      setError('Failed to unlock vault: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLock = () => {
    lock();
    setMasterPassword('');
    setError('');
  };

  return (
    <div style={{
      padding: '20px',
      backgroundColor: isUnlocked ? '#E8F5E9' : '#FFF3E0',
      borderRadius: '8px',
      marginBottom: '20px',
      border: `2px solid ${isUnlocked ? '#4CAF50' : '#FF9800'}`
    }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
        <span style={{ fontSize: '24px', marginRight: '10px' }}>
          {isUnlocked ? '🔓' : '🔒'}
        </span>
        <div>
          <h3 style={{ margin: 0, color: '#2C3E50' }}>
            Vault Status: {isUnlocked ? 'Unlocked' : 'Locked'}
          </h3>
          <p style={{ margin: '5px 0 0 0', color: '#7F8C8D', fontSize: '14px' }}>
            {isUnlocked 
              ? 'Your passwords are accessible' 
              : 'Enter your master password to access passwords'}
          </p>
        </div>
      </div>

      {!isUnlocked ? (
        <form onSubmit={handleUnlock}>
          <input
            type="password"
            placeholder="Master Password"
            value={masterPassword}
            onChange={(e) => setMasterPassword(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              marginBottom: '10px',
              border: '1px solid #BDC3C7',
              borderRadius: '4px',
              fontSize: '14px'
            }}
            disabled={isLoading}
          />
          {error && (
            <div style={{
              padding: '10px',
              backgroundColor: '#FFEBEE',
              color: '#C62828',
              borderRadius: '4px',
              marginBottom: '10px',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={isLoading || !masterPassword}
            style={{
              padding: '10px 20px',
              backgroundColor: isLoading ? '#95A5A6' : '#3498DB',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            {isLoading ? 'Unlocking...' : 'Unlock Vault'}
          </button>
        </form>
      ) : (
        <div>
          <p style={{ margin: '0 0 10px 0', color: '#27AE60', fontSize: '14px' }}>
            ✓ You can now view and manage your passwords
          </p>
          <button
            onClick={handleLock}
            style={{
              padding: '10px 20px',
              backgroundColor: '#E74C3C',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            Lock Vault
          </button>
        </div>
      )}
    </div>
  );
}

export default VaultStatus;
