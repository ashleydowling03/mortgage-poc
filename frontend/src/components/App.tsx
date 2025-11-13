import { useState, useEffect } from "react";
import AuthLayout from "./Auth";
import Calculator from "./Calculator";
import Dashboard from "./Dashboard/Dashboard";
import * as api from "./api";
import { SavedScenario } from "./types";

type View = 'auth' | 'dashboard' | 'calculator';

export default function App() {
  const [view, setView] = useState<View>('auth');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentScenario, setCurrentScenario] = useState<SavedScenario | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
        setView('dashboard'); // Start at dashboard when logged in
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }

    setLoading(false);
  }, []);

  const handleAuthSuccess = (token: string, userData: any) => {
    setIsAuthenticated(true);
    setUser(userData);
    setView('dashboard'); // Go to dashboard after login
  };

  const handleLogout = () => {
    api.logout();
    setIsAuthenticated(false);
    setUser(null);
    setView('auth');
    setCurrentScenario(null);
  };

  const handleNewCalculation = () => {
    setCurrentScenario(null);
    setView('calculator');
  };

  const handleLoadScenario = (scenario: SavedScenario) => {
    setCurrentScenario(scenario);
    setView('calculator');
  };

  const handleBackToDashboard = () => {
    setCurrentScenario(null);
    setView('dashboard');
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#f5f5f5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #e9ecef',
            borderTop: '4px solid #2d4a4f',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px',
          }} />
          <p style={{ color: '#6c757d', fontSize: '14px' }}>Loading...</p>
        </div>
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthLayout onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <>
      {view === 'dashboard' && (
        <Dashboard
          onLoadScenario={handleLoadScenario}
          onNewCalculation={handleNewCalculation}
        />
      )}

      {view === 'calculator' && (
        <Calculator
          user={user}
          onLogout={handleLogout}
          loadedScenario={currentScenario}
          onBackToDashboard={handleBackToDashboard}
        />
      )}
    </>
  );
}