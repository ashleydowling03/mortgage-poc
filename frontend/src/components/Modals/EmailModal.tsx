import React, { useState } from 'react';

interface EmailModalProps {
  scenarioData: any;
  onClose: () => void;
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

const textArea: React.CSSProperties = {
  ...inputField,
  minHeight: 120,
  resize: 'vertical' as const,
  fontFamily: 'inherit',
};

const buttonRow: React.CSSProperties = {
  display: 'flex',
  gap: 12,
  marginTop: 24,
};

export const EmailModal: React.FC<EmailModalProps> = ({ scenarioData, onClose }) => {
  const [toEmail, setToEmail] = useState('');
  const [subject, setSubject] = useState('Your Mortgage Refinance Scenario');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validation
    if (!toEmail.trim()) {
      setError('Please enter a recipient email address');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(toEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      // TODO: Implement email sending via API
      // await api.sendScenarioEmail({ toEmail, subject, message, scenarioData });
      
      // Simulated delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to send email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={modalOverlay} onClick={onClose}>
      <div style={modalContent} onClick={(e) => e.stopPropagation()}>
        <div style={modalHeader}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
            Email Scenario to Homeowner
          </h2>
        </div>

        <div style={modalBody}>
          {success ? (
            <div style={{
              background: '#d4edda',
              color: '#155724',
              padding: '20px',
              borderRadius: 8,
              textAlign: 'center',
              border: '1px solid #c3e6cb',
            }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>✓</div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>Email sent successfully!</div>
            </div>
          ) : (
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
                <label style={inputLabel}>Recipient Email *</label>
                <input
                  type="email"
                  value={toEmail}
                  onChange={(e) => setToEmail(e.target.value)}
                  placeholder="homeowner@example.com"
                  style={inputField}
                  autoFocus
                />
              </div>

              <div>
                <label style={inputLabel}>Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  style={inputField}
                />
              </div>

              <div>
                <label style={inputLabel}>Message (optional)</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Add a personal message to the homeowner..."
                  style={textArea}
                />
              </div>

              <div style={{
                background: '#f8f9fa',
                padding: 16,
                borderRadius: 6,
                fontSize: 13,
                color: '#6c757d',
                marginBottom: 16,
              }}>
                📎 The scenario details will be included in the email automatically.
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
                  {loading ? 'Sending...' : 'Send Email'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailModal;