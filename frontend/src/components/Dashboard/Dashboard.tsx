import React, { useState, useEffect } from 'react';
import * as api from '../api';
import { SavedScenario } from '../types';
import { ScenarioCard } from './ScenarioCard';
import { SearchBar } from './SearchBar';

interface DashboardProps {
  onLoadScenario: (scenario: SavedScenario) => void;
  onNewCalculation: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onLoadScenario, onNewCalculation }) => {
  const [scenarios, setScenarios] = useState<SavedScenario[]>([]);
  const [filteredScenarios, setFilteredScenarios] = useState<SavedScenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch all scenarios on mount
  useEffect(() => {
    fetchScenarios();
  }, []);

  // Filter scenarios when search query changes
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredScenarios(scenarios);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = scenarios.filter(scenario =>
        scenario.name?.toLowerCase().includes(query) ||
        scenario.clientName?.toLowerCase().includes(query) ||
        scenario.propertyAddress?.toLowerCase().includes(query) ||
        scenario.leadId?.toLowerCase().includes(query)
      );
      setFilteredScenarios(filtered);
    }
  }, [searchQuery, scenarios]);

  const fetchScenarios = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getAllScenarios();
      setScenarios(data);
      setFilteredScenarios(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch scenarios');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this scenario?')) {
      return;
    }

    try {
      await api.deleteScenario(id);
      // Remove from local state
      setScenarios(scenarios.filter(s => s._id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete scenario');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f5f5f5',
    }}>
      {/* Header */}
      <div style={{
        background: '#2d4a4f',
        color: '#fff',
        padding: '24px 32px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}>
        <div style={{
          maxWidth: 1400,
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>
              Saved Scenarios
            </h1>
            <p style={{ margin: '8px 0 0', opacity: 0.9, fontSize: 14 }}>
              {filteredScenarios.length} scenario{filteredScenarios.length !== 1 ? 's' : ''} found
            </p>
          </div>
          <button
            onClick={onNewCalculation}
            style={{
              padding: '12px 24px',
              background: '#5cb85c',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#4cae4c'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#5cb85c'}
          >
            + New Calculation
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{
        maxWidth: 1400,
        margin: '0 auto',
        padding: '32px',
      }}>
        {/* Search Bar */}
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by name, client, address, or lead ID..."
        />

        {/* Error Message */}
        {error && (
          <div style={{
            background: '#f8d7da',
            color: '#721c24',
            padding: '16px',
            borderRadius: 8,
            marginBottom: 24,
            border: '1px solid #f5c6cb',
          }}>
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
          }}>
            <div style={{
              width: 48,
              height: 48,
              border: '4px solid #e9ecef',
              borderTop: '4px solid #2d4a4f',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px',
            }} />
            <p style={{ color: '#6c757d', fontSize: 14 }}>Loading scenarios...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredScenarios.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: '#fff',
            borderRadius: 12,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          }}>
            <div style={{
              fontSize: 48,
              marginBottom: 16,
            }}>
              📊
            </div>
            <h2 style={{
              margin: '0 0 8px',
              fontSize: 24,
              fontWeight: 600,
              color: '#2d4a4f',
            }}>
              {searchQuery ? 'No scenarios found' : 'No saved scenarios yet'}
            </h2>
            <p style={{
              margin: '0 0 24px',
              color: '#6c757d',
              fontSize: 14,
            }}>
              {searchQuery
                ? 'Try adjusting your search terms'
                : 'Create your first calculation to get started'}
            </p>
            {!searchQuery && (
              <button
                onClick={onNewCalculation}
                style={{
                  padding: '12px 24px',
                  background: '#2d4a4f',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Create New Calculation
              </button>
            )}
          </div>
        )}

        {/* Scenarios Grid */}
        {!loading && filteredScenarios.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: 24,
          }}>
            {filteredScenarios.map(scenario => (
              <ScenarioCard
                key={scenario._id}
                scenario={scenario}
                onLoad={() => onLoadScenario(scenario)}
                onDelete={() => handleDelete(scenario._id)}
              />
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;