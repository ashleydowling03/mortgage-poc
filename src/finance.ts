// src/finance.ts
export const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
export const aprToMonthly = (apr: number) => apr / 12;
export const yearsToPeriods = (years: number) => Math.round(years * 12);
export const clampPos = (n: number, fallback = 0) => (isFinite(n) && n > 0 ? n : fallback);

// Excel-like PMT/NPER
export function pmt(rate: number, nper: number, pv: number, fv = 0, type = 0): number {
  if (rate === 0) return -(pv + fv) / nper;
  const pvif = Math.pow(1 + rate, nper);
  let p = (rate * (pv * pvif + fv)) / (pvif - 1);
  if (type === 1) p /= (1 + rate);
  return -p; // Excel sign convention
}

export function nper(rate: number, pmtAmt: number, pv: number, fv = 0, type = 0): number {
  if (rate === 0) return -(pv + fv) / pmtAmt;
  if (type === 1) pmtAmt *= (1 + rate);
  return Math.log((pmtAmt - rate * fv) / (pmtAmt + rate * pv)) / Math.log(1 + rate);
}

export type Debt = { balance: number; minPayment: number; include?: boolean };

export function currentPayment(balance: number, apr: number, termYears: number) {
  const r = aprToMonthly(apr);
  const n = yearsToPeriods(termYears);
  return Math.abs(pmt(r, n, balance));
}

export function savings(oldPay: number, newPay: number) {
  const monthly = round2(oldPay - newPay);
  return { monthly, annual: round2(monthly * 12), fiveYear: round2(monthly * 60) };
}

export function effectiveRateApprox(fiveYearSavings: number, newBalance: number) {
  return round2((fiveYearSavings / Math.max(newBalance, 1)) * 100);
}

// ---- Scenarios ----
export function scenarioRateReduction(
  balance: number, currentApr: number, currentTermYrs: number, newApr: number
) {
  const oldPay = currentPayment(balance, currentApr, currentTermYrs);
  const newPay = currentPayment(balance, newApr, currentTermYrs);
  const sv = savings(oldPay, newPay);
  return {
    termYears: currentTermYrs,
    newBalance: round2(balance),
    oldPayment: round2(oldPay),
    newPayment: round2(newPay),
    ...sv,
    effectiveRatePct: effectiveRateApprox(sv.fiveYear, balance),
  };
}

export function scenarioTermReductionSamePayment(
  balance: number, currentApr: number, currentTermYrs: number, newApr: number
) {
  const oldPay = currentPayment(balance, currentApr, currentTermYrs);
  const rNew = aprToMonthly(newApr);
  const nperNew = clampPos(nper(rNew, -oldPay, balance));
  const termYearsNew = round2(nperNew / 12);
  const newPay = Math.abs(pmt(rNew, nperNew, balance));
  const sv = savings(oldPay, newPay);
  return {
    termYearsNew, newBalance: round2(balance),
    oldPayment: round2(oldPay), newPayment: round2(newPay),
    ...sv, effectiveRatePct: effectiveRateApprox(sv.fiveYear, balance),
  };
}

export function scenarioCashOutSamePayment(
  balance: number, cashOut: number, currentApr: number, currentTermYrs: number, newApr: number
) {
  const oldPay = currentPayment(balance, currentApr, currentTermYrs);
  const newBalance = balance + Math.max(cashOut, 0);
  const rNew = aprToMonthly(newApr);
  const nperNew = clampPos(nper(rNew, -oldPay, newBalance));
  const termYearsNew = round2(nperNew / 12);
  const newPay = Math.abs(pmt(rNew, nperNew, newBalance));
  const sv = savings(oldPay, newPay);
  return {
    termYearsNew, newBalance: round2(newBalance), cashOut: round2(cashOut),
    oldPayment: round2(oldPay), newPayment: round2(newPay),
    ...sv, effectiveRatePct: effectiveRateApprox(sv.fiveYear, newBalance),
  };
}

export function scenarioDebtConsolidation(
  balance: number, currentApr: number, currentTermYrs: number, newApr: number,
  debts: Debt[], mode: "sameTerm" | "samePayment" = "sameTerm"
) {
  const included = debts.filter(d => d.include);
  const rolled = included.reduce((s, d) => s + Math.max(d.balance, 0), 0);
  const droppedMins = included.reduce((s, d) => s + Math.max(d.minPayment, 0), 0);

  const oldMortgagePay = currentPayment(balance, currentApr, currentTermYrs);
  const oldTotalOutflow = oldMortgagePay + droppedMins;

  const newBalance = balance + rolled;
  const rNew = aprToMonthly(newApr);

  let newPay: number;
  let termYearsNew: number;

  if (mode === "samePayment") {
    const nperNew = clampPos(nper(rNew, -oldMortgagePay, newBalance));
    termYearsNew = round2(nperNew / 12);
    newPay = Math.abs(pmt(rNew, nperNew, newBalance));
  } else {
    termYearsNew = currentTermYrs;
    newPay = currentPayment(newBalance, newApr, currentTermYrs);
  }

  const newTotalOutflow = newPay;
  const monthly = round2(oldTotalOutflow - newTotalOutflow);

  return {
    mode, termYearsNew,
    newBalance: round2(newBalance),
    rolledBalance: round2(rolled),
    droppedMinPayments: round2(droppedMins),
    oldMortgagePayment: round2(oldMortgagePay),
    oldTotalOutflow: round2(oldTotalOutflow),
    newMortgagePayment: round2(newPay),
    newTotalOutflow: round2(newTotalOutflow),
    monthlySavings: monthly,
    annualSavings: round2(monthly * 12),
    fiveYearSavings: round2(monthly * 60),
    effectiveRatePct: effectiveRateApprox(monthly * 60, newBalance),
  };
}

export function scenarioTermReduction(
  balance: number, currentApr: number, currentTermYrs: number, newApr: number, newTermYrs: number
) {
  const oldPay = currentPayment(balance, currentApr, currentTermYrs);
  const newPay = currentPayment(balance, newApr, newTermYrs);
  const sv = savings(oldPay, newPay);
  return {
    termYearsNew: newTermYrs, newBalance: round2(balance),
    oldPayment: round2(oldPay), newPayment: round2(newPay),
    ...sv, effectiveRatePct: effectiveRateApprox(sv.fiveYear, balance),
  };
}