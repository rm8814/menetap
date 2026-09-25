import { ConvexAuthProvider } from '@convex-dev/auth/react';
import { ConvexReactClient } from 'convex/react';
import type { ReactNode } from 'react';

const convexUrl = import.meta.env.VITE_CONVEX_URL;
if (!convexUrl) throw new Error('VITE_CONVEX_URL is not configured.');
const convexClient = new ConvexReactClient(convexUrl);

export function MenetapConvexProvider({ children }: { children: ReactNode }) {
  return <ConvexAuthProvider client={convexClient}>{children}</ConvexAuthProvider>;
}
