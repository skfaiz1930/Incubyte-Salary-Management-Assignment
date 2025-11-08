/**
 * Salary Domain Models
 *
 * Models for salary calculations, deductions, and metrics
 * All amounts are in integer cents to avoid floating-point errors
 *
 * @module models/salary
 */

import { CountryCode } from './employee.model';

/**
 * Types of salary deductions
 */
export enum DeductionType {
  TAX = 'TAX',
  INSURANCE = 'INSURANCE',
  RETIREMENT = 'RETIREMENT',
}

/**
 * Individual deduction detail
 */
export interface Deduction {
  type: DeductionType;
  amountCents: number;
  percentage: number;
  description: string;
}

/**
 * Complete salary breakdown
 */
export interface SalaryDetails {
  grossSalaryCents: number;
  deductions: Deduction[];
  totalDeductionsCents: number;
  netSalaryCents: number;
}

/**
 * Salary metrics by country
 */
export interface CountrySalaryMetrics {
  country: CountryCode;
  avgSalaryCents: number;
  minSalaryCents: number;
  maxSalaryCents: number;
  employeeCount: number;
}

/**
 * Salary metrics by job title
 */
export interface JobTitleSalaryMetrics {
  jobTitle: string;
  avgSalaryCents: number;
  minSalaryCents: number;
  maxSalaryCents: number;
  employeeCount: number;
}

/**
 * Tax bracket definition
 */
export interface TaxBracket {
  minCents: number;
  maxCents: number | null; // null = no upper limit
  rate: number; // as percentage (e.g., 15 = 15%)
}

/**
 * List of countries with tax deductions
 */
export const COUNTRIES_WITH_DEDUCTIONS = [] as CountryCode[];

/**
 * Default tax brackets for countries with no deductions
 */
export const NO_TAX_BRACKETS: TaxBracket[] = [
  { minCents: 0, maxCents: null, rate: 0 } // 0% tax for all income levels
];

/**
 * Country-specific tax brackets
 */
export const TAX_BRACKETS: Record<CountryCode, TaxBracket[]> = {
  US: [
    { minCents: 0, maxCents: 1000000, rate: 10 }, // $0 - $10,000: 10%
    { minCents: 1000001, maxCents: 4000000, rate: 12 }, // $10,001 - $40,000: 12%
    { minCents: 4000001, maxCents: 8500000, rate: 22 }, // $40,001 - $85,000: 22%
    { minCents: 8500001, maxCents: null, rate: 24 }, // $85,001+: 24%
  ],
  UK: [
    { minCents: 0, maxCents: 1250000, rate: 0 }, // £0 - £12,500: 0%
    { minCents: 1250001, maxCents: 5000000, rate: 20 }, // £12,501 - £50,000: 20%
    { minCents: 5000001, maxCents: null, rate: 40 }, // £50,001+: 40%
  ],
  IN: [
    { minCents: 0, maxCents: 25000000, rate: 0 }, // ₹0 - ₹250,000: 0%
    { minCents: 25000001, maxCents: 50000000, rate: 5 }, // ₹250,001 - ₹500,000: 5%
    { minCents: 50000001, maxCents: 100000000, rate: 20 }, // ₹500,001 - ₹1,000,000: 20%
    { minCents: 100000001, maxCents: null, rate: 30 }, // ₹1,000,001+: 30%
  ],
  CA: [
    { minCents: 0, maxCents: 4900000, rate: 15 }, // $0 - $49,000: 15%
    { minCents: 4900001, maxCents: 9800000, rate: 20.5 }, // $49,001 - $98,000: 20.5%
    { minCents: 9800001, maxCents: 15200000, rate: 26 }, // $98,001 - $152,000: 26%
    { minCents: 15200001, maxCents: null, rate: 29 }, // $152,001+: 29%
  ],
  XX: [],
};
// Function to check if a country has tax deductions
export const hasTaxDeductions = (country: string): boolean => {
  return country in TAX_BRACKETS;
};

// Function to get tax brackets for a country
export const getTaxBrackets = (country: CountryCode): readonly TaxBracket[] => {
  return TAX_BRACKETS[country] || [];
};
/**
 * Insurance rate as percentage
 * Applied uniformly across all countries
 */
export const INSURANCE_RATE = 5; // 5%

/**
 * Maximum annual insurance cap in cents
 */
export const INSURANCE_CAP_CENTS = 1000000; // $10,000

/**
 * Retirement contribution rate as percentage
 */
export const RETIREMENT_RATE = 3; // 3%

/**
 * Maximum annual retirement contribution in cents
 */
export const RETIREMENT_CAP_CENTS = 500000; // $5,000
