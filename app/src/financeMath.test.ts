import { describe, expect, it } from 'vitest';
import { commissionAmount, nextTransferStatus, shouldCalculateCommission } from './financeMath';

describe('payment pipeline rules', () => {
  it('calculates the default 10 percent commission', () => expect(commissionAmount(100000, 10)).toBe(10000));
  it('calculates a property override', () => expect(commissionAmount(100000, 12.5)).toBe(12500));
  it('guards against double calculation when a booking commission exists', () => { expect(shouldCalculateCommission(false)).toBe(true); expect(shouldCalculateCommission(true)).toBe(false); });
  it('maps transfer approval and rejection to real state transitions', () => { expect(nextTransferStatus('approve')).toEqual({ transfer: 'verified', payment: 'paid' }); expect(nextTransferStatus('reject')).toEqual({ transfer: 'rejected', payment: 'unpaid' }); });
});
