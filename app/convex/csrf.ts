/**
 * Origin protection for any future browser-facing state-changing HTTP action.
 * Convex mutations are invoked through the authenticated Convex client and do
 * not expose a generic cookie-backed POST endpoint; this guard is required
 * before adding custom HTTP mutations or webhooks that accept browser input.
 */
export function assertSameOrigin(request: Request, allowedOrigins: string[]) {
  const method = request.method.toUpperCase();
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') return;

  const origin = request.headers.get('Origin');
  if (!origin || !allowedOrigins.includes(origin)) {
    throw new Error('CSRF validation failed.');
  }
}

export function productionAllowedOrigins(siteUrl?: string) {
  return [siteUrl, 'https://menetap.com', 'https://www.menetap.com'].filter(
    (origin): origin is string => Boolean(origin),
  );
}
