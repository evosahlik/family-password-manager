import React, { useState } from 'react';
import { signIn } from '../utils/auth';
import { useCrypto } from '../context/CryptoContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { unlock, setupNewVault } = useCrypto();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Step 1: Authenticate with Cognito
      console.log('🔑 Authenticating with Cognito...');
      const result = await signIn(email, password);
      console.log('✅ Cognito authentication successful');

      // Step 2: Auto-unlock vault with same password
      // TODO: In Sprint 3, fetch user profile from DynamoDB to check if vault exists
      // For now, we'll skip auto-unlock until DynamoDB is set up
      
      // Future implementation (Sprint 3):
      // const userProfile = await fetchUserProfile(result.username);
      // if (userProfile.hasVault) {
      //   await unlock(password, userProfile);
      // } else {
      //   await setupNewVault(password);
      // }

      console.log('📝 Note: Vault auto-unlock will be implemented in Sprint 3');
      
      // Step 3: Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (err) {
      console.error('❌ Login failed:', err);
      
      // Handle specific Cognito errors
      if (err.code === 'UserNotConfirmedException') {
        setError('Please verify your email before logging in. Check your inbox for the verification code.');
      } else if (err.code === 'NotAuthorizedException') {
        setError('Incorrect email or password');
      } else if (err.code === 'UserNotFoundException') {
        setError('No account found with this email');
      } else {
        setError(err.message || 'Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: '400px',
      margin: '100px auto',
      padding: '30px',
      backgroundColor: '#F8F9FA',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ textAlign: 'center', color: '#2C3E50', marginBottom: '10px' }}>
        🔐 Password Manager
      </h2>
      <p style={{ textAlign: 'center', color: '#7F8C8D', fontSize: '14px', marginBottom: '30px' }}>
        Sign in to access your vault
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', color: '#2C3E50', fontSize: '14px', fontWeight: '500' }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #BDC3C7',
              borderRadius: '4px',
              fontSize: '14px',
              boxSizing: 'border-box'
            }}
            placeholder="your@email.com"
            disabled={isLoading}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', color: '#2C3E50', fontSize: '14px', fontWeight: '500' }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #BDC3C7',
              borderRadius: '4px',
              fontSize: '14px',
              boxSizing: 'border-box'
            }}
            placeholder="••••••••"
            disabled={isLoading}
          />
        </div>

        {error && (
          <div style={{
            padding: '12px',
            backgroundColor: '#FFEBEE',
            color: '#C62828',
            borderRadius: '4px',
            marginBottom: '20px',
            fontSize: '14px',
            border: '1px solid #FFCDD2'
          }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: isLoading ? '#95A5A6' : '#3498DB',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s'
          }}
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div style={{
        marginTop: '20px',
        textAlign: 'center',
        fontSize: '14px',
        color: '#7F8C8D'
      }}>
        Don't have an account?{' '}
        <a
          href="/register"
          style={{
            color: '#3498DB',
            textDecoration: 'none',
            fontWeight: '500'
          }}
        >
          Sign up
        </a>
      </div>

      <div style={{
        marginTop: '30px',
        padding: '15px',
        backgroundColor: '#E8F5E9',
        borderRadius: '4px',
        fontSize: '12px',
        color: '#2E7D32',
        border: '1px solid #C8E6C9'
      }}>
        <strong>🔒 Security Note:</strong> Your password is used for both authentication and vault encryption. 
        Keep it secure and memorable - it cannot be recovered if forgotten.
      </div>
    </div>
  );
}

export default Login;
