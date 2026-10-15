import { requireOwner } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminHeading, Card } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function LaunchSubscribersPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  await requireOwner();
  const requested = Number((await searchParams).page || 1);
  const page = Number.isSafeInteger(requested) ? Math.min(100000, Math.max(1, requested)) : 1;
  const [total, subscribers] = await Promise.all([
    db.launchSubscriber.count(),
    db.launchSubscriber.findMany({ orderBy: { createdAt: "desc" }, take: 50, skip: (page - 1) * 50 }),
  ]);
  return <>
    <AdminHeading title="Chulimaar launch interest" subtitle={`${total} signup${total === 1 ? "" : "s"}. No emails are sent automatically.`} action={{ href: "/api/admin/launch-export", label: "Export CSV" }} />
    <Card><div className="overflow-x-auto"><table className="w-full text-left text-sm"><caption className="sr-only">Launch signups, newest first</caption><thead><tr>{["Email", "First name", "City", "Signed up", "Notice"].map((label) => <th key={label} scope="col" className="border-b border-sand-300 px-3 py-3 font-medium">{label}</th>)}</tr></thead><tbody>{subscribers.map((subscriber) => <tr key={subscriber.id}><td className="px-3 py-4">{subscriber.email}</td><td className="px-3 py-4">{subscriber.firstName || "—"}</td><td className="px-3 py-4">{subscriber.city || "—"}</td><td className="whitespace-nowrap px-3 py-4">{subscriber.createdAt.toLocaleString("en-PK", { timeZone: "Asia/Karachi" })}</td><td className="px-3 py-4">{subscriber.noticeVersion}</td></tr>)}</tbody></table></div>{!subscribers.length && <p className="py-10 text-center text-sand-600">No signups on this page yet.</p>}</Card>
    <nav className="mt-5 flex gap-6 text-sm" aria-label="Signup pages">{page > 1 && <a href={`/admin/launch?page=${page - 1}`}>← Previous</a>}{page * 50 < total && <a href={`/admin/launch?page=${page + 1}`}>Next →</a>}</nav>
  </>;
}
