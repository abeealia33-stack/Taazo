import Link from "next/link";
import { removeLaunchSignup } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Launch preferences", robots: { index: false, follow: false }, referrer: "no-referrer" as const };

export default async function LaunchPreferences({ searchParams }: { searchParams: Promise<{ token?: string; removed?: string; invalid?: string; error?: string }> }) {
  const query = await searchParams;
  const valid = /^[a-f0-9]{64}$/.test(query.token || "");
  return <div className="cm-container cm-privacy"><p className="cm-eyebrow">Your launch updates</p><h1>{query.removed ? "Your signup is removed." : "Your choice, always."}</h1>
    {query.removed ? <p>You will no longer receive launch updates for this signup.</p> : valid ? <><p>Use the button below to delete the signup associated with your private link.</p>{query.error && <p role="alert">We could not remove your signup. Please try again.</p>}<form action={removeLaunchSignup} className="mt-8"><input type="hidden" name="token" value={query.token} /><button className="cm-button" type="submit">Delete my signup</button></form></> : <p>Use the private removal link from your signup confirmation or a launch email.</p>}
    <p className="mt-10"><Link href="/">← Back to Chulimaar</Link></p>
  </div>;
}
