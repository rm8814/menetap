import type { UserRole } from './roles';

export function canManageProperties(role: UserRole) { return role === 'partner' || role === 'operations' || role === 'admin'; }
export function canManageBookings(role: UserRole) { return role === 'partner' || role === 'support' || role === 'operations' || role === 'admin'; }
export function canManagePayments(role: UserRole) { return role === 'finance' || role === 'admin'; }
export function canManageUsers(role: UserRole) { return role === 'admin'; }
