import { useMemo, useState, useEffect } from "react";
import {
  scenarioRateReduction,
  scenarioTermReductionSamePayment,
  scenarioCashOutSamePayment,
  scenarioDebtConsolidation,
  scenarioTermReduction,
  currentPayment,
  type Debt,
} from "./finance";
import { SavedScenario } from "./types";
import { SaveScenarioModal } from "./Modals";

// ==================== INTERFACES ====================
interface CalculatorProps {
  user: any;
  onLogout: () => void;
  loadedScenario?: SavedScenario | null;
  onBackToDashboard?: () => void;
}

// ==================== STYLES ====================
const pageContainer: React.CSSProperties = {
  minHeight: "100vh",
  background: "linear-gradient(to bottom, #2d4a4f 140px, #f5f5f5 140px)",
  fontFamily: "system-ui, -apple-system, sans-serif",
};

const topBar: React.CSSProperties = {
  background: "#2d4a4f",
  color: "#fff",
  padding: "20px 32px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};

const mainContent: React.CSSProperties = {
  maxWidth: 1600,
  margin: "0 auto",
  padding: "24px 32px",
  display: "grid",
  gridTemplateColumns: "1fr 400px",
  gap: 24,
};

const leftColumn: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 24,
};

const rightColumn: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 16,
};

const sectionCard: React.CSSProperties = {
  background: "#fff",
  borderRadius: 8,
  padding: 24,
  boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
};

const sectionTitle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 700,
  color: "#2d4a4f",
  marginBottom: 20,
  textTransform: "none",
};

const inputGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: 20,
};

const inputLabel: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: "#6c757d",
  marginBottom: 8,
  display: "block",
};

const inputField: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #dee2e6",
  borderRadius: 4,
  fontSize: 14,
  fontFamily: "inherit",
  background: "#fff",
};

const scenariosGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: 16,
};

const scenarioCard: React.CSSProperties = {
  background: "#5cb85c",
  borderRadius: 8,
  padding: 20,
  display: "flex",
  flexDirection: "column",
  gap: 10,
  color: "#fff",
};

const scenarioTitle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 700,
  marginBottom: 8,
  minHeight: 40,
  display: "flex",
  alignItems: "center",
};

const scenarioRow: React.CSSProperties = {
  background: "rgba(255,255,255,0.95)",
  padding: "8px 12px",
  borderRadius: 4,
  fontSize: 13,
  color: "#212529",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const scenarioLabel: React.CSSProperties = {
  fontWeight: 500,
  color: "#495057",
};

const scenarioValue: React.CSSProperties = {
  fontWeight: 700,
  color: "#212529",
};

const viewButton: React.CSSProperties = {
  width: "100%",
  padding: "10px",
  background: "rgba(255,255,255,0.95)",
  color: "#5cb85c",
  border: "none",
  borderRadius: 4,
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
  marginTop: 4,
  transition: "all 0.2s",
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

const toggleSwitch: React.CSSProperties = {
  position: "relative",
  width: 48,
  height: 26,
  background: "#dee2e6",
  borderRadius: 13,
  cursor: "pointer",
  transition: "background 0.3s",
};

const toggleSwitchActive: React.CSSProperties = {
  ...toggleSwitch,
  background: "#5cb85c",
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
};

const toggleKnobActive: React.CSSProperties = {
  ...toggleKnob,
  transform: "translateX(22px)",
};

const modalOverlay: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(0,0,0,0.7)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
  padding: 20,
};

const modalContent: React.CSSProperties = {
  background: "#fff",
  borderRadius: 12,
  maxWidth: 900,
  width: "100%",
  maxHeight: "90vh",
  overflow: "auto",
  position: "relative",
};

const modalHeader: React.CSSProperties = {
  background: "#5cb85c",
  color: "#fff",
  padding: "24px 32px",
  borderTopLeftRadius: 12,
  borderTopRightRadius: 12,
  position: "relative",
};

const closeButton: React.CSSProperties = {
  position: "absolute",
  top: 20,
  right: 20,
  width: 32,
  height: 32,
  border: "none",
  borderRadius: "50%",
  background: "rgba(255,255,255,0.2)",
  color: "#fff",
  fontSize: 20,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "all 0.2s",
};

const modalBody: React.CSSProperties = {
  padding: 32,
};

const benefitSummary: React.CSSProperties = {
  background: "linear-gradient(135deg, #5cb85c 0%, #4cae4c 100%)",
  color: "#fff",
  padding: 24,
  borderRadius: 8,
  marginBottom: 24,
};

const comparisonGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: 16,
  marginBottom: 32,
};

const comparisonBox: React.CSSProperties = {
  background: "#f8f9fa",
  padding: 20,
  borderRadius: 8,
  textAlign: "center",
};

// ==================== HELPER FUNCTIONS ====================
function fmtMoney(n?: number) {
  if (n == null || !isFinite(n)) return "—";
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtPercent(n?: number) {
  if (n == null) return "—";
  return `${n.toFixed(3)}%`;
}

// ==================== COMPONENTS ====================
function InputField({
  label,
  value,
  onChange,
  prefix,
  suffix,
  type = "number",
  step,
  disabled,
}: {
  label: string;
  value: any;
  onChange: (v: number) => void;
  prefix?: string;
  suffix?: string;
  type?: string;
  step?: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <label style={inputLabel}>{label}</label>
      <div style={{ position: "relative" }}>
        {prefix && (
          <span
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#6c757d",
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            {prefix}
          </span>
        )}
        <input
          type={type}
          step={step}
          value={value}
          onChange={(e) => onChange(+e.target.value)}
          onFocus={(e) => e.target.select()}
          disabled={disabled}
          style={{
            ...inputField,
            paddingLeft: prefix ? 28 : 12,
            paddingRight: suffix ? 40 : 12,
            background: disabled ? "#f8f9fa" : "#fff",
            color: disabled ? "#6c757d" : "#212529",
            fontWeight: disabled ? 600 : 400,
          }}
        />
        {suffix && (
          <span
            style={{
              position: "absolute",
              right: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#6c757d",
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

function ScenarioCard({
  title,
  data,
  onViewComparison,
}: {
  title: string;
  data: any;
  onViewComparison: () => void;
}) {
  return (
    <div style={scenarioCard}>
      <div style={scenarioTitle}>{title}</div>
      
      <div style={scenarioRow}>
        <span style={scenarioLabel}>New Loan Amount</span>
        <span style={scenarioValue}>{fmtMoney(data.newBalance)}</span>
      </div>
      
      <div style={scenarioRow}>
        <span style={scenarioLabel}>Rate</span>
        <span style={scenarioValue}>{fmtPercent(data.offerRatePct)}</span>
      </div>
      
      <div style={scenarioRow}>
        <span style={scenarioLabel}>Term</span>
        <span style={scenarioValue}>
          {(data as any).termYearsNew || (data as any).termYears || "—"} yr
        </span>
      </div>
      
      <div style={scenarioRow}>
        <span style={scenarioLabel}>New Payment</span>
        <span style={scenarioValue}>{fmtMoney(data.newPayment)}</span>
      </div>
      
      <div style={scenarioRow}>
        <span style={scenarioLabel}>Monthly Savings</span>
        <span style={{
          ...scenarioValue,
          color: (data as any).monthly > 0 ? "#28a745" : (data as any).monthly < 0 ? "#dc3545" : "#212529"
        }}>
          {(data as any).monthly != null ? fmtMoney(Math.abs((data as any).monthly)) : "—"}
        </span>
      </div>
      
      {(data as any).cashOut != null && (data as any).cashOut > 0 && (
        <div style={scenarioRow}>
          <span style={scenarioLabel}>Cash Out</span>
          <span style={scenarioValue}>{fmtMoney((data as any).cashOut)}</span>
        </div>
      )}
      
      <button style={viewButton} onClick={onViewComparison}>
        View Comparison
      </button>
    </div>
  );
}

function ComparisonModal({
  title,
  data,
  currentMortgagePayment,
  currentDebtPayment,
  onClose,
}: {
  title: string;
  data: any;
  currentMortgagePayment: number;
  currentDebtPayment: number;
  onClose: () => void;
}) {
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
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div
      style={checked ? toggleSwitchActive : toggleSwitch}
      onClick={() => onChange(!checked)}
    >
      <div style={checked ? toggleKnobActive : toggleKnob} />
    </div>
  );
}

// ==================== MAIN CALCULATOR ====================
export default function Calculator({ 
  user, 
  onLogout,
  loadedScenario,
  onBackToDashboard 
}: CalculatorProps) {
  // ===== STATE =====
  // Header fields
  const [leadId, setLeadId] = useState('#45678');
  const [campaignDate, setCampaignDate] = useState('03/09/2022');
  const [marketingProduct, setMarketingProduct] = useState('CONV Cash Out Consolidation');
  
  // Calculator fields
  const [mortgageBalance, setMortgageBalance] = useState(500000);
  const [closingCosts, setClosingCosts] = useState(20000);
  const [additionalCash, setAdditionalCash] = useState(0);
  const [offerRate, setOfferRate] = useState(5.75);
  const [offerTerm, setOfferTerm] = useState(30);
  const [currentApr, setCurrentApr] = useState(6.5);
  const [currentTerm, setCurrentTerm] = useState(30);
  const [estimatedMIP, setEstimatedMIP] = useState(0);
  const [estimatedMonthlyTaxes, setEstimatedMonthlyTaxes] = useState(0);
  const [estimatedMonthlyInsurance, setEstimatedMonthlyInsurance] = useState(0);
  
  // Debts
  const [debts, setDebts] = useState<Debt[]>([
    { balance: 5000, minPayment: 150, include: true },
    { balance: 10000, minPayment: 300, include: true },
    { balance: 4000, minPayment: 120, include: true },
  ]);
  
  // UI State
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);

  // ===== LOAD SCENARIO DATA =====
  useEffect(() => {
    if (loadedScenario) {
      // Header fields
      if (loadedScenario.leadId) setLeadId(loadedScenario.leadId);
      if (loadedScenario.campaignDate) setCampaignDate(loadedScenario.campaignDate);
      if (loadedScenario.marketingProduct) setMarketingProduct(loadedScenario.marketingProduct);
      
      // Calculator fields
      setMortgageBalance(loadedScenario.mortgageBalance);
      setClosingCosts(loadedScenario.closingCosts);
      setAdditionalCash(loadedScenario.additionalCash);
      setOfferRate(loadedScenario.offerRate);
      setOfferTerm(loadedScenario.offerTerm);
      setCurrentApr(loadedScenario.currentApr);
      setCurrentTerm(loadedScenario.currentTerm);
      setDebts(loadedScenario.debts);
      setEstimatedMIP(loadedScenario.estimatedMIP);
      setEstimatedMonthlyTaxes(loadedScenario.estimatedMonthlyTaxes);
      setEstimatedMonthlyInsurance(loadedScenario.estimatedMonthlyInsurance);
    }
  }, [loadedScenario]);

  // ===== COMPUTED VALUES =====
  // NOTE: Don't add closingCosts here - finance.ts functions calculate them internally
  const newMortgageBalance = mortgageBalance + additionalCash;
  const currentMortgagePayment = currentPayment(mortgageBalance, currentApr / 100, currentTerm);
  const currentDebtPayment = debts
    .filter((d) => d.include)
    .reduce((s, d) => s + Math.max(d.minPayment, 0), 0);

  // ===== SCENARIOS =====
  const cashOut = useMemo(() => {
    const base = scenarioCashOutSamePayment(
      newMortgageBalance,
      currentApr / 100,
      currentTerm,
      offerRate / 100,
      offerTerm
    );
    return { ...base, cashOut: base.cashOut + additionalCash };
  }, [newMortgageBalance, currentApr, currentTerm, offerRate, offerTerm, additionalCash]);

  const cashOutSamePay = useMemo(
    () =>
      scenarioCashOutSamePayment(
        newMortgageBalance,
        currentApr / 100,
        currentTerm,
        offerRate / 100,
        offerTerm
      ),
    [newMortgageBalance, currentApr, currentTerm, offerRate, offerTerm]
  );

  const termReduction = useMemo(
    () =>
      scenarioTermReduction(
        newMortgageBalance,
        currentApr / 100,
        currentTerm,
        offerRate / 100,
        15
      ),
    [newMortgageBalance, currentApr, currentTerm, offerRate]
  );

  const termReductionSamePay = useMemo(
    () =>
      scenarioTermReductionSamePayment(
        newMortgageBalance,
        currentApr / 100,
        currentTerm,
        offerRate / 100
      ),
    [newMortgageBalance, currentApr, currentTerm, offerRate]
  );

  const rateReduction = useMemo(
    () =>
      scenarioRateReduction(
        newMortgageBalance,
        currentApr / 100,
        currentTerm,
        offerRate / 100,
        offerTerm
      ),
    [newMortgageBalance, currentApr, currentTerm, offerRate, offerTerm]
  );

  const scenarios = {
    cashOut,
    cashOutSamePay,
    termReduction,
    termReductionSamePay,
    rateReduction,
  };

  const debtConsolidation = useMemo(
    () =>
      scenarioDebtConsolidation(
        newMortgageBalance,
        currentApr / 100,
        currentTerm,
        offerRate / 100,
        offerTerm,
        debts,
        "sameTerm"
      ),
    [newMortgageBalance, currentApr, currentTerm, offerRate, offerTerm, debts]
  );

  const debtConsolidationSamePay = useMemo(
    () =>
      scenarioDebtConsolidation(
        newMortgageBalance,
        currentApr / 100,
        currentTerm,
        offerRate / 100,
        offerTerm,
        debts,
        "samePayment"
      ),
    [newMortgageBalance, currentApr, currentTerm, offerRate, offerTerm, debts]
  );

  const handleDebtChange = (index: number, field: 'balance' | 'minPayment', value: number) => {
    const newDebts = [...debts];
    newDebts[index] = { ...newDebts[index], [field]: value };
    setDebts(newDebts);
  };

  const handleToggle = (index: number) => {
    const newDebts = [...debts];
    newDebts[index] = { ...newDebts[index], include: !newDebts[index].include };
    setDebts(newDebts);
  };

  const getScenarioData = (key: string) => {
    switch (key) {
      case "cashOut": return cashOut;
      case "cashOutSamePay": return cashOutSamePay;
      case "termReduction": return termReduction;
      case "termReductionSamePay": return termReductionSamePay;
      case "rateReduction": return rateReduction;
      case "debtConsolidation": return debtConsolidation;
      case "debtConsolidationSamePay": return debtConsolidationSamePay;
      default: return null;
    }
  };

  const totalDebtBalance = debts.filter(d => d.include).reduce((sum, d) => sum + d.balance, 0);

  // ==================== RENDER ====================
  return (
    <div style={pageContainer}>
      {/* Top Bar */}
      <div style={topBar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              style={{
                padding: '8px 16px',
                background: 'rgba(255,255,255,0.1)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            >
              ← Dashboard
            </button>
          )}
          
          <div style={{ fontSize: 28, fontWeight: 700 }}>loansure</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Save Button */}
          <button
            onClick={() => setShowSaveModal(true)}
            style={{
              padding: '10px 20px',
              background: '#5cb85c',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#4cae4c'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#5cb85c'}
          >
            💾 Save Scenario
          </button>

          {/* View Saved Button */}
          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              style={{
                padding: '10px 20px',
                background: 'rgba(255,255,255,0.1)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            >
              📊 View Saved
            </button>
          )}

          {/* Calculator Link */}
          <div style={{ color: '#fff', fontSize: 14 }}>Calculator</div>

          {/* User Info */}
          <div style={{ color: '#fff', fontSize: 14 }}>{user?.name || 'User'}</div>

          {/* Logout */}
          <button
            onClick={onLogout}
            style={{
              padding: '8px 16px',
              background: '#dc3545',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#c82333'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#dc3545'}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Header Info - EDITABLE */}
      <div style={{
        background: '#f8f9fa',
        padding: '16px 32px',
        borderBottom: '1px solid #dee2e6',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 24,
        fontSize: 13,
        color: '#495057',
      }}>
        {/* Lead ID - Editable */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label style={{ fontWeight: 600, minWidth: 60 }}>Lead ID:</label>
          <input
            type="text"
            value={leadId}
            onChange={(e) => setLeadId(e.target.value)}
            style={{
              flex: 1,
              padding: '6px 10px',
              border: '1px solid #dee2e6',
              borderRadius: 4,
              fontSize: 13,
              fontFamily: 'inherit',
              background: '#fff',
            }}
            placeholder="e.g., #45678"
          />
        </div>

        {/* Campaign Date - Editable */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label style={{ fontWeight: 600, minWidth: 110 }}>Campaign Date:</label>
          <input
            type="text"
            value={campaignDate}
            onChange={(e) => setCampaignDate(e.target.value)}
            style={{
              flex: 1,
              padding: '6px 10px',
              border: '1px solid #dee2e6',
              borderRadius: 4,
              fontSize: 13,
              fontFamily: 'inherit',
              background: '#fff',
            }}
            placeholder="MM/DD/YYYY"
          />
        </div>

        {/* Marketing Product - Editable */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label style={{ fontWeight: 600, minWidth: 165 }}>Marketing Product Offer:</label>
          <input
            type="text"
            value={marketingProduct}
            onChange={(e) => setMarketingProduct(e.target.value)}
            style={{
              flex: 1,
              padding: '6px 10px',
              border: '1px solid #dee2e6',
              borderRadius: 4,
              fontSize: 13,
              fontFamily: 'inherit',
              background: '#fff',
            }}
            placeholder="e.g., CONV Cash Out Consolidation"
          />
        </div>
      </div>

      {/* Main Content */}
      <div style={mainContent}>
        {/* Left Column */}
        <div style={leftColumn}>
          {/* Refinance Variables */}
          <div style={sectionCard}>
            <div style={sectionTitle}>Refinance Variables</div>
            <div style={inputGrid}>
              <InputField
                label="Mortgage Balance"
                value={mortgageBalance}
                onChange={setMortgageBalance}
                prefix="$"
              />
              <InputField
                label="Closing Costs"
                value={closingCosts}
                onChange={setClosingCosts}
                prefix="$"
              />
              <InputField
                label="Additional Cash Requested"
                value={additionalCash}
                onChange={setAdditionalCash}
                prefix="$"
              />
              <InputField
                label="Offer Rate"
                value={offerRate}
                onChange={setOfferRate}
                suffix="%"
                step="0.001"
              />
              <InputField
                label="Offer Term (Years)"
                value={offerTerm}
                onChange={setOfferTerm}
                suffix="yr"
              />
              <InputField
                label="Current APR"
                value={currentApr}
                onChange={setCurrentApr}
                suffix="%"
                step="0.001"
              />
              <InputField
                label="Current Term (Years)"
                value={currentTerm}
                onChange={setCurrentTerm}
                suffix="yr"
              />
              <InputField
                label="New Mortgage Balance"
                value={newMortgageBalance}
                onChange={() => {}}
                prefix="$"
                disabled
              />
            </div>
          </div>

          {/* Debt Consolidation */}
          <div style={sectionCard}>
            <div style={sectionTitle}>Credit Card Debt Consolidation</div>
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

          {/* Scenarios */}
          <div style={sectionCard}>
            <div style={sectionTitle}>Available Scenarios</div>
            <div style={scenariosGrid}>
              <ScenarioCard
                title="Rate Reduction"
                data={rateReduction}
                onViewComparison={() => setSelectedScenario("rateReduction")}
              />
              <ScenarioCard
                title="Term Reduction (15yr)"
                data={termReduction}
                onViewComparison={() => setSelectedScenario("termReduction")}
              />
              <ScenarioCard
                title="Term Reduction Same Payment"
                data={termReductionSamePay}
                onViewComparison={() => setSelectedScenario("termReductionSamePay")}
              />
              <ScenarioCard
                title="Cash Out Same Payment"
                data={cashOutSamePay}
                onViewComparison={() => setSelectedScenario("cashOutSamePay")}
              />
              <ScenarioCard
                title="Debt Consolidation"
                data={debtConsolidation}
                onViewComparison={() => setSelectedScenario("debtConsolidation")}
              />
              <ScenarioCard
                title="Debt Consolidation Same Payment"
                data={debtConsolidationSamePay}
                onViewComparison={() => setSelectedScenario("debtConsolidationSamePay")}
              />
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div style={rightColumn}>
          {/* Current Mortgage Info */}
          <div style={sectionCard}>
            <div style={sectionTitle}>CURRENT MORTGAGE ESTIMATED INTEREST RATE, TAXES & INSURANCE</div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: "#6c757d", marginBottom: 8 }}>
                ESTIMATED INTEREST RATE
              </div>
              <div style={{
                background: "#5cb85c",
                color: "#fff",
                padding: 16,
                borderRadius: 6,
                fontSize: 32,
                fontWeight: 700,
                textAlign: "center",
              }}>
                {currentApr.toFixed(2)}%
              </div>
            </div>
            
            <InputField
              label="ESTIMATED M/P (Mortgage Insurance Premium)"
              value={estimatedMIP}
              onChange={setEstimatedMIP}
              prefix="$"
            />
            <div style={{ height: 16 }} />
            <InputField
              label="ESTIMATED MONTHLY TAXES"
              value={estimatedMonthlyTaxes}
              onChange={setEstimatedMonthlyTaxes}
              prefix="$"
            />
            <div style={{ height: 16 }} />
            <InputField
              label="ESTIMATED MONTHLY INSURANCE"
              value={estimatedMonthlyInsurance}
              onChange={setEstimatedMonthlyInsurance}
              prefix="$"
            />
          </div>
        </div>
      </div>

      {/* Comparison Modal */}
      {selectedScenario && (
        <ComparisonModal
          title={selectedScenario}
          data={getScenarioData(selectedScenario)}
          currentMortgagePayment={currentMortgagePayment}
          currentDebtPayment={currentDebtPayment}
          onClose={() => setSelectedScenario(null)}
        />
      )}

      {/* Save Scenario Modal */}
      {showSaveModal && (
        <SaveScenarioModal
          mortgageBalance={mortgageBalance}
          closingCosts={closingCosts}
          additionalCash={additionalCash}
          offerRate={offerRate}
          offerTerm={offerTerm}
          currentApr={currentApr}
          currentTerm={currentTerm}
          debts={debts}
          estimatedMIP={estimatedMIP}
          estimatedMonthlyTaxes={estimatedMonthlyTaxes}
          estimatedMonthlyInsurance={estimatedMonthlyInsurance}
          onClose={() => setShowSaveModal(false)}
          onSuccess={() => {
            setShowSaveModal(false);
            alert('Scenario saved successfully!');
          }}
        />
      )}
    </div>
  );
}