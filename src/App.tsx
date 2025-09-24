import { useMemo, useState } from "react";
import {
  scenarioRateReduction,
  scenarioTermReductionSamePayment,
  scenarioCashOutSamePayment,
  scenarioDebtConsolidation,
  scenarioTermReduction,
  type Debt,
} from "./finance";

// ---------- Inline Styles ----------
const container: React.CSSProperties = {
  maxWidth: 1100,
  margin: "40px auto",
  padding: "0 20px",
  fontFamily: "ui-sans-serif, system-ui",
};
const header: React.CSSProperties = {
  marginBottom: 16,
  borderBottom: "1px solid #eee",
  paddingBottom: 10,
};
const card: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #eee",
  borderRadius: 16,
  padding: 20,
  margin: "16px 0",
  boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
};
const grid2: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 16,
};
const grid3: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: 16,
};
const tableBase: React.CSSProperties = {
  width: "100%",
  borderCollapse: "separate",
  borderSpacing: 8,
};
const btn: React.CSSProperties = {
  marginTop: 16,
  padding: "10px 16px",
  borderRadius: 10,
  border: "1px solid #ddd",
  background: "#0f172a",
  color: "#fff",
  cursor: "pointer",
};

// ---------- Small UI Primitives ----------
function L({ label, children }: { label: string; children: any }) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span style={{ fontSize: 12, opacity: 0.8 }}>{label}</span>
      {children}
    </label>
  );
}

function I({
  value,
  onChange,
  type = "number",
  step,
}: {
  value: any;
  onChange: (n: number) => void;
  type?: string;
  step?: string;
}) {
  return (
    <input
      type={type}
      step={step}
      value={value}
      onChange={(e) => onChange(+e.target.value)}
      style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #ddd" }}
    />
  );
}

function Scenario({ title, d }: { title: string; d: any }) {
  return (
    <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 14 }}>
      <div style={{ fontWeight: 700, marginBottom: 8 }}>{title}</div>
      <Row k="Old Payment" v={fmtMoney(d.oldPayment)} />
      <Row k="New Payment" v={fmtMoney(d.newPayment)} />
      {"monthly" in d && <Row k="Monthly Savings" v={fmtMoney(d.monthly)} />}
      {"annual" in d && <Row k="Annual Savings" v={fmtMoney(d.annual)} />}
      {"fiveYear" in d && <Row k="5-Year Savings" v={fmtMoney(d.fiveYear)} />}
      {"effectiveRatePct" in d && (
        <Row k="Effective Rate (~)" v={d.effectiveRatePct != null ? `${d.effectiveRatePct}%` : "—"} />
      )}
      {"termYearsNew" in d && <Row k="New Term (yrs)" v={d.termYearsNew ?? "—"} />}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string | number }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 14 }}>
      <span style={{ opacity: 0.8 }}>{k}</span>
      <span style={{ fontWeight: 600 }}>{v}</span>
    </div>
  );
}

function fmtMoney(n?: number) {
  if (n == null || !isFinite(n)) return "—";
  return `$${n.toLocaleString()}`;
}

// ---------- Print-only Summary Table ----------
function PrintSummaryTable({
  rows,
}: {
  rows: Array<{
    name: string;
    oldPayment?: number;
    newPayment?: number;
    monthly?: number;
    annual?: number;
    fiveYear?: number;
    effectiveRatePct?: number;
    termYearsNew?: number;
  }>;
}) {
  return (
    <div className="print-only" style={{ display: "none" }}>
      <table className="print-summary">
        <thead>
          <tr>
            <th style={{ width: "22%" }}>Scenario</th>
            <th>Old Payment</th>
            <th>New Payment</th>
            <th>Monthly Savings</th>
            <th>Annual Savings</th>
            <th>5-Year Savings</th>
            <th>Effective Rate (~)</th>
            <th>New Term (yrs)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.name}>
              <td><strong>{r.name}</strong></td>
              <td>{fmtMoney(r.oldPayment)}</td>
              <td>{fmtMoney(r.newPayment)}</td>
              <td>{fmtMoney(r.monthly)}</td>
              <td>{fmtMoney(r.annual)}</td>
              <td>{fmtMoney(r.fiveYear)}</td>
              <td>{r.effectiveRatePct != null ? `${r.effectiveRatePct}%` : "—"}</td>
              <td>{r.termYearsNew != null ? r.termYearsNew : "—"}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={8}>Estimates only. For illustration; subject to lender approval.</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

// ---------- Main ----------
export default function App() {
  // Inputs
  const [balance, setBalance] = useState(350000);
  const [currentApr, setCurrentApr] = useState(0.065);
  const [currentTerm, setCurrentTerm] = useState(30);
  const [newApr, setNewApr] = useState(0.055);
  const [cashOut, setCashOut] = useState(0);

  const [debts, setDebts] = useState<Debt[]>([
    { balance: 5000, minPayment: 150, include: true },
    { balance: 10000, minPayment: 300, include: false },
    { balance: 15000, minPayment: 250, include: true },
  ]);

  // Scenarios
  const rateRed = useMemo(
    () => scenarioRateReduction(balance, currentApr, currentTerm, newApr),
    [balance, currentApr, currentTerm, newApr]
  );
  const termSamePay = useMemo(
    () => scenarioTermReductionSamePayment(balance, currentApr, currentTerm, newApr),
    [balance, currentApr, currentTerm, newApr]
  );
  const cashSamePay = useMemo(
    () => scenarioCashOutSamePayment(balance, cashOut, currentApr, currentTerm, newApr),
    [balance, cashOut, currentApr, currentTerm, newApr]
  );
  const debtSameTerm = useMemo(
    () => scenarioDebtConsolidation(balance, currentApr, currentTerm, newApr, debts, "sameTerm"),
    [balance, currentApr, currentTerm, newApr, debts]
  );
  const debtSamePay = useMemo(
    () => scenarioDebtConsolidation(balance, currentApr, currentTerm, newApr, debts, "samePayment"),
    [balance, currentApr, currentTerm, newApr, debts]
  );
  const termReduced = useMemo(
    () => scenarioTermReduction(balance, currentApr, currentTerm, newApr, 20),
    [balance, currentApr, currentTerm, newApr]
  );

  return (
    <div style={container}>
      {/* Print-only header (hidden on screen) */}
      <div className="print-header" style={{ display: "none", textAlign: "center", marginBottom: 12 }}>
        <h1 style={{ fontSize: 22, margin: 0 }}>Custom Benefits Analysis</h1>
        <p style={{ margin: 0, opacity: 0.85 }}>
          Prepared for: Client Name • {new Date().toLocaleDateString()}
        </p>
        <p style={{ margin: 0, opacity: 0.85 }}>Prepared by: Your Company / Contact</p>
      </div>

      {/* Screen header */}
      <header style={header}>
        <h1 style={{ margin: 0 }}>Custom Benefits Calculator (POC)</h1>
        <p style={{ opacity: 0.7, marginTop: 4 }}>Clean, simple MVP for Ken</p>
      </header>

      {/* Inputs */}
      <section style={card}>
        <h2>Inputs</h2>
        <div style={grid2}>
          <L label="Current Balance"><I value={balance} onChange={setBalance} /></L>
          <L label="Current APR (e.g. 0.065)"><I step="0.0001" value={currentApr} onChange={setCurrentApr} /></L>
          <L label="Current Term (years)"><I value={currentTerm} onChange={setCurrentTerm} /></L>
          <L label="Offer APR (e.g. 0.055)"><I step="0.0001" value={newApr} onChange={setNewApr} /></L>
          <L label="Cash Out (for Cash-Out scenario)"><I value={cashOut} onChange={setCashOut} /></L>
        </div>
      </section>

      {/* Debts */}
      <section style={card}>
        <h2>Debts (for Consolidation)</h2>
        <table style={tableBase}>
          <thead><tr><th>Include</th><th>Balance</th><th>Min Payment</th></tr></thead>
          <tbody>
            {debts.map((d, i) => (
              <tr key={i}>
                <td>
                  <input
                    type="checkbox"
                    checked={!!d.include}
                    onChange={(e) => {
                      const copy = [...debts];
                      copy[i] = { ...d, include: e.target.checked };
                      setDebts(copy);
                    }}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={d.balance}
                    onChange={(e) => {
                      const copy = [...debts];
                      copy[i] = { ...d, balance: +e.target.value };
                      setDebts(copy);
                    }}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={d.minPayment}
                    onChange={(e) => {
                      const copy = [...debts];
                      copy[i] = { ...d, minPayment: +e.target.value };
                      setDebts(copy);
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Scenarios (screen view) */}
      <section style={card}>
        <h2>Scenario Summary</h2>
        <div style={grid3}>
          <Scenario title="Rate Reduction" d={rateRed} />
          <Scenario title="Term Reduction — Same Payment" d={termSamePay} />
          <Scenario title="Cash-Out — Same Payment" d={cashSamePay} />
          <Scenario title="Debt Consolidation — Same Term" d={debtSameTerm} />
          <Scenario title="Debt Consolidation — Same Payment" d={debtSamePay} />
          <Scenario title="Term Reduction (20yr)" d={termReduced} />
        </div>

        {/* Screen-only export button */}
        <button style={btn} className="screen-only" onClick={() => window.print()}>
          Export to PDF
        </button>
      </section>

      {/* PRINT-ONLY TABLE (outside sections so it's never hidden) */}
      <PrintSummaryTable
        rows={[
          { name: "Rate Reduction", ...rateRed },
          { name: "Term Reduction — Same Payment", ...termSamePay },
          { name: "Cash-Out — Same Payment", ...cashSamePay },
          { name: "Debt Consolidation — Same Term", ...debtSameTerm },
          { name: "Debt Consolidation — Same Payment", ...debtSamePay },
          { name: "Term Reduction (20yr)", ...termReduced },
        ]}
      />
    </div>
  );
}

