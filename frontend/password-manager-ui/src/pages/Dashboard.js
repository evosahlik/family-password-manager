import React from 'react';
import { getCurrentUser, signOut } from '../utils/auth';
import { useCrypto } from '../context/CryptoContext';
import VaultStatus from '../components/VaultStatus';
import CryptoTest from '../components/CryptoTest';

function Dashboard() {
  const user = getCurrentUser();
  const { lock } = useCrypto();
  
  if (!user) {
    window.location.href = '/login';
    return null;
  }

  const handleLogout = () => {
    // Lock vault before signing out
    lock();
    signOut();
    window.location.href = '/login';
  };

  return (
    <div>
      <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px',
          paddingBottom: '20px',
          borderBottom: '2px solid #ECF0F1'
        }}>
          <div>
            <h2 style={{ margin: 0, color: '#2C3E50' }}>Password Manager</h2>
            <p style={{ margin: '5px 0 0 0', color: '#7F8C8D' }}>
              Welcome back! Manage your passwords securely.
            </p>
          </div>
          <button 
            onClick={handleLogout}
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
            Logout
          </button>
        </div>

        <VaultStatus />

        <div style={{
          padding: '20px',
          backgroundColor: '#ECF0F1',
          borderRadius: '8px',
          textAlign: 'center',
          color: '#7F8C8D'
        }}>
          <p style={{ margin: 0, fontSize: '14px' }}>
            🚧 Password management UI coming in Sprint 3!
          </p>
          <p style={{ margin: '5px 0 0 0', fontSize: '12px' }}>
            (DynamoDB + Lambda + API Gateway integration)
          </p>
        </div>
      </div>

      {/* Remove or comment out CryptoTest once you've verified everything works */}
      <CryptoTest />
    </div>
  );
}

export default Dashboard;
