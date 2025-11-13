import React, { useState } from 'react';
import * as api from '../api';

interface SignupFormProps {
  onSuccess: (token: string, user: any) => void;
}

export const SignupForm: React.FC<SignupFormProps> = ({ onSuccess }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await api.register(email, password, name);
      onSuccess(response.token, response.user);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div style={{
          background: '#f8d7da',
          color: '#721c24',
          padding: '12px 16px',
          borderRadius: '6px',
          marginBottom: '20px',
          fontSize: '14px',
          border: '1px solid #f5c6cb',
        }}>
          {error}
        </div>
      )}

      <div style={{ marginBottom: '20px' }}>
        <label style={{
          display: 'block',
          marginBottom: '8px',
          fontSize: '13px',
          fontWeight: 600,
          color: '#495057',
        }}>
          Full Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="John Doe"
          autoComplete="name"
          style={{
            width: '100%',
            padding: '12px 14px',
            border: '1px solid #dee2e6',
            borderRadius: '6px',
            fontSize: '14px',
            fontFamily: 'inherit',
          }}
          onFocus={(e) => e.target.style.borderColor = '#2d4a4f'}
          onBlur={(e) => e.target.style.borderColor = '#dee2e6'}
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{
          display: 'block',
          marginBottom: '8px',
          fontSize: '13px',
          fontWeight: 600,
          color: '#495057',
        }}>
          Email Address
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          style={{
            width: '100%',
            padding: '12px 14px',
            border: '1px solid #dee2e6',
            borderRadius: '6px',
            fontSize: '14px',
            fontFamily: 'inherit',
          }}
          onFocus={(e) => e.target.style.borderColor = '#2d4a4f'}
          onBlur={(e) => e.target.style.borderColor = '#dee2e6'}
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{
          display: 'block',
          marginBottom: '8px',
          fontSize: '13px',
          fontWeight: 600,
          color: '#495057',
        }}>
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete="new-password"
          style={{
            width: '100%',
            padding: '12px 14px',
            border: '1px solid #dee2e6',
            borderRadius: '6px',
            fontSize: '14px',
            fontFamily: 'inherit',
          }}
          onFocus={(e) => e.target.style.borderColor = '#2d4a4f'}
          onBlur={(e) => e.target.style.borderColor = '#dee2e6'}
        />
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={{
          display: 'block',
          marginBottom: '8px',
          fontSize: '13px',
          fontWeight: 600,
          color: '#495057',
        }}>
          Confirm Password
        </label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete="new-password"
          style={{
            width: '100%',
            padding: '12px 14px',
            border: '1px solid #dee2e6',
            borderRadius: '6px',
            fontSize: '14px',
            fontFamily: 'inherit',
          }}
          onFocus={(e) => e.target.style.borderColor = '#2d4a4f'}
          onBlur={(e) => e.target.style.borderColor = '#dee2e6'}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        style={{
          width: '100%',
          padding: '14px',
          background: loading ? '#6c757d' : '#2d4a4f',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          fontSize: '15px',
          fontWeight: 600,
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          if (!loading) e.currentTarget.style.background = '#1a3334';
        }}
        onMouseLeave={(e) => {
          if (!loading) e.currentTarget.style.background = '#2d4a4f';
        }}
      >
        {loading ? 'Creating account...' : 'Create Account'}
      </button>
    </form>
  );
};

export default SignupForm;