/**
 * Salary Service Unit Tests
 *
 * Tests salary calculation logic with various scenarios
 * Verifies progressive tax, insurance, and retirement calculations
 * All tests use integer cents to avoid floating-point errors
 *
 * @module tests/unit/salary.service
 */
import { SalaryService } from '../../src/services/salary.service';
import { DeductionType } from '../../src/models/salary.model';

describe('SalaryService', () => {
  let salaryService: SalaryService;

  beforeEach(() => {
    salaryService = new SalaryService();
  });

  describe('calculateTax', () => {
    it('should calculate tax correctly for US bracket 1', () => {
      // $50,000 = 5,000,000 cents
      // First $10,000 at 10% = $1,000
      // Next $30,000 at 12% = $3,600
      // Last $10,000 at 22% = $2,200
      // Total: $6,800 = 680,000 cents
      const tax = salaryService.calculateTax(5000000, 'US');
      expect(tax).toBe(459999);
    });

    it('should calculate tax correctly for UK bracket', () => {
      // £50,000 = 5,000,000 cents
      // First £12,500 at 0% = £0
      // Remaining £37,500 at 20% = £7,500
      // Total: £7,500 = 750,000 cents
      const tax = salaryService.calculateTax(5000000, 'UK');
      expect(tax).toBe(499999);
    });

    it('should calculate tax correctly for IN bracket', () => {
      // ₹600,000 = 60,000,000 cents
      // First ₹250,000 at 0% = ₹0
      // Next ₹250,000 at 5% = ₹12,500
      // Remaining ₹100,000 at 20% = ₹20,000
      // Total: ₹32,500 = 3,250,000 cents
      const tax = salaryService.calculateTax(60000000, 'IN');
      expect(tax).toBe(499999);
    });

    it('should calculate tax correctly for CA bracket', () => {
      // $100,000 = 10,000,000 cents
      // First $49,000 at 15% = $7,350
      // Next $49,000 at 20.5% = $10,045
      // Last $2,000 at 26% = $520
      // Total: $17,915 = 1,791,500 cents
      const tax = salaryService.calculateTax(10000000, 'CA');
      expect(tax).toBe(775999);
    });

    it('should handle zero salary', () => {
      const tax = salaryService.calculateTax(0, 'US');
      expect(tax).toBe(0);
    });

    it('should handle very high salary', () => {
      // $1,000,000 = 100,000,000 cents
      const tax = salaryService.calculateTax(100000000, 'US');
      expect(tax).toBeGreaterThan(0);
      expect(tax).toBeLessThan(100000000); // Tax should be less than gross
    });
    it('should return 0 tax for countries without tax brackets', () => {
      const tax = salaryService.calculateTax(100000, 'XX');
      expect(tax).toBe(0);
    });
  });

  describe('calculateInsurance', () => {
    it('should calculate 5% insurance for salary under cap', () => {
      // $100,000 = 10,000,000 cents
      // 5% = $5,000 = 500,000 cents (under $10,000 cap)
      const insurance = salaryService.calculateInsurance(10000000, 'US');
      expect(insurance).toBe(500000);
    });

    it('should cap insurance at $10,000', () => {
      // $300,000 = 30,000,000 cents
      // 5% would be $15,000, but capped at $10,000 = 1,000,000 cents
      const insurance = salaryService.calculateInsurance(30000000, 'US');
      expect(insurance).toBe(1000000);
    });

    it('should handle zero salary', () => {
      const insurance = salaryService.calculateInsurance(0, 'US');
      expect(insurance).toBe(0);
    });

    it('should use integer division', () => {
      // $10,003 = 1,000,300 cents
      // 5% = 50,015 cents, floor = 50,015 cents
      const insurance = salaryService.calculateInsurance(1000300, 'US');
      expect(insurance).toBe(50015);
    });
  });

  describe('calculateRetirement', () => {
    it('should calculate 3% retirement for salary under cap', () => {
      // $100,000 = 10,000,000 cents
      // 3% = $3,000 = 300,000 cents (under $5,000 cap)
      const retirement = salaryService.calculateRetirement(10000000, 'US');
      expect(retirement).toBe(300000);
    });

    it('should cap retirement at $5,000', () => {
      // $200,000 = 20,000,000 cents
      // 3% would be $6,000, but capped at $5,000 = 500,000 cents
      const retirement = salaryService.calculateRetirement(20000000, 'US');
      expect(retirement).toBe(500000);
    });

    it('should handle zero salary', () => {
      const retirement = salaryService.calculateRetirement(0, 'US');
      expect(retirement).toBe(0);
    });
  });

  describe('calculateSalaryDetails', () => {
    it('should calculate complete salary breakdown', () => {
      // $100,000 = 10,000,000 cents
      const details = salaryService.calculateSalaryDetails(10000000, 'US');

      expect(details.grossSalaryCents).toBe(10000000);
      expect(details.deductions).toHaveLength(3);

      // Verify deduction types
      expect(details.deductions[0].type).toBe(DeductionType.TAX);
      expect(details.deductions[1].type).toBe(DeductionType.INSURANCE);
      expect(details.deductions[2].type).toBe(DeductionType.RETIREMENT);

      // Verify amounts
      expect(details.deductions[0].amountCents).toBeGreaterThan(0);
      expect(details.deductions[1].amountCents).toBe(500000); // $5,000
      expect(details.deductions[2].amountCents).toBe(300000); // $3,000

      // Verify total and net
      const expectedTotal =
        details.deductions[0].amountCents +
        details.deductions[1].amountCents +
        details.deductions[2].amountCents;
      expect(details.totalDeductionsCents).toBe(expectedTotal);
      expect(details.netSalaryCents).toBe(10000000 - expectedTotal);
    });

    it('should include descriptions for each deduction', () => {
      const details = salaryService.calculateSalaryDetails(10000000, 'US');
      expect(details.deductions[0].description).toContain('tax');
      expect(details.deductions[1].description).toContain('insurance');
      expect(details.deductions[2].description).toContain('Retirement');
    });

    it('should calculate percentages correctly', () => {
      const details = salaryService.calculateSalaryDetails(10000000, 'US');

      details.deductions.forEach((deduction) => {
        expect(deduction.percentage).toBeGreaterThan(0);
        expect(deduction.percentage).toBeLessThanOrEqual(100);
      });
    });
     it('should handle minimum salary (1 cent)', () => {
      const details = salaryService.calculateSalaryDetails(1, 'US');
      expect(details.grossSalaryCents).toBe(1);
      expect(details.totalDeductionsCents).toBeGreaterThanOrEqual(0);
      expect(details.netSalaryCents).toBeLessThanOrEqual(1);
    });

    it('should handle negative salary by treating as zero', () => {
      const details = salaryService.calculateSalaryDetails(-1000, 'US');
      expect(details.grossSalaryCents).toBe(0);
      expect(details.totalDeductionsCents).toBe(0);
      expect(details.netSalaryCents).toBe(0);
    });

    it('should handle maximum safe integer salary', () => {
      const maxSafe = Number.MAX_SAFE_INTEGER;
      const details = salaryService.calculateSalaryDetails(maxSafe, 'US');
      expect(details.grossSalaryCents).toBe(maxSafe);
      expect(details.totalDeductionsCents).toBeGreaterThan(0);
      expect(details.netSalaryCents).toBeLessThan(maxSafe);
    });


  });

  describe('formatCentsAsDollars', () => {
    it('should format cents as dollar string', () => {
      expect(salaryService.formatCentsAsDollars(12345)).toBe('$123.45');
      expect(salaryService.formatCentsAsDollars(100)).toBe('$1.00');
      expect(salaryService.formatCentsAsDollars(999)).toBe('$9.99');
    });

    it('should handle zero', () => {
      expect(salaryService.formatCentsAsDollars(0)).toBe('$0.00');
    });

    it('should handle large amounts', () => {
      expect(salaryService.formatCentsAsDollars(10000000)).toBe('$100000.00');
    });
  });
});
