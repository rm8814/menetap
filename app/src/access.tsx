import type { ReactNode } from 'react';
import type { UserRole } from '../convex/roles';

export function RoleGate({ role, allowed, children, fallback }: { role?: UserRole; allowed: UserRole[]; children: ReactNode; fallback?: ReactNode }) {
  return role && allowed.includes(role) ? children : fallback ?? <div className="empty-state"><h3>Access restricted</h3><p>Your account does not have permission to view this area.</p></div>;
}
