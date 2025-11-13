// utils.ts - Utility and helper functions

import { pmt, aprToMonthly, yearsToPeriods, round2 } from "./finance";
import { AmortizationRow, ScenarioData } from "./types";

// Formatting Functions
export function fmtMoney(n?: number): string {
  if (n == null || !isFinite(n)) return "—";
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function fmtPercent(n?: number): string {
  if (n == null) return "—";
  return `${n.toFixed(3)}%`;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

// Amortization Schedule Generation
export function generateAmortizationSchedule(
  principal: number,
  annualRate: number,
  termYears: number
): AmortizationRow[] {
  const monthlyRate = aprToMonthly(annualRate);
  const numPayments = yearsToPeriods(termYears);
  const monthlyPayment = Math.abs(pmt(monthlyRate, numPayments, principal));
  
  const schedule: AmortizationRow[] = [];
  let balance = principal;
  
  for (let month = 1; month <= numPayments; month++) {
    const interestPayment = balance * monthlyRate;
    const principalPayment = monthlyPayment - interestPayment;
    const newBalance = balance - principalPayment;
    
    schedule.push({
      month,
      beginningBalance: round2(balance),
      payment: round2(monthlyPayment),
      principal: round2(principalPayment),
      interest: round2(interestPayment),
      endingBalance: round2(Math.max(0, newBalance)),
      principalInterest: round2(interestPayment - principalPayment),
    });
    
    balance = newBalance;
    if (balance <= 0) break;
  }
  
  return schedule;
}

// Email Template Generation
export function generateEmailTemplate(
  scenario: string,
  clientName: string,
  propertyAddress: string,
  data: ScenarioData,
  oldPayment: number
): string {
  const monthlySavings = data.monthly || 0;
  const annualSavings = data.annual || 0;
  const fiveYearSavings = data.fiveYear || 0;
  const cashOut = data.cashOut || 0;
  
  let benefitText = "";
  
  if (scenario.includes("Cash Out")) {
    benefitText = cashOut > 0
      ? `Leverage equity and maintain payment with ${fmtMoney(cashOut)} cash out.`
      : `Combined mortgage and credit card monthly payment decreases by ${fmtMoney(monthlySavings)}. Over a 12 month period, you save as much as ${fmtMoney(annualSavings)} and over five years, save as much as ${fmtMoney(fiveYearSavings)}. Your credit card debt is eliminated.`;
  } else if (scenario.includes("Term Reduction")) {
    const months = scenario.includes("Same Payment") ? 16 : 180;
    benefitText = `Payoff mortgage ${months} months earlier while saving ${fmtMoney(fiveYearSavings)} in mortgage payments.`;
  } else {
    benefitText = `Reduce your mortgage rate and save ${fmtMoney(fiveYearSavings)} over five years.`;
  }
  
  const termYears = data.termYearsNew || data.termYears || "—";
  
  return `Outbound Refinance Offer Email to Homeowner

Prepared by: LO Name
Date & Time Stamp

Proposed Exclusively For: ${clientName}
Property Address: ${propertyAddress}

${scenario} Refinance Comparison Summary

You may be eligible to save as much as ${fmtMoney(annualSavings)} per year

${benefitText}

Call 1-800-234-5678 today to take advantage of these savings.

BENEFIT SUMMARY

Your Current Mortgage + Credit Card Payments
Monthly Mortgage Payment: ${fmtMoney(oldPayment)}

Your Refinance Mortgage + Credit Card Estimate
Monthly Mortgage Payment: ${fmtMoney(data.newPayment)}
Monthly Credit Card Payment: $0

Total Mortgage + Credit Card Payments: ${fmtMoney(data.newPayment)}

Monthly Savings: ${fmtMoney(monthlySavings)}
Annual Savings: ${fmtMoney(annualSavings)}
5-Year Savings: ${fmtMoney(fiveYearSavings)}

BENEFIT DETAILS

New Debt Payment: $0
New Mortgage Payment: ${fmtMoney(data.newPayment)}
New Loan Amount: ${fmtMoney(data.newBalance)}
Effective Interest Rate: ${fmtPercent(data.offerRatePct)}
Term: ${termYears} yr
${cashOut > 0 ? `Cash Out: ${fmtMoney(cashOut)}` : ""}`;
}