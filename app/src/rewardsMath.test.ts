import { describe, expect, it } from 'vitest';
import { earnedPoints, nextExpiry, redemptionDiscount } from './rewardsMath';

describe('Rewards rules', () => {
  it('earns 10 points per Rp 10,000 at the approved rate', () => expect(earnedPoints(10000, 0.001)).toBe(10));
  it('rejects redemption above the available balance', () => expect(() => redemptionDiscount(101, 100, 100)).toThrow());
  it('returns the full discount and advances expiry by 12 months', () => { expect(redemptionDiscount(1000, 100, 1000)).toBe(100000); expect(nextExpiry(Date.UTC(2026, 0, 15), 12)).toBe(Date.UTC(2027, 0, 15)); });
});
