"use client";
import Link from "next/link";
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <div className="cm-site"><div className="cm-container cm-privacy"><p className="cm-eyebrow">Chulimaar</p><h1>We couldn&apos;t load this page.</h1><p>Please try again in a moment.</p><div className="cm-actions"><button className="cm-button" onClick={reset}>Try again</button><Link href="/">Back home</Link></div></div></div>;
}
