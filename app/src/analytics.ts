export type AnalyticsEvent =
  | 'landing_page_view'
  | 'search_start'
  | 'search_submit'
  | 'property_view'
  | 'room_selection'
  | 'checkout_start'
  | 'booking_complete'
  | 'cancellation_request'
  | 'support_request'
  | 'cta_click';

type SafeProperties = Record<string, string | number | boolean | undefined>;

const CONSENT_KEY = 'menetap.analytics.consent';

export function hasAnalyticsConsent() {
  return typeof window !== 'undefined' && window.localStorage.getItem(CONSENT_KEY) === 'granted';
}

export function setAnalyticsConsent(granted: boolean) {
  if (granted) window.localStorage.setItem(CONSENT_KEY, 'granted');
  else window.localStorage.removeItem(CONSENT_KEY);
}

export function track(event: AnalyticsEvent, properties: SafeProperties = {}) {
  const endpoint = import.meta.env.VITE_ANALYTICS_ENDPOINT;
  if (!endpoint || !hasAnalyticsConsent()) return;
  const payload = JSON.stringify({ event, properties, path: window.location.pathname, language: document.documentElement.lang, timestamp: new Date().toISOString() });
  try {
    if (navigator.sendBeacon) navigator.sendBeacon(endpoint, new Blob([payload], { type: 'application/json' }));
    else void fetch(endpoint, { method: 'POST', body: payload, headers: { 'content-type': 'application/json' }, keepalive: true });
  } catch { /* Analytics must never affect the guest journey. */ }
}
