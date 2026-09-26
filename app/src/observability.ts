export const analyticsEvents = [
  'search_submitted', 'search_result_viewed', 'property_viewed',
  'room_selected', 'checkout_started', 'booking_created',
  'payment_method_selected', 'support_request_submitted',
] as const;

export type AnalyticsEvent = typeof analyticsEvents[number];

/** Privacy-safe event hook. Replace the console sink with an approved provider later. */
export function track(event: AnalyticsEvent, properties: Record<string, string | number | boolean> = {}) {
  if (import.meta.env.DEV) console.info('[analytics]', event, properties);
}

export function logClientError(error: unknown, context: Record<string, string> = {}) {
  const message = error instanceof Error ? error.message : 'Unknown client error';
  console.error('[client-error]', { message, ...context });
}
