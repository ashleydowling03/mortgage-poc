// types.ts - All TypeScript interfaces and types

export interface Debt {
  balance: number;
  minPayment: number;
  include?: boolean;
}

export interface SavedScenario {
  _id: string;                      // MongoDB uses _id, not id
  id?: string;                      // Optional for backwards compatibility
  name: string;
  date: string;
  leadId: string;
  clientName: string;
  propertyAddress: string;
  campaignDate: string;
  marketingProduct: string;
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
  createdAt: string;                // MongoDB timestamps
  updatedAt: string;                // MongoDB timestamps
}

export interface User {
  email: string;
  name: string;
}

export interface AmortizationRow {
  month: number;
  beginningBalance: number;
  payment: number;
  principal: number;
  interest: number;
  endingBalance: number;
  principalInterest: number;
}

export interface ScenarioData {
  termYears?: number;
  termYearsNew?: number;
  newBalance: number;
  offerRatePct: number;
  oldPayment: number;
  newPayment: number;
  monthly?: number;
  annual?: number;
  fiveYear?: number;
  effectiveRatePct?: number;
  cashOut?: number;
  rolledBalance?: number;
  droppedMinPayments?: number;
}

export interface ScenarioInfo {
  title: string;
  data: ScenarioData;
}

export type ScenarioKey = "cashOut" | "cashOutSamePay" | "termReduction" | "termReductionSamePay" | "rateReduction";