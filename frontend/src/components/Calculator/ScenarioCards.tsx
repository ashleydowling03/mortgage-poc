import React from 'react';
import { SavedScenario } from '../types';

interface ScenarioCardProps {
  scenario: SavedScenario;
  onLoad: () => void;
  onDelete: () => void;
}

export const ScenarioCard: React.FC<ScenarioCardProps> = ({ scenario, onLoad, onDelete }) => {
  // Format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  // Format currency
  const fmtMoney = (n?: number) => {
    if (n == null || !isFinite(n)) return '—';
    return `$${n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  return (
    <div style={{
      background: '#fff',
      borderRadius: 12,
      padding: 24,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      transition: 'all 0.2s',
      border: '2px solid transparent',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)';
      e.currentTarget.style.borderColor = '#2d4a4f';
      e.currentTarget.style.transform = 'translateY(-2px)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
      e.currentTarget.style.borderColor = 'transparent';
      e.currentTarget.style.transform = 'translateY(0)';
    }}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
      }}>
        <div style={{ flex: 1 }}>
          <h3 style={{
            margin: '0 0 4px',
            fontSize: 18,
            fontWeight: 700,
            color: '#2d4a4f',
          }}>
            {scenario.name || 'Untitled Scenario'}
          </h3>
          <p style={{
            margin: 0,
            fontSize: 12,
            color: '#6c757d',
          }}>
            {formatDate(scenario.date || scenario.createdAt)}
          </p>
        </div>

        {/* Delete Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          style={{
            padding: 8,
            background: 'transparent',
            border: 'none',
            borderRadius: 4,
            color: '#dc3545',
            cursor: 'pointer',
            fontSize: 18,
            lineHeight: 1,
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#f8d7da';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
          title="Delete scenario"
        >
          🗑️
        </button>
      </div>

      {/* Details */}
      <div style={{
        marginBottom: 16,
        paddingBottom: 16,
        borderBottom: '1px solid #e9ecef',
      }}>
        {scenario.leadId && (
          <div style={{
            display: 'flex',
            marginBottom: 8,
          }}>
            <span style={{
              fontSize: 13,
              color: '#6c757d',
              fontWeight: 600,
              minWidth: 80,
            }}>
              Lead ID:
            </span>
            <span style={{
              fontSize: 13,
              color: '#212529',
            }}>
              {scenario.leadId}
            </span>
          </div>
        )}

        {scenario.clientName && (
          <div style={{
            display: 'flex',
            marginBottom: 8,
          }}>
            <span style={{
              fontSize: 13,
              color: '#6c757d',
              fontWeight: 600,
              minWidth: 80,
            }}>
              Client:
            </span>
            <span style={{
              fontSize: 13,
              color: '#212529',
            }}>
              {scenario.clientName}
            </span>
          </div>
        )}

        {scenario.propertyAddress && (
          <div style={{
            display: 'flex',
            marginBottom: 8,
          }}>
            <span style={{
              fontSize: 13,
              color: '#6c757d',
              fontWeight: 600,
              minWidth: 80,
            }}>
              Property:
            </span>
            <span style={{
              fontSize: 13,
              color: '#212529',
            }}>
              {scenario.propertyAddress}
            </span>
          </div>
        )}

        {scenario.marketingProduct && (
          <div style={{
            display: 'flex',
            marginBottom: 8,
          }}>
            <span style={{
              fontSize: 13,
              color: '#6c757d',
              fontWeight: 600,
              minWidth: 80,
            }}>
              Product:
            </span>
            <span style={{
              fontSize: 13,
              color: '#212529',
            }}>
              {scenario.marketingProduct}
            </span>
          </div>
        )}
      </div>

      {/* Financial Summary */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 12,
        marginBottom: 16,
      }}>
        <div style={{
          background: '#f8f9fa',
          padding: 12,
          borderRadius: 6,
        }}>
          <div style={{
            fontSize: 11,
            color: '#6c757d',
            fontWeight: 600,
            marginBottom: 4,
            textTransform: 'uppercase',
          }}>
            Loan Amount
          </div>
          <div style={{
            fontSize: 16,
            fontWeight: 700,
            color: '#2d4a4f',
          }}>
            {fmtMoney(scenario.mortgageBalance)}
          </div>
        </div>

        <div style={{
          background: '#f8f9fa',
          padding: 12,
          borderRadius: 6,
        }}>
          <div style={{
            fontSize: 11,
            color: '#6c757d',
            fontWeight: 600,
            marginBottom: 4,
            textTransform: 'uppercase',
          }}>
            Rate
          </div>
          <div style={{
            fontSize: 16,
            fontWeight: 700,
            color: '#2d4a4f',
          }}>
            {scenario.offerRate?.toFixed(3)}%
          </div>
        </div>
      </div>

      {/* Load Button */}
      <button
        onClick={onLoad}
        style={{
          width: '100%',
          padding: '12px',
          background: '#2d4a4f',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#1a3334';
          e.currentTarget.style.transform = 'scale(1.02)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#2d4a4f';
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        Load Scenario
      </button>
    </div>
  );
};

export default ScenarioCard;