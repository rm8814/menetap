export const analyticsEvents = [
  'search_submitted', 'search_result_viewed', 'property_viewed',
  'room_selected', 'checkout_started', 'booking_created',
  'payment_method_selected', 'support_request_submitted',
] as const;

export type AnalyticsEvent = typeof analyticsEvents[number];

/** Privacy-safe event hook. Replace the console sink with an approved provider later. */
export function track(event: AnalyticsEvent, properties: Record<string, string | number | boolean> = {}) {
  const safeProperties = Object.fromEntries(Object.entries(properties).filter(([key]) => !/(email|phone|name|token|password|payment|card|booking|address|location)/i.test(key)));
  if (import.meta.env.DEV) console.info('[analytics]', event, safeProperties);
}

export function logClientError(error: unknown, context: Record<string, string> = {}) {
  const message = error instanceof Error ? error.message : 'Unknown client error';
  console.error('[client-error]', { message: message.slice(0, 500), ...Object.fromEntries(Object.entries(context).filter(([key]) => !/(email|phone|token|password|payment|card|booking|address|location)/i.test(key))) });
}
