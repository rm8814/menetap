import { useConvexAuth } from '@convex-dev/auth/react';
import { useQuery } from 'convex/react';
import type { ReactNode } from 'react';
import { api } from '../convex/_generated/api';
import type { UserRole } from '../convex/roles';

export function ProtectedScreen({ allowedRoles, children }: { allowedRoles: UserRole[]; children: ReactNode }) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const user = useQuery(api.users.current, isAuthenticated ? {} : 'skip');
  if (isLoading || (isAuthenticated && user === undefined)) return <div className="page centered"><p className="muted">Checking your access…</p></div>;
  if (!isAuthenticated || !user) return <div className="page centered"><h2>Sign in required</h2><p className="muted">Please sign in to continue.</p></div>;
  if (!allowedRoles.includes(user.role)) return <div className="page centered"><h2>Access restricted</h2><p className="muted">Your account does not have permission to view this area.</p></div>;
  return <>{children}</>;
}
