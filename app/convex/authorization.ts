import type { UserRole } from './roles';
import type { MutationCtx, QueryCtx } from './_generated/server';
import { auth } from './auth';

export function canManageProperties(role: UserRole) { return role === 'partner' || role === 'operations' || role === 'admin'; }
export function canManageBookings(role: UserRole) { return role === 'partner' || role === 'support' || role === 'operations' || role === 'admin'; }
export function canManagePayments(role: UserRole) { return role === 'finance' || role === 'admin'; }
export function canManageUsers(role: UserRole) { return role === 'admin'; }

export async function getCurrentUser(ctx: QueryCtx | MutationCtx) {
  const userId = await auth.getUserId(ctx);
  return userId ? ctx.db.get(userId) : null;
}

export async function requireRole(ctx: QueryCtx | MutationCtx, allowedRoles: UserRole[]) {
  const user = await getCurrentUser(ctx);
  if (!user || user.status !== 'active' || !allowedRoles.includes(user.role)) {
    throw new Error('Not authorized');
  }
  return user;
}
