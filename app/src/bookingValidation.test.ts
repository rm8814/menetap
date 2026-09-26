import { describe, expect, it } from 'vitest';
import { validateGuestBreakdown, validateMoney, validateStayDates } from '../convex/bookingValidation';

describe('booking edge-case validation', () => {
  it('rejects impossible dates and excessive stays', () => {
    expect(() => validateStayDates('2026-02-30', '2026-03-01')).toThrow();
    expect(() => validateStayDates('2026-01-01', '2026-04-10')).toThrow();
    expect(validateStayDates('2026-09-26', '2026-09-27')).toBe(1);
  });
  it('validates guest and child breakdowns', () => {
    expect(() => validateGuestBreakdown(2, [5, 7])).toThrow();
    expect(() => validateGuestBreakdown(2, [18])).toThrow();
    expect(() => validateGuestBreakdown(2, [5])).not.toThrow();
  });
  it('accepts only safe IDR amounts', () => {
    expect(() => validateMoney(890000, 'IDR')).not.toThrow();
    expect(() => validateMoney(-1, 'IDR')).toThrow();
    expect(() => validateMoney(890000, 'USD')).toThrow();
  });
});
