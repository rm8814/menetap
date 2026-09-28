import { describe, expect, it } from 'vitest';
import { buildNotificationTemplate, shouldSendNotification } from '../convex/notificationTemplates';

const booking = { reference: 'MNP-123', checkIn: '2026-10-01', checkOut: '2026-10-03', totalAmount: 200000, paymentMethod: 'manual_bank_transfer', guestName: 'Anin', status: 'confirmed', guestEmail: 'anin@example.com' };
describe('booking notification templates', () => {
  it('includes confirmation details', () => expect(buildNotificationTemplate({ type: 'booking_confirmation', notification: {}, booking, property: { name: 'Test Stay' } }).text).toContain('MNP-123'));
  it('includes bank instructions and rejection context', () => { expect(buildNotificationTemplate({ type: 'payment_instructions', notification: {}, booking, platformConfig: { bankName: 'Bank', bankAccountName: 'Menetap', bankAccountNumber: 'PENDING' } }).text).toContain('PENDING'); expect(buildNotificationTemplate({ type: 'transfer_rejected', notification: { contextNote: 'Amount mismatch' }, booking }).text).toContain('Amount mismatch'); });
  it('covers partner, cancellation, and resend-safe status inputs', () => { expect(buildNotificationTemplate({ type: 'partner_reservation', notification: {}, booking, property: { name: 'Test Stay' } }).subject).toContain('MNP-123'); expect(buildNotificationTemplate({ type: 'cancellation_update', notification: {}, booking: { ...booking, status: 'cancelled' } }).text).toContain('cancelled'); expect(shouldSendNotification('sent')).toBe(false); expect(shouldSendNotification('queued')).toBe(true); });
  it('keeps rejection context separate from transport errors', () => { const notification = { contextNote: 'Amount mismatch', error: undefined }; expect(notification.contextNote).toBe('Amount mismatch'); expect(notification.error).toBeUndefined(); });
});
