// src/finance.ts - FINAL CORRECTED VERSION with closing costs integrated
export const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
export const aprToMonthly = (apr: number) => apr / 12;
export const yearsToPeriods = (years: number) => Math.round(years * 12);
export const clampPos = (n: number, fallback = 0) => (isFinite(n) && n > 0 ? n : fallback);

// Round UP years (23.1 -> 24, 23.9 -> 24)
export const roundUpYears = (years: number) => Math.ceil(years);

// Convert decimal rate to percentage for display (0.0575 -> 5.75)
export const rateToPercent = (rate: number) => round2(rate * 100);

// Excel-like PMT/NPER/PV
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

export function pv_calc(rate: number, nper: number, pmtAmt: number, fv = 0, type = 0): number {
  if (rate === 0) return -(pmtAmt * nper + fv);
  const pvif = Math.pow(1 + rate, nper);
  return -(pmtAmt * (pvif - 1) / rate + fv) / pvif;
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

// Calculate preliminary loan (balance + closing costs)
export function calculateLoanAmounts(balance: number, closingCostRate: number = 0.03, additionalCash: number = 0) {
  const closingCosts = balance * closingCostRate;
  const preliminaryLoan = balance + closingCosts;
  const finalLoan = preliminaryLoan + additionalCash;
  return {
    closingCosts: round2(closingCosts),
    preliminaryLoan: round2(preliminaryLoan),
    finalLoan: round2(finalLoan),
  };
}

// ---- Scenarios ----

/**
 * Rate Reduction: Lower rate, same term
 * NO effective rate per Ken's request
 * INCLUDES 3% closing costs in loan amount
 */
export function scenarioRateReduction(
  newMortgageBalance: number,  // Ken wants this as input
  currentApr: number,
  currentTermYrs: number,
  offerRate: number,
  offerTerm: number
) {
  // Calculate closing costs and preliminary loan
  const { closingCosts, preliminaryLoan } = calculateLoanAmounts(newMortgageBalance, 0.03);
  
  // Calculate old payment based on current balance (without closing costs for comparison)
  const oldPay = currentPayment(newMortgageBalance, currentApr, currentTermYrs);
  
  // Calculate new payment based on preliminary loan (includes closing costs)
  const newPay = currentPayment(preliminaryLoan, offerRate, offerTerm);
  const sv = savings(oldPay, newPay);
  
  return {
    termYears: offerTerm,
    mortgageBalance: round2(newMortgageBalance),
    closingCosts: closingCosts,
    newBalance: preliminaryLoan,  // This is the actual loan amount
    offerRatePct: rateToPercent(offerRate),  // Display as percentage
    oldPayment: round2(oldPay),
    newPayment: round2(newPay),
    ...sv,
    // NO effectiveRatePct - removed per Ken's request
  };
}

/**
 * Term Reduction Same Payment: Keep payment, reduce term with lower rate
 * INCLUDES 3% closing costs in loan amount
 */
export function scenarioTermReductionSamePayment(
  newMortgageBalance: number,
  currentApr: number,
  currentTermYrs: number,
  offerRate: number
) {
  // Calculate closing costs and preliminary loan
  const { closingCosts, preliminaryLoan } = calculateLoanAmounts(newMortgageBalance, 0.03);
  
  const oldPay = currentPayment(newMortgageBalance, currentApr, currentTermYrs);
  
  // Lower rate by 0.25% (0.0025)
  const rateReduction = 0.0025;
  const adjustedOfferRate = offerRate - rateReduction;
  const rNew = aprToMonthly(adjustedOfferRate);
  
  // Calculate term with preliminary loan (includes closing costs)
  const nperNew = clampPos(nper(rNew, -oldPay, preliminaryLoan));
  const termYearsNew = roundUpYears(nperNew / 12);  // Round UP per Ken's requirement
  const newPay = Math.abs(pmt(rNew, nperNew, preliminaryLoan));
  const sv = savings(oldPay, newPay);
  
  return {
    termYearsNew,
    mortgageBalance: round2(newMortgageBalance),
    closingCosts: closingCosts,
    newBalance: preliminaryLoan,
    offerRatePct: rateToPercent(adjustedOfferRate),  // Display as percentage
    oldPayment: round2(oldPay),
    newPayment: round2(newPay),
    ...sv,
    effectiveRatePct: effectiveRateApprox(sv.fiveYear, preliminaryLoan),
  };
}

/**
 * Cash Out Same Payment: Extract equity while keeping payment the same
 * INCLUDES 3% closing costs in loan amount
 */
export function scenarioCashOutSamePayment(
  newMortgageBalance: number,
  currentApr: number,
  currentTermYrs: number,
  offerRate: number,
  offerTerm: number
) {
  // Calculate closing costs on the mortgage balance
  const { closingCosts, preliminaryLoan } = calculateLoanAmounts(newMortgageBalance, 0.03);
  
  const oldPay = currentPayment(newMortgageBalance, currentApr, currentTermYrs);
  
  // Use PV to calculate max loan with same payment
  const rNew = aprToMonthly(offerRate);
  const nNew = yearsToPeriods(offerTerm);
  const maxLoan = -pv_calc(rNew, nNew, oldPay);
  
  // Cash out is max loan minus the preliminary loan (balance + closing costs)
  const cashOut = maxLoan - preliminaryLoan;
  
  return {
    termYearsNew: offerTerm,
    mortgageBalance: round2(newMortgageBalance),
    closingCosts: closingCosts,
    newBalance: round2(maxLoan),
    offerRatePct: rateToPercent(offerRate),  // Display as percentage
    cashOut: round2(cashOut),
    oldPayment: round2(oldPay),
    newPayment: round2(oldPay), // Same payment
    monthly: 0,
    annual: 0,
    fiveYear: 0,
  };
}

/**
 * Debt Consolidation: Roll debts into mortgage
 * KEEP effective rate per Ken's request
 * INCLUDES 3% closing costs in loan amount
 */
export function scenarioDebtConsolidation(
  newMortgageBalance: number,
  currentApr: number,
  currentTermYrs: number,
  offerRate: number,
  offerTerm: number,
  debts: Debt[],
  mode: "sameTerm" | "samePayment" = "sameTerm"
) {
  const included = debts.filter(d => d.include);
  const rolled = included.reduce((s, d) => s + Math.max(d.balance, 0), 0);
  const droppedMins = included.reduce((s, d) => s + Math.max(d.minPayment, 0), 0);

  const oldMortgagePay = currentPayment(newMortgageBalance, currentApr, currentTermYrs);
  const oldTotalOutflow = oldMortgagePay + droppedMins;

  // Calculate closing costs on mortgage balance only (not on debts)
  const { closingCosts, preliminaryLoan } = calculateLoanAmounts(newMortgageBalance, 0.03);
  
  // Consolidated balance = preliminary loan + rolled debts
  const consolidatedBalance = preliminaryLoan + rolled;
  const rNew = aprToMonthly(offerRate);

  let newPay: number;
  let termYearsNew: number;

  if (mode === "samePayment") {
    // Keep the old mortgage payment, calculate new term
    const nperNew = clampPos(nper(rNew, -oldMortgagePay, consolidatedBalance));
    termYearsNew = roundUpYears(nperNew / 12);  // Round UP
    newPay = Math.abs(pmt(rNew, nperNew, consolidatedBalance));
  } else {
    // Keep the term, calculate new payment
    termYearsNew = offerTerm;
    newPay = currentPayment(consolidatedBalance, offerRate, offerTerm);
  }

  const newTotalOutflow = newPay;
  const monthly = round2(oldTotalOutflow - newTotalOutflow);

  return {
    mode,
    termYearsNew,
    mortgageBalance: round2(newMortgageBalance),
    closingCosts: closingCosts,
    newBalance: round2(consolidatedBalance),
    offerRatePct: rateToPercent(offerRate),  // Display as percentage
    rolledBalance: round2(rolled),
    droppedMinPayments: round2(droppedMins),
    oldMortgagePayment: round2(oldMortgagePay),
    oldTotalOutflow: round2(oldTotalOutflow),
    oldPayment: round2(oldTotalOutflow), // For consistency
    newMortgagePayment: round2(newPay),
    newTotalOutflow: round2(newTotalOutflow),
    newPayment: round2(newPay), // For consistency
    monthly: monthly,
    annual: round2(monthly * 12),
    fiveYear: round2(monthly * 60),
    effectiveRatePct: effectiveRateApprox(monthly * 60, consolidatedBalance), // KEEP this
  };
}

/**
 * Term Reduction: Shorter term (e.g., 15 years) with lower rate
 * INCLUDES 3% closing costs in loan amount
 */
export function scenarioTermReduction(
  newMortgageBalance: number,
  currentApr: number,
  currentTermYrs: number,
  offerRate: number,
  newTermYrs: number
) {
  // Calculate closing costs and preliminary loan
  const { closingCosts, preliminaryLoan } = calculateLoanAmounts(newMortgageBalance, 0.03);
  
  const oldPay = currentPayment(newMortgageBalance, currentApr, currentTermYrs);
  
  // Lower rate by 0.25% (0.0025)
  const rateReduction = 0.0025;
  const adjustedOfferRate = offerRate - rateReduction;
  
  // Calculate new payment with preliminary loan (includes closing costs)
  const newPay = currentPayment(preliminaryLoan, adjustedOfferRate, newTermYrs);
  const sv = savings(oldPay, newPay);
  
  return {
    termYearsNew: newTermYrs,
    mortgageBalance: round2(newMortgageBalance),
    closingCosts: closingCosts,
    newBalance: preliminaryLoan,
    offerRatePct: rateToPercent(adjustedOfferRate),  // Display as percentage
    oldPayment: round2(oldPay),
    newPayment: round2(newPay),
    ...sv,
    effectiveRatePct: effectiveRateApprox(sv.fiveYear, preliminaryLoan),
  };
}