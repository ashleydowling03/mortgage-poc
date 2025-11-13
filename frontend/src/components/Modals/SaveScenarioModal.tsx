import React, { useState } from 'react';
import * as api from '../api';
import { Debt, SavedScenario } from '../types';

interface SaveScenarioModalProps {
  mortgageBalance: number;
  closingCosts: number;
  additionalCash: number;
  offerRate: number;
  offerTerm: number;
  currentApr: number;
  currentTerm: number;
  debts: Debt[];
  estimatedMIP: number;
  estimatedMonthlyTaxes: number;
  estimatedMonthlyInsurance: number;
  onClose: () => void;
  onSuccess: () => void;
}

// Styles
const modalOverlay: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0,0,0,0.7)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  padding: 20,
};

const modalContent: React.CSSProperties = {
  background: '#fff',
  borderRadius: 12,
  maxWidth: 500,
  width: '100%',
  maxHeight: '90vh',
  overflow: 'auto',
};

const modalHeader: React.CSSProperties = {
  background: '#2d4a4f',
  color: '#fff',
  padding: '20px 24px',
  borderTopLeftRadius: 12,
  borderTopRightRadius: 12,
  position: 'relative',
};

const modalBody: React.CSSProperties = {
  padding: 24,
};

const inputLabel: React.CSSProperties = {
  display: 'block',
  marginBottom: 8,
  fontSize: 13,
  fontWeight: 600,
  color: '#495057',
};

const inputField: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  border: '1px solid #dee2e6',
  borderRadius: 6,
  fontSize: 14,
  fontFamily: 'inherit',
  marginBottom: 16,
};

const buttonRow: React.CSSProperties = {
  display: 'flex',
  gap: 12,
  marginTop: 24,
};

export const SaveScenarioModal: React.FC<SaveScenarioModalProps> = ({
  mortgageBalance,
  closingCosts,
  additionalCash,
  offerRate,
  offerTerm,
  currentApr,
  currentTerm,
  debts,
  estimatedMIP,
  estimatedMonthlyTaxes,
  estimatedMonthlyInsurance,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [leadId, setLeadId] = useState('');
  const [clientName, setClientName] = useState('');
  const [propertyAddress, setPropertyAddress] = useState('');
  const [campaignDate, setCampaignDate] = useState('');
  const [marketingProduct, setMarketingProduct] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter a scenario name');
      return;
    }

    setLoading(true);

    try {
      const scenarioData: Omit<SavedScenario, '_id' | 'createdAt' | 'updatedAt'> = {
        name: name.trim(),
        date: new Date().toISOString(),
        leadId: leadId.trim(),
        clientName: clientName.trim(),
        propertyAddress: propertyAddress.trim(),
        campaignDate: campaignDate.trim(),
        marketingProduct: marketingProduct.trim(),
        mortgageBalance,
        closingCosts,
        additionalCash,
        offerRate,
        offerTerm,
        currentApr,
        currentTerm,
        debts,
        estimatedMIP,
        estimatedMonthlyTaxes,
        estimatedMonthlyInsurance,
      };

      await api.saveScenario(scenarioData);

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save scenario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={modalOverlay} onClick={onClose}>
      <div style={modalContent} onClick={(e) => e.stopPropagation()}>
        <div style={modalHeader}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
            Save Scenario
          </h2>
        </div>

        <div style={modalBody}>
          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{
                background: '#f8d7da',
                color: '#721c24',
                padding: '12px 16px',
                borderRadius: 6,
                marginBottom: 16,
                fontSize: 14,
                border: '1px solid #f5c6cb',
              }}>
                {error}
              </div>
            )}

            <div>
              <label style={inputLabel}>Scenario Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Rate Reduction for Smith Family"
                style={inputField}
                autoFocus
              />
            </div>

            <div>
              <label style={inputLabel}>Lead ID</label>
              <input
                type="text"
                value={leadId}
                onChange={(e) => setLeadId(e.target.value)}
                placeholder="e.g., LEAD-12345"
                style={inputField}
              />
            </div>

            <div>
              <label style={inputLabel}>Client Name</label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g., John and Jane Smith"
                style={inputField}
              />
            </div>

            <div>
              <label style={inputLabel}>Property Address</label>
              <input
                type="text"
                value={propertyAddress}
                onChange={(e) => setPropertyAddress(e.target.value)}
                placeholder="e.g., 123 Main St, City, State 12345"
                style={inputField}
              />
            </div>

            <div>
              <label style={inputLabel}>Campaign Date</label>
              <input
                type="date"
                value={campaignDate}
                onChange={(e) => setCampaignDate(e.target.value)}
                style={inputField}
              />
            </div>

            <div>
              <label style={inputLabel}>Marketing Product</label>
              <input
                type="text"
                value={marketingProduct}
                onChange={(e) => setMarketingProduct(e.target.value)}
                placeholder="e.g., 30-Year Fixed Rate Refinance"
                style={inputField}
              />
            </div>

            <div style={buttonRow}>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#fff',
                  color: '#6c757d',
                  border: '2px solid #dee2e6',
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: loading ? '#6c757d' : '#2d4a4f',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? 'Saving...' : 'Save Scenario'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SaveScenarioModal;