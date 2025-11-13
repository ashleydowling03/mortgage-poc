import React, { useState } from 'react';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';

interface AuthLayoutProps {
  onAuthSuccess: (token: string, user: any) => void;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #2d4a4f 0%, #1a3334 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '12px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        width: '100%',
        maxWidth: '480px',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          background: '#2d4a4f',
          padding: '32px',
          textAlign: 'center',
          color: '#fff',
        }}>
          <div style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>
            loansure
          </div>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>
            {isLogin ? 'Welcome back!' : 'Create your account'}
          </div>
        </div>

        {/* Form */}
        <div style={{ padding: '32px' }}>
          {isLogin ? (
            <LoginForm onSuccess={onAuthSuccess} />
          ) : (
            <SignupForm onSuccess={onAuthSuccess} />
          )}

          {/* Toggle */}
          <div style={{
            marginTop: '24px',
            textAlign: 'center',
            fontSize: '14px',
            color: '#6c757d',
          }}>
            {isLogin ? "Don't have an account?" : 'Already have an account?'}
            {' '}
            <button
              onClick={() => setIsLogin(!isLogin)}
              style={{
                background: 'none',
                border: 'none',
                color: '#2d4a4f',
                fontWeight: 600,
                cursor: 'pointer',
                textDecoration: 'underline',
                fontSize: '14px',
              }}
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Export as default and named export for flexibility
export default AuthLayout;