"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { isTrackablePage, readMarketingConsent, revokePixelConsent, saveMarketingConsent, subscribeMarketingConsent, trackPageView, trackProductView } from "@/lib/meta-pixel";

export function MarketingConsent() {
  const pathname = usePathname();
  const choice = useSyncExternalStore(subscribeMarketingConsent, readMarketingConsent, () => null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (choice !== "accepted" || !isTrackablePage(window.location)) { revokePixelConsent(); return; }
    trackPageView();
    const product = document.getElementById("our-oil");
    const observer = window.IntersectionObserver ? new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { trackProductView(); observer?.disconnect(); }
    }, { threshold: .3 }) : null;
    if (product) observer?.observe(product);
    return () => observer?.disconnect();
  }, [choice, pathname]);

  if (pathname === "/launch-preferences") return null;
  function choose(value: "accepted" | "declined") { saveMarketingConsent(value); setEditing(false); }

  return <><button className="cm-cookie-settings" type="button" onClick={() => setEditing(true)}>Cookie settings</button>
    {(choice === null || editing) && <section className="cm-cookie-banner" aria-labelledby="cm-cookie-title" aria-label="Advertising cookie choices"><div><h2 id="cm-cookie-title">Your cookie choice</h2><p>We use essential storage to run this site. With your permission, Meta cookies help us measure visits and launch signups, improve our ads, and reach interested people on Facebook and Instagram. <Link href="/privacy">Read our privacy policy</Link>.</p></div><div className="cm-cookie-actions"><button type="button" onClick={() => choose("declined")}>Reject advertising cookies</button><button type="button" onClick={() => choose("accepted")}>Accept advertising cookies</button>{editing && choice !== null && <button type="button" onClick={() => setEditing(false)}>Close</button>}</div></section>}
  </>;
}
