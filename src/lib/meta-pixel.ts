import { META_PIXEL_HOST, META_PIXEL_ID } from "./meta-pixel-config";

export const MARKETING_CONSENT_KEY = "chulimaar.marketing-consent.v1";
export const CONSENT_CHANGE_EVENT = "chulimaar:marketing-consent";
export type MarketingConsent = "accepted" | "declined" | null;
type PixelFunction = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[][];
  push: PixelFunction;
  loaded: boolean;
  version: string;
};
declare global {
  interface Window { fbq?: PixelFunction; _fbq?: PixelFunction }
}
let memoryConsent: MarketingConsent = null;
let storageBlocked = false;
let initialized = false;
let lastPage: string | null = null;
const sentConversions = new Set<string>();
const sentViews = new Set<string>();

export function readMarketingConsent(): MarketingConsent {
  if (typeof window === "undefined") return null;
  if (storageBlocked) return memoryConsent;
  try {
    const saved = window.localStorage.getItem(MARKETING_CONSENT_KEY);
    return saved === "accepted" || saved === "declined" ? saved : null;
  } catch { return memoryConsent; }
}
export function subscribeMarketingConsent(listener: () => void) {
  window.addEventListener("storage", listener);
  window.addEventListener(CONSENT_CHANGE_EVENT, listener);
  return () => { window.removeEventListener("storage", listener); window.removeEventListener(CONSENT_CHANGE_EVENT, listener); };
}
export function saveMarketingConsent(choice: Exclude<MarketingConsent, null>) {
  memoryConsent = choice;
  try { window.localStorage.setItem(MARKETING_CONSENT_KEY, choice); storageBlocked = false; } catch { storageBlocked = true; }
  if (choice === "declined") revokePixelConsent();
  window.dispatchEvent(new Event(CONSENT_CHANGE_EVENT));
}

/** Never allow the SDK on admin, private removal links, previews or form-data URLs. */
export function isTrackablePage(location: Pick<Location, "protocol" | "hostname" | "pathname" | "search">) {
  if (location.protocol !== "https:" || location.hostname !== META_PIXEL_HOST || location.pathname !== "/") return false;
  return ![...new URLSearchParams(location.search).keys()].some(key => /token|email|phone|password|secret|first.?name|last.?name|city|auth|session/i.test(key));
}
function canTrack() {
  return typeof window !== "undefined" && /^\d{5,25}$/.test(META_PIXEL_ID) && readMarketingConsent() === "accepted" && isTrackablePage(window.location);
}
function pixel() {
  if (!canTrack()) return null;
  if (!window.fbq) {
    const queue = ((...args: unknown[]) => { if (queue.callMethod) queue.callMethod(...args); else queue.queue.push(args); }) as PixelFunction;
    queue.queue = []; queue.push = queue; queue.loaded = true; queue.version = "2.0";
    window.fbq = queue;
    window._fbq ??= queue;
  }
  const fbq = window.fbq;
  fbq("consent", "grant");
  if (!initialized) {
    // Explicit events only. Do not scrape form fields or enable advanced matching.
    fbq("set", "autoConfig", false, META_PIXEL_ID);
    fbq("init", META_PIXEL_ID);
    initialized = true;
  }
  if (!document.getElementById("chulimaar-meta-pixel")) {
    const script = document.createElement("script");
    script.id = "chulimaar-meta-pixel"; script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    script.referrerPolicy = "strict-origin-when-cross-origin";
    script.onerror = () => script.remove(); // A blocker never interrupts signup.
    document.head.appendChild(script);
  }
  return fbq;
}
export function revokePixelConsent() {
  if (typeof window === "undefined") return;
  lastPage = null;
  try { window.fbq?.("consent", "revoke"); } catch { /* Tracking must not break the visitor's choice. */ }
  for (const name of ["_fbp", "_fbc"]) {
    try {
      document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax; Secure`;
      document.cookie = `${name}=; Max-Age=0; Path=/; Domain=${window.location.hostname}; SameSite=Lax; Secure`;
    } catch { /* Some browsers block all cookie access. */ }
  }
}
function sendEvent(event: "PageView" | "ViewContent" | "Lead", parameters?: Record<string, string>, options?: { eventID: string }) {
  try {
    const fbq = pixel();
    if (!fbq) return false;
    fbq("trackSingle", META_PIXEL_ID, event, ...(parameters ? [parameters] : []), ...(options ? [options] : []));
    return true;
  } catch { return false; } // Advertising failures must never interrupt signup.
}
export function trackPageView() {
  if (!canTrack()) return;
  const page = window.location.origin + window.location.pathname + window.location.search;
  if (lastPage === page) return;
  if (sendEvent("PageView")) lastPage = page;
}
export function trackProductView() {
  if (sentViews.has("oil")) return;
  if (sendEvent("ViewContent", { content_name: "Chulimaar apricot kernel oil", content_category: "Cooking oil" })) sentViews.add("oil");
}
export function isNewLead(result: { ok: boolean; conversionEventId?: string }) {
  return result.ok && /^[a-f0-9]{32}$/.test(result.conversionEventId || "");
}
export function trackLaunchLead(result: { ok: boolean; conversionEventId?: string }) {
  if (!isNewLead(result) || sentConversions.has(result.conversionEventId!)) return;
  if (sendEvent("Lead", { content_name: "Chulimaar launch updates" }, { eventID: result.conversionEventId! })) sentConversions.add(result.conversionEventId!);
}
