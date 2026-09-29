import { describe, expect, it } from 'vitest';
import { rentalDatesWithinBooking, rentalTotal } from '../convex/rentalReservations';
describe('rental reservation invariants', () => {
  it('recomputes daily rate and selected surcharges', () => expect(rentalTotal(100000, '2026-10-01', '2026-10-03', 20000, 50000, true, true).total).toBe(290000));
  it('accepts only confirmed-stay dates within the one-day buffer', () => { expect(rentalDatesWithinBooking('2026-09-30', '2026-10-04', '2026-10-01', '2026-10-03')).toBe(true); expect(rentalDatesWithinBooking('2026-09-28', '2026-10-04', '2026-10-01', '2026-10-03')).toBe(false); });
});
