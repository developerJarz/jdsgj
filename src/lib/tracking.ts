/**
 * Client-side activity tracking. Events are sent with navigator.sendBeacon so
 * they never block navigation or rendering, and fail silently if blocked.
 * Server counterpart: app/api/track/route.ts. Admin view: /admin/activity.
 */

export type TrackEventType =
  | 'page_view'
  | 'product_view'
  | 'add_to_cart'
  | 'wishlist_add'
  | 'search'
  | 'checkout_start';

const SESSION_KEY = 'sg_sid';
const VISITOR_KEY = 'sg_vid';

function randomId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function getStoredId(storage: Storage | undefined, key: string) {
  try {
    if (!storage) return randomId();
    let id = storage.getItem(key);
    if (!id) {
      id = randomId();
      storage.setItem(key, id);
    }
    return id;
  } catch {
    return randomId();
  }
}

export function trackEvent(
  type: TrackEventType,
  data: { path?: string; productId?: string; productName?: string; query?: string; value?: number } = {}
) {
  if (typeof window === 'undefined') return;

  const payload = JSON.stringify({
    type,
    path: data.path ?? window.location.pathname + window.location.search,
    productId: data.productId,
    productName: data.productName,
    query: data.query,
    value: data.value,
    referrer: document.referrer || undefined,
    sessionId: getStoredId(window.sessionStorage, SESSION_KEY),
    visitorId: getStoredId(window.localStorage, VISITOR_KEY),
  });

  try {
    const blob = new Blob([payload], { type: 'application/json' });
    if (navigator.sendBeacon?.('/api/track', blob)) return;
  } catch {
    // fall through to fetch
  }

  fetch('/api/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: payload,
    keepalive: true,
  }).catch(() => {});
}
