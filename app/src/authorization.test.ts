import { describe, expect, it } from 'vitest';
import { canManageBookings, canManagePayments, canManageProperties, canManageUsers } from '../convex/authorization';

describe('role authorization policy', () => {
  it('limits property operations to partner operations roles', () => {
    expect(canManageProperties('partner')).toBe(true);
    expect(canManageProperties('guest')).toBe(false);
  });
  it('keeps payments and users more restricted', () => {
    expect(canManagePayments('finance')).toBe(true);
    expect(canManagePayments('partner')).toBe(false);
    expect(canManageUsers('admin')).toBe(true);
    expect(canManageUsers('operations')).toBe(false);
  });
  it('allows support staff to manage bookings', () => {
    expect(canManageBookings('support')).toBe(true);
    expect(canManageBookings('guest')).toBe(false);
  });
});
