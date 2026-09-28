export function commissionAmount(total: number, ratePercent: number) { return total * ratePercent / 100; }
export function shouldCalculateCommission(existing: boolean) { return !existing; }
export function nextTransferStatus(decision: 'approve' | 'reject') { return decision === 'approve' ? { transfer: 'verified', payment: 'paid' } : { transfer: 'rejected', payment: 'unpaid' }; }
