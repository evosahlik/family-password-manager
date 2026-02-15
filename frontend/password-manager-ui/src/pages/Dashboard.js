import React from 'react';
import { getCurrentUser, signOut } from '../utils/auth';

function Dashboard() {
  const user = getCurrentUser();
  
  if (!user) {
    window.location.href = '/login';
    return null;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px' }}>
      <h2>Dashboard</h2>
      <p>Welcome! You are logged in.</p>
      <button onClick={() => {
        signOut();
        window.location.href = '/login';
      }}>
        Logout
      </button>
    </div>
  );
}

export default Dashboard;