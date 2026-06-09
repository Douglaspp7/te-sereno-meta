// Centralized funnel tracking: Meta Pixel + Google Analytics + UTMify + Supabase.
// Works only in the browser; no-ops on the server.

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;
type UtmKey = (typeof UTM_KEYS)[number];
export type UtmParams = Partial<Record<UtmKey, string>>;

const STORAGE_UTM = "mireto21:utm";
const STORAGE_SID = "mireto21:sid";

const META_CUSTOM_EVENTS = new Set([
  "QuizView", "QuizStart", "QuizComplete", "VSLView", "VSL75", "OfferView",
]);
const META_STANDARD_EVENTS: Record<string, string> = {
  InitiateCheckout: "InitiateCheckout",
  Purchase: "Purchase",
};
const GA_STANDARD_EVENTS: Record<string, string> = {
  InitiateCheckout: "begin_checkout",
  Purchase: "purchase",
};

function isBrowser() {
  return typeof window !== "undefined";
}

export function getSessionId(): string {
  if (!isBrowser()) return "";
  const existing = localStorage.getItem(STORAGE_SID);
  if (existing) return existing;
  const sid: string =
    (crypto as any)?.randomUUID?.() ??
    `sid_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
  localStorage.setItem(STORAGE_SID, sid);
  return sid;
}

export function captureUtmsFromUrl() {
  if (!isBrowser()) return;
  const params = new URLSearchParams(window.location.search);
  const stored: UtmParams = JSON.parse(localStorage.getItem(STORAGE_UTM) || "{}");
  let changed = false;
  for (const key of UTM_KEYS) {
    const v = params.get(key);
    if (v) {
      stored[key] = v;
      changed = true;
    }
  }
  if (changed) localStorage.setItem(STORAGE_UTM, JSON.stringify(stored));
}

export function getStoredUtms(): UtmParams {
  if (!isBrowser()) return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_UTM) || "{}");
  } catch {
    return {};
  }
}

export function clearStoredUtms() {
  if (!isBrowser()) return;
  localStorage.removeItem(STORAGE_UTM);
}

export type TrackEventName =
  | "QuizView"
  | "QuizStart"
  | "QuizComplete"
  | "VSLView"
  | "VSL75"
  | "OfferView"
  | "InitiateCheckout"
  | "Purchase";

export interface TrackOptions {
  /** Extra arbitrary data persisted in Supabase under `metadata`. */
  metadata?: Record<string, unknown>;
  /** Send to Meta even if not in our default map. Defaults: true. */
  meta?: boolean;
  /** Send to GA even if not in our default map. Defaults: true. */
  ga?: boolean;
  /** Send to UTMify. Defaults: true. */
  utmify?: boolean;
  /** Persist to Supabase. Defaults: true. */
  supabase?: boolean;
}

/**
 * Centralized event dispatcher. Fires the event to Meta Pixel, Google Analytics,
 * UTMify and Supabase simultaneously and logs everything to console for QA.
 */
export function trackEvent(event: TrackEventName, opts: TrackOptions = {}) {
  if (!isBrowser()) return;
  const utms = getStoredUtms();
  const sessionId = getSessionId();
  const payload = {
    event,
    session_id: sessionId,
    ...utms,
    ...(opts.metadata ?? {}),
  };

  // eslint-disable-next-line no-console
  console.log(`[trackEvent] ${event}`, payload);

  // --- Meta Pixel
  if (opts.meta !== false) {
    const fbq = (window as any).fbq;
    if (typeof fbq === "function") {
      try {
        if (META_STANDARD_EVENTS[event]) {
          fbq("track", META_STANDARD_EVENTS[event], opts.metadata ?? {});
        } else if (META_CUSTOM_EVENTS.has(event)) {
          fbq("trackCustom", event, payload);
        } else {
          fbq("trackCustom", event, payload);
        }
      } catch (e) {
        console.warn("[trackEvent] meta error", e);
      }
    }
  }

  // --- Google Analytics (gtag)
  if (opts.ga !== false) {
    const gtag = (window as any).gtag;
    if (typeof gtag === "function") {
      try {
        const gaName = GA_STANDARD_EVENTS[event] ?? event;
        gtag("event", gaName, payload);
      } catch (e) {
        console.warn("[trackEvent] ga error", e);
      }
    }
  }

  // --- UTMify
  if (opts.utmify !== false) {
    const w = window as any;
    try {
      if (typeof w.utmify === "function") {
        w.utmify("track", event, payload);
      } else if (w.utmifyQueue && typeof w.utmifyQueue.push === "function") {
        w.utmifyQueue.push(["track", event, payload]);
      } else {
        // Buffer for when UTMify finishes loading.
        w.utmifyQueue = w.utmifyQueue || [];
        w.utmifyQueue.push(["track", event, payload]);
      }
    } catch (e) {
      console.warn("[trackEvent] utmify error", e);
    }
  }

  // --- Supabase
  if (opts.supabase !== false) {
    try {
      const body = JSON.stringify({
        event_name: event,
        session_id: sessionId,
        utm_source: utms.utm_source ?? null,
        utm_medium: utms.utm_medium ?? null,
        utm_campaign: utms.utm_campaign ?? null,
        utm_content: utms.utm_content ?? null,
        utm_term: utms.utm_term ?? null,
        page_url: window.location.href,
        referrer: document.referrer || null,
        metadata: opts.metadata ?? null,
      });
      // Prefer sendBeacon so we don't lose the event on navigation (checkout).
      if (navigator.sendBeacon) {
        const blob = new Blob([body], { type: "application/json" });
        navigator.sendBeacon("/api/public/track", blob);
      } else {
        fetch("/api/public/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
          keepalive: true,
        }).catch(() => {});
      }
    } catch (e) {
      console.warn("[trackEvent] supabase error", e);
    }
  }
}
