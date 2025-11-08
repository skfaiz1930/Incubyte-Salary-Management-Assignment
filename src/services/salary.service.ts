/**
 * Salary Service
 *
 * Business logic for salary calculations and deductions
 * Implements progressive tax brackets, insurance, and retirement deductions
 * All calculations use integer cents to avoid floating-point precision errors
 *
 * @module services/salary
 */
import {
  SalaryDetails,
  Deduction,
  DeductionType,
  INSURANCE_RATE,
  INSURANCE_CAP_CENTS,
  RETIREMENT_RATE,
  RETIREMENT_CAP_CENTS,
  hasTaxDeductions,
  getTaxBrackets,

} from '../models/salary.model';
import { CountryCode } from '../models/employee.model';

export class SalaryService {
  /**
   * Calculate tax based on progressive tax brackets
   *
   * Applies country-specific tax brackets progressively
   * Each bracket only applies to income within that range
   *
   * @param grossSalaryCents - Gross annual salary in cents
   * @param country - Employee country for tax rules
   * @returns Tax amount in cents
   *
   * @example
   * // For US: $50,000 = 5,000,000 cents
   * // First $10,000 at 10% = $1,000
   * // Next $30,000 at 12% = $3,600
   * // Last $10,000 at 22% = $2,200
   * // Total tax = $6,800 = 680,000 cents
   * calculateTax(5000000, 'US'); // Returns 680000
   */
  calculateTax(grossSalaryCents: number, country: CountryCode): number {
    if (!hasTaxDeductions(country)) {
      return 0; // No tax for unsupported countries
    }
    
    const brackets = getTaxBrackets(country);
    let remainingSalaryCents = grossSalaryCents;
    let totalTaxCents = 0;

    for (const bracket of brackets) {
      // If salary hasn't reached this bracket, skip it
      if (remainingSalaryCents <= bracket.minCents) {
        continue;
      }

      // Calculate income in this bracket
      const bracketMinCents = bracket.minCents;
      const bracketMaxCents = bracket.maxCents ?? Infinity;

      // Amount of salary that falls in this bracket
      const salaryInBracketCents = Math.min(
        remainingSalaryCents - bracketMinCents,
        bracketMaxCents - bracketMinCents
      );
      // Tax on this bracket (using integer division)
      const bracketTaxCents = Math.floor((salaryInBracketCents * bracket.rate) / 100);
      totalTaxCents += bracketTaxCents;
        
      // Subtract the salary portion for this bracket
      remainingSalaryCents -= salaryInBracketCents;

    }

    return totalTaxCents;
  }

  /**
   * Calculate insurance deduction
   *
   * Insurance is a fixed percentage of gross salary with a cap
   * Rate: 5% of gross salary
   * Cap: $10,000 per year
   *
   * @param grossSalaryCents - Gross annual salary in cents
   * @returns Insurance deduction in cents
   *
   * @example
   * calculateInsurance(10000000); // $100,000 -> Returns 500000 ($5,000, 5%)
   * calculateInsurance(30000000); // $300,000 -> Returns 1000000 ($10,000, capped)
   */
  calculateInsurance(grossSalaryCents: number, country: CountryCode): number {
    if (!hasTaxDeductions(country)) {
      return 0; // No insurance for unsupported countries
    }
    const insuranceCents = Math.floor((grossSalaryCents * INSURANCE_RATE) / 100);
    return Math.min(insuranceCents, INSURANCE_CAP_CENTS);
  }

  /**
   * Calculate retirement contribution deduction
   *
   * Retirement is a fixed percentage of gross salary with a cap
   * Rate: 3% of gross salary
   * Cap: $5,000 per year
   *
   * @param grossSalaryCents - Gross annual salary in cents
   * @returns Retirement contribution in cents
   *
   * @example
   * calculateRetirement(10000000); // $100,000 -> Returns 300000 ($3,000, 3%)
   * calculateRetirement(20000000); // $200,000 -> Returns 500000 ($5,000, capped)
   */
  calculateRetirement(grossSalaryCents: number, country: CountryCode): number {
    if (!hasTaxDeductions(country)) {
      return 0; // No retirement for unsupported countries
    }
    const retirementCents = Math.floor((grossSalaryCents * RETIREMENT_RATE) / 100);
    return Math.min(retirementCents, RETIREMENT_CAP_CENTS);
  }

  /**
   * Calculate complete salary breakdown with all deductions
   *
   * Applies all deduction rules and returns detailed breakdown
   * All amounts are in integer cents
   *
   * @param grossSalaryCents - Gross annual salary in cents
   * @param country - Employee country for tax rules
   * @returns Complete salary details with deductions
   *
   * @example
   * const details = calculateSalaryDetails(10000000, 'US');
   * // Returns:
   * // {
   * //   grossSalaryCents: 10000000,
   * //   deductions: [
   * //     { type: 'TAX', amountCents: 1980000, percentage: 19.8, description: '...' },
   * //     { type: 'INSURANCE', amountCents: 500000, percentage: 5, description: '...' },
   * //     { type: 'RETIREMENT', amountCents: 300000, percentage: 3, description: '...' }
   * //   ],
   * //   totalDeductionsCents: 2780000,
   * //   netSalaryCents: 7220000
   * // }
   */
 calculateSalaryDetails(
  grossSalaryCents: number,
  country: CountryCode
): SalaryDetails {
  // Convert negative salary to 0
  const effectiveSalary = Math.max(0, grossSalaryCents);
  
  const tax = this.calculateTax(effectiveSalary, country);
  const insurance = this.calculateInsurance(effectiveSalary, country);
  const retirement = this.calculateRetirement(effectiveSalary, country);

  const totalDeductionsCents = tax + insurance + retirement;
  const netSalaryCents = effectiveSalary - totalDeductionsCents;

  const deductions: Deduction[] = [
    {
      type: DeductionType.TAX,
      amountCents: tax,
      percentage: effectiveSalary > 0 ? (tax / effectiveSalary) * 100 : 0,
      description: 'Progressive income tax based on tax brackets',
    },
    {
      type: DeductionType.INSURANCE,
      amountCents: insurance,
      percentage: effectiveSalary > 0 ? (insurance / effectiveSalary) * 100 : 0,
      description: 'Health insurance (5% of gross, max $10000/year)',
    },
    {
      type: DeductionType.RETIREMENT,
      amountCents: retirement,
      percentage: effectiveSalary > 0 ? (retirement / effectiveSalary) * 100 : 0,
      description: 'Retirement contribution (3% of gross, max $5000/year)',
    },
  ];

  return {
    grossSalaryCents: effectiveSalary,
    deductions,
    totalDeductionsCents,
    netSalaryCents,
  };
}

  /**
   * Convert cents to dollar string for display
   *
   * @param cents - Amount in cents
   * @returns Formatted dollar string
   *
   * @example
   * formatCentsAsDollars(12345); // Returns "$123.45"
   */
  formatCentsAsDollars(cents: number): string {
    if (isNaN(cents) || !isFinite(cents)) {
      return '$0.00';
    }
    const dollars = cents / 100;
    return `$${dollars.toFixed(2)}`;
  }
}
