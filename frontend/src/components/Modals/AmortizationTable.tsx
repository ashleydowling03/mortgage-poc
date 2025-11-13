import React, { useMemo } from 'react';
import { AmortizationRow } from '../types';

interface AmortizationTableProps {
  loanAmount: number;
  rate: number;
  term: number;
  onClose: () => void;
}

// Helper functions
function fmtMoney(n?: number) {
  if (n == null || !isFinite(n)) return "—";
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Generate amortization schedule
function generateAmortizationSchedule(
  principal: number,
  annualRate: number,
  years: number
): AmortizationRow[] {
  const monthlyRate = annualRate / 100 / 12;
  const numPayments = years * 12;
  
  // Calculate monthly payment
  const monthlyPayment = 
    principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
    (Math.pow(1 + monthlyRate, numPayments) - 1);

  const schedule: AmortizationRow[] = [];
  let balance = principal;

  for (let month = 1; month <= numPayments; month++) {
    const interestPayment = balance * monthlyRate;
    const principalPayment = monthlyPayment - interestPayment;
    const endingBalance = balance - principalPayment;

    schedule.push({
      month,
      beginningBalance: balance,
      payment: monthlyPayment,
      principal: principalPayment,
      interest: interestPayment,
      endingBalance: Math.max(0, endingBalance),
      principalInterest: monthlyPayment,
    });

    balance = endingBalance;
  }

  return schedule;
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
  maxWidth: 1000,
  width: '100%',
  maxHeight: '90vh',
  display: 'flex',
  flexDirection: 'column',
};

const modalHeader: React.CSSProperties = {
  background: '#2d4a4f',
  color: '#fff',
  padding: '20px 24px',
  borderTopLeftRadius: 12,
  borderTopRightRadius: 12,
  position: 'relative',
  flexShrink: 0,
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

const tableContainer: React.CSSProperties = {
  overflow: 'auto',
  flex: 1,
  padding: '0 24px 24px',
};

const table: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: 13,
};

const th: React.CSSProperties = {
  position: 'sticky',
  top: 0,
  background: '#f8f9fa',
  padding: '12px 8px',
  textAlign: 'right',
  fontWeight: 600,
  color: '#495057',
  borderBottom: '2px solid #dee2e6',
  zIndex: 1,
};

const thFirst: React.CSSProperties = {
  ...th,
  textAlign: 'left',
};

const td: React.CSSProperties = {
  padding: '10px 8px',
  textAlign: 'right',
  borderBottom: '1px solid #f1f3f5',
};

const tdFirst: React.CSSProperties = {
  ...td,
  textAlign: 'left',
  fontWeight: 600,
};

export const AmortizationTable: React.FC<AmortizationTableProps> = ({
  loanAmount,
  rate,
  term,
  onClose,
}) => {
  const schedule = useMemo(() => {
    return generateAmortizationSchedule(loanAmount, rate, term);
  }, [loanAmount, rate, term]);

  const totalPaid = schedule.reduce((sum, row) => sum + row.payment, 0);
  const totalInterest = schedule.reduce((sum, row) => sum + row.interest, 0);

  return (
    <div style={modalOverlay} onClick={onClose}>
      <div style={modalContent} onClick={(e) => e.stopPropagation()}>
        <div style={modalHeader}>
          <h2 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700 }}>
            Amortization Schedule
          </h2>
          <div style={{ fontSize: 14, opacity: 0.9 }}>
            {fmtMoney(loanAmount)} at {rate.toFixed(3)}% for {term} years
          </div>
          <button
            style={closeButton}
            onClick={onClose}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.3)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.2)")}
          >
            ✕
          </button>
        </div>

        {/* Summary */}
        <div style={{ padding: '20px 24px', background: '#f8f9fa', borderBottom: '1px solid #dee2e6' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            <div>
              <div style={{ fontSize: 12, color: '#6c757d', marginBottom: 4 }}>Total Paid</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#2d4a4f' }}>
                {fmtMoney(totalPaid)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#6c757d', marginBottom: 4 }}>Total Interest</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#dc3545' }}>
                {fmtMoney(totalInterest)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#6c757d', marginBottom: 4 }}>Monthly Payment</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#2d4a4f' }}>
                {schedule.length > 0 ? fmtMoney(schedule[0].payment) : '—'}
              </div>
            </div>
          </div>
        </div>

        <div style={tableContainer}>
          <table style={table}>
            <thead>
              <tr>
                <th style={thFirst}>Month</th>
                <th style={th}>Beginning Balance</th>
                <th style={th}>Payment</th>
                <th style={th}>Principal</th>
                <th style={th}>Interest</th>
                <th style={th}>Ending Balance</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((row) => (
                <tr key={row.month} style={{
                  background: row.month % 12 === 0 ? '#f8f9fa' : 'transparent'
                }}>
                  <td style={tdFirst}>
                    {row.month}
                    {row.month % 12 === 0 && (
                      <span style={{ marginLeft: 8, color: '#6c757d', fontSize: 11 }}>
                        (Year {row.month / 12})
                      </span>
                    )}
                  </td>
                  <td style={td}>{fmtMoney(row.beginningBalance)}</td>
                  <td style={td}>{fmtMoney(row.payment)}</td>
                  <td style={td}>{fmtMoney(row.principal)}</td>
                  <td style={td}>{fmtMoney(row.interest)}</td>
                  <td style={td}>{fmtMoney(row.endingBalance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid #dee2e6',
          background: '#f8f9fa',
          borderBottomLeftRadius: 12,
          borderBottomRightRadius: 12,
          flexShrink: 0,
        }}>
          <button
            onClick={onClose}
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
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AmortizationTable;