import React from 'react';

interface ComparisonModalProps {
  title: string;
  data: any;
  currentMortgagePayment: number;
  currentDebtPayment: number;
  onClose: () => void;
}

// Helper functions
function fmtMoney(n?: number) {
  if (n == null || !isFinite(n)) return "—";
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtPercent(n?: number) {
  if (n == null) return "—";
  return `${n.toFixed(3)}%`;
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
  maxWidth: 900,
  width: '100%',
  maxHeight: '90vh',
  overflow: 'auto',
  position: 'relative',
};

const modalHeader: React.CSSProperties = {
  background: '#5cb85c',
  color: '#fff',
  padding: '24px 32px',
  borderTopLeftRadius: 12,
  borderTopRightRadius: 12,
  position: 'relative',
};

const closeButton: React.CSSProperties = {
  position: 'absolute',
  top: 20,
  right: 20,
  width: 32,
  height: 32,
  border: 'none',
  borderRadius: '50%',
  background: 'rgba(255,255,255,0.2)',
  color: '#fff',
  fontSize: 20,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s',
};

const modalBody: React.CSSProperties = {
  padding: 32,
};

const benefitSummary: React.CSSProperties = {
  background: 'linear-gradient(135deg, #5cb85c 0%, #4cae4c 100%)',
  color: '#fff',
  padding: 24,
  borderRadius: 8,
  marginBottom: 24,
};

const comparisonGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: 16,
  marginBottom: 32,
};

const comparisonBox: React.CSSProperties = {
  background: '#f8f9fa',
  padding: 20,
  borderRadius: 8,
  textAlign: 'center',
};

export const ComparisonModal: React.FC<ComparisonModalProps> = ({
  title,
  data,
  currentMortgagePayment,
  currentDebtPayment,
  onClose,
}) => {
  const oldPayment = data.oldPayment || currentMortgagePayment + currentDebtPayment;
  const monthlySavings = (data as any).monthly || 0;
  const annualSavings = (data as any).annual || 0;
  const fiveYearSavings = (data as any).fiveYear || 0;

  return (
    <div style={modalOverlay} onClick={onClose}>
      <div style={modalContent} onClick={(e) => e.stopPropagation()}>
        <div style={modalHeader}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>
            Current vs. New Mortgage Comparison
          </h2>
          <div style={{ fontSize: 16, marginTop: 4, opacity: 0.95 }}>{title}</div>
          <button
            style={closeButton}
            onClick={onClose}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.3)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.2)")}
          >
            ✕
          </button>
        </div>
        
        <div style={modalBody}>
          {/* Benefit Summary */}
          {monthlySavings > 0 && (
            <div style={benefitSummary}>
              <h3 style={{ margin: "0 0 16px 0", fontSize: 18, fontWeight: 700 }}>
                BENEFIT SUMMARY
              </h3>
              <p style={{ margin: "0 0 16px 0", fontSize: 15, lineHeight: 1.6 }}>
                Combined mortgage {(data as any).rolledBalance ? "and credit card " : ""}
                monthly payment decreases by <strong>{fmtMoney(monthlySavings)}</strong>.
                {(data as any).rolledBalance && " Homeowner's credit card debt is eliminated."}
              </p>
              <div style={{ display: "flex", gap: 16, marginTop: 20 }}>
                <button
                  style={{
                    flex: 1,
                    padding: "10px 20px",
                    background: "rgba(255,255,255,0.2)",
                    color: "#fff",
                    border: "2px solid rgba(255,255,255,0.4)",
                    borderRadius: 4,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  View Details
                </button>
                <button
                  style={{
                    flex: 1,
                    padding: "10px 20px",
                    background: "#fff",
                    color: "#5cb85c",
                    border: "2px solid #fff",
                    borderRadius: 4,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Send to Homeowner
                </button>
              </div>
            </div>
          )}

          {/* Cash Out Info */}
          {(data as any).cashOut != null && (data as any).cashOut > 0 && (
            <div style={benefitSummary}>
              <h3 style={{ margin: "0 0 16px 0", fontSize: 18, fontWeight: 700 }}>
                BENEFIT SUMMARY
              </h3>
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6 }}>
                Leverage equity and maintain payment with{" "}
                <strong>{fmtMoney((data as any).cashOut)}</strong> cash out.
              </p>
            </div>
          )}

          {/* Comparison Boxes */}
          <div style={comparisonGrid}>
            <div style={comparisonBox}>
              <div style={{ fontSize: 12, color: "#6c757d", marginBottom: 8, fontWeight: 600 }}>
                Old Payment
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#212529" }}>
                {fmtMoney(oldPayment)}
              </div>
            </div>

            <div style={comparisonBox}>
              <div style={{ fontSize: 12, color: "#6c757d", marginBottom: 8, fontWeight: 600 }}>
                New Payment
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#212529" }}>
                {fmtMoney(data.newPayment)}
              </div>
            </div>

            <div style={{ ...comparisonBox, background: monthlySavings > 0 ? "#d4edda" : "#f8d7da" }}>
              <div style={{ fontSize: 12, color: "#6c757d", marginBottom: 8, fontWeight: 600 }}>
                Monthly Savings 💰
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, color: monthlySavings > 0 ? "#28a745" : "#dc3545" }}>
                {fmtMoney(Math.abs(monthlySavings))}
              </div>
            </div>

            <div style={comparisonBox}>
              <div style={{ fontSize: 12, color: "#6c757d", marginBottom: 8, fontWeight: 600 }}>
                Annual Savings ⭐⭐
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#212529" }}>
                {fmtMoney(Math.abs(annualSavings))}
              </div>
            </div>

            <div style={comparisonBox}>
              <div style={{ fontSize: 12, color: "#6c757d", marginBottom: 8, fontWeight: 600 }}>
                5 Year Savings ⭐⭐⭐
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#212529" }}>
                {fmtMoney(Math.abs(fiveYearSavings))}
              </div>
            </div>

            {(data as any).effectiveRatePct != null && (
              <div style={comparisonBox}>
                <div style={{ fontSize: 12, color: "#6c757d", marginBottom: 8, fontWeight: 600 }}>
                  Effective Interest Rate 💡
                </div>
                <div style={{ fontSize: 28, fontWeight: 700, color: "#212529" }}>
                  {(data as any).effectiveRatePct.toFixed(3)}%
                </div>
              </div>
            )}
          </div>

          {/* Detailed Breakdown */}
          <div style={{ marginTop: 32 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#2d4a4f", marginBottom: 16 }}>
              Detailed Breakdown
            </h3>
            <table style={{ width: "100%", fontSize: 14 }}>
              <tbody>
                <tr style={{ borderBottom: "1px solid #e9ecef" }}>
                  <td style={{ padding: "12px 0", color: "#6c757d" }}>New Loan Amount</td>
                  <td style={{ padding: "12px 0", textAlign: "right", fontWeight: 600 }}>
                    {fmtMoney(data.newBalance)}
                  </td>
                </tr>
                <tr style={{ borderBottom: "1px solid #e9ecef" }}>
                  <td style={{ padding: "12px 0", color: "#6c757d" }}>Interest Rate</td>
                  <td style={{ padding: "12px 0", textAlign: "right", fontWeight: 600 }}>
                    {fmtPercent(data.offerRatePct)}
                  </td>
                </tr>
                <tr style={{ borderBottom: "1px solid #e9ecef" }}>
                  <td style={{ padding: "12px 0", color: "#6c757d" }}>Term</td>
                  <td style={{ padding: "12px 0", textAlign: "right", fontWeight: 600 }}>
                    {(data as any).termYearsNew || (data as any).termYears || "—"} years
                  </td>
                </tr>
                {(data as any).rolledBalance != null && (
                  <tr style={{ borderBottom: "1px solid #e9ecef" }}>
                    <td style={{ padding: "12px 0", color: "#6c757d" }}>Debt Consolidated</td>
                    <td style={{ padding: "12px 0", textAlign: "right", fontWeight: 600 }}>
                      {fmtMoney((data as any).rolledBalance)}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonModal;