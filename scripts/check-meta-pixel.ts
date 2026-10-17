/** Deterministic browser API fakes; no browser, Meta requests or customer data. */
import assert from "node:assert/strict";

async function main() {
  const tracking = await import("../src/lib/meta-pixel");
  const consent = new Map<string, string>();
  const scripts = new Map<string, { id: string; src: string }>();
  const cookies: string[] = [];
  const events = new EventTarget();
  const location = { protocol: "https:", hostname: "deepskyblue-dove-264491.hostingersite.com", pathname: "/", search: "?utm_source=facebook&fbclid=test-click", origin: "https://deepskyblue-dove-264491.hostingersite.com" };
  const fakeWindow = { location, localStorage: { getItem: (key: string) => consent.get(key) ?? null, setItem: (key: string, value: string) => { consent.set(key, value); } }, addEventListener: events.addEventListener.bind(events), removeEventListener: events.removeEventListener.bind(events), dispatchEvent: events.dispatchEvent.bind(events) };
  const fakeDocument = { getElementById: (id: string) => scripts.get(id), createElement: () => ({ id: "", src: "", remove() { scripts.delete(this.id); } }), head: { appendChild: (script: { id: string; src: string }) => scripts.set(script.id, script) }, set cookie(value: string) { cookies.push(value); } };
  const savedWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const savedDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
  Object.defineProperty(globalThis, "window", { configurable: true, value: fakeWindow });
  Object.defineProperty(globalThis, "document", { configurable: true, value: fakeDocument });
  try {
    assert(tracking.isTrackablePage(location));
    assert(!tracking.isTrackablePage({ ...location, pathname: "/admin/website" }));
    assert(!tracking.isTrackablePage({ ...location, pathname: "/launch-preferences", search: "?token=private" }));
    assert(!tracking.isTrackablePage({ ...location, hostname: "127.0.0.1" }));
    assert(!tracking.isTrackablePage({ ...location, protocol: "http:" }));
    for (const key of ["token", "EMAIL", "firstName", "city", "auth", "password"]) assert(!tracking.isTrackablePage({ ...location, search: `?${key}=private` }));
    assert.equal(tracking.readMarketingConsent(), null);
    tracking.trackPageView();
    assert.equal(scripts.size, 0, "No advertising SDK before consent.");
    tracking.saveMarketingConsent("declined");
    tracking.trackPageView();
    assert.equal(scripts.size, 0, "A rejection must not load Meta.");
    tracking.saveMarketingConsent("accepted");
    tracking.trackPageView(); tracking.trackPageView();
    assert.equal(scripts.size, 1);
    assert.equal([...scripts.values()][0].src, "https://connect.facebook.net/en_US/fbevents.js");
    const queue = window.fbq!.queue;
    const count = (event: string) => queue.filter(command => command[0] === "trackSingle" && command[2] === event).length;
    assert.equal(count("PageView"), 1, "Hydration and hash navigation must not duplicate a page view.");
    assert(queue.some(command => command[0] === "set" && command[1] === "autoConfig" && command[2] === false));
    tracking.trackProductView(); tracking.trackProductView();
    assert.equal(count("ViewContent"), 1);
    tracking.trackLaunchLead({ ok: false, conversionEventId: "a".repeat(32) });
    tracking.trackLaunchLead({ ok: true });
    assert.equal(count("Lead"), 0, "Failed and existing signups are not new leads.");
    const signup = { ok: true, conversionEventId: "b".repeat(32), removalToken: "private-removal-secret", values: { email: "private@example.invalid", firstName: "Private", city: "Private city" } };
    tracking.trackLaunchLead(signup); tracking.trackLaunchLead(signup);
    assert.equal(count("Lead"), 1, "Repeated React effects must not duplicate a conversion.");
    assert(!JSON.stringify(queue).includes("private"), "Form values and removal credentials must never reach Meta.");
    tracking.saveMarketingConsent("declined");
    tracking.trackLaunchLead({ ok: true, conversionEventId: "c".repeat(32) });
    tracking.trackPageView();
    assert.equal(count("Lead"), 1);
    assert.equal(count("PageView"), 1);
    assert(queue.some(command => command[0] === "consent" && command[1] === "revoke"));
    assert(cookies.some(cookie => cookie.startsWith("_fbp=; Max-Age=0")));
    consent.clear();
    assert.equal(tracking.readMarketingConsent(), null, "Clearing stored consent must not retain a prior grant.");
    tracking.saveMarketingConsent("accepted");
    location.pathname = "/launch-preferences";
    tracking.trackPageView(); tracking.trackLaunchLead({ ok: true, conversionEventId: "d".repeat(32) });
    assert.equal(count("Lead"), 1);
    assert.equal(count("PageView"), 1);
    location.pathname = "/";
    window.fbq!.callMethod = () => { throw new Error("SDK blocked"); };
    assert.doesNotThrow(() => tracking.trackLaunchLead({ ok: true, conversionEventId: "e".repeat(32) }));
    assert.doesNotThrow(() => tracking.revokePixelConsent());
    console.log("Passed: consent gating/revocation, host and private-route isolation, PageView/product/Lead deduplication, new-lead qualification, explicit events and no form-data transmission.");
  } finally {
    if (savedWindow) Object.defineProperty(globalThis, "window", savedWindow); else Reflect.deleteProperty(globalThis, "window");
    if (savedDocument) Object.defineProperty(globalThis, "document", savedDocument); else Reflect.deleteProperty(globalThis, "document");
  }
}
main().catch(error => { console.error(error instanceof Error ? error.message : "Pixel checks failed"); process.exitCode = 1; });
