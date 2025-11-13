import React from 'react';
import { Debt } from '../types';

// Helper function (inline to avoid import issues)
function fmtMoney(n?: number): string {
  if (n == null || !isFinite(n)) return "—";
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

interface DebtTableProps {
  debts: Debt[];
  onDebtsChange: (debts: Debt[]) => void;
  currentDebtPayment: number;
}

// Styles
const inputField: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid #dee2e6',
  borderRadius: 4,
  fontSize: 14,
  fontFamily: 'inherit',
  background: '#fff',
};

const debtTable: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse" as const,
};

const debtTh: React.CSSProperties = {
  textAlign: "left",
  padding: "10px 8px",
  fontSize: 12,
  fontWeight: 600,
  color: "#6c757d",
  borderBottom: "2px solid #dee2e6",
};

const debtTd: React.CSSProperties = {
  padding: "10px 8px",
  borderBottom: "1px solid #f1f3f5",
};

// Toggle Component
const Toggle: React.FC<{ checked: boolean; onChange: (v: boolean) => void }> = ({ checked, onChange }) => {
  const toggleSwitch: React.CSSProperties = {
    position: "relative",
    width: 48,
    height: 26,
    background: checked ? "#5cb85c" : "#dee2e6",
    borderRadius: 13,
    cursor: "pointer",
    transition: "background 0.3s",
  };

  const toggleKnob: React.CSSProperties = {
    position: "absolute",
    top: 3,
    left: 3,
    width: 20,
    height: 20,
    background: "#fff",
    borderRadius: "50%",
    transition: "transform 0.3s",
    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
    transform: checked ? "translateX(22px)" : "translateX(0)",
  };

  return (
    <div
      style={toggleSwitch}
      onClick={() => onChange(!checked)}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.05)";
        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div style={toggleKnob} />
    </div>
  );
};

export const DebtTable: React.FC<DebtTableProps> = ({ debts, onDebtsChange, currentDebtPayment }) => {
  const handleDebtChange = (index: number, field: 'balance' | 'minPayment', value: number) => {
    const newDebts = [...debts];
    newDebts[index] = { ...newDebts[index], [field]: value };
    onDebtsChange(newDebts);
  };

  const handleToggle = (index: number) => {
    const newDebts = [...debts];
    newDebts[index] = { ...newDebts[index], include: !newDebts[index].include };
    onDebtsChange(newDebts);
  };

  const totalDebtBalance = debts.filter(d => d.include).reduce((sum, d) => sum + d.balance, 0);

  return (
    <div>
      <table style={debtTable}>
        <thead>
          <tr>
            <th style={debtTh}>Credit Card Balances</th>
            <th style={debtTh}>Minimum Payment</th>
            <th style={debtTh}>To Be Paid Off</th>
          </tr>
        </thead>
        <tbody>
          {debts.map((debt, index) => (
            <tr key={index}>
              <td style={debtTd}>
                <input
                  type="number"
                  value={debt.balance}
                  onChange={(e) => handleDebtChange(index, 'balance', +e.target.value)}
                  style={{ ...inputField, padding: "10px 12px", fontSize: 14 }}
                />
              </td>
              <td style={debtTd}>
                <input
                  type="number"
                  value={debt.minPayment}
                  onChange={(e) => handleDebtChange(index, 'minPayment', +e.target.value)}
                  style={{ ...inputField, padding: "10px 12px", fontSize: 14 }}
                />
              </td>
              <td style={debtTd}>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <Toggle
                    checked={debt.include || false}
                    onChange={() => handleToggle(index)}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div style={{ marginTop: 24, display: 'flex', gap: 48, fontSize: 14, fontWeight: 700 }}>
        <div>
          <span style={{ fontWeight: 600 }}>Total Debt Balance:</span> {fmtMoney(totalDebtBalance)}
        </div>
        <div>
          <span style={{ fontWeight: 600 }}>Total Debt Monthly Payment:</span> {fmtMoney(currentDebtPayment)}
        </div>
      </div>
    </div>
  );
};

export default DebtTable;