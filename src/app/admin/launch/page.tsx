import Link from "next/link";
import { ArrowLeft, ArrowRight, Inbox } from "lucide-react";
import { requireOwner } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminHeading } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function LaunchSubscribersPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  await requireOwner();
  const requested = Number((await searchParams).page || 1);
  const total = await db.launchSubscriber.count();
  const pages = Math.max(1, Math.ceil(total / 50));
  const page = Number.isSafeInteger(requested) ? Math.min(pages, Math.max(1, requested)) : 1;
  const subscribers = await db.launchSubscriber.findMany({ orderBy: { createdAt: "desc" }, take: 50, skip: (page - 1) * 50 });
  return <>
    <AdminHeading title="Launch signups" subtitle="People waiting to hear about your first batch." action={{ href: "/api/admin/launch-export", label: "Export CSV" }} />
    <section className="admin-panel admin-table-panel" aria-label="Launch subscribers">
      <div className="admin-table-heading"><h2>Subscribers</h2><span className="admin-status">{total.toLocaleString("en-PK")} total</span></div>
      {subscribers.length ? <div className="admin-table-scroll"><table className="admin-table"><caption className="sr-only">Launch signups, newest first</caption><thead><tr>{["Email address", "Name", "City", "Signed up"].map(label => <th key={label} scope="col">{label}</th>)}</tr></thead><tbody>{subscribers.map(subscriber => <tr key={subscriber.id}><td>{subscriber.email}<details className="admin-muted mt-1"><summary>Signup details</summary><p>Privacy notice: {subscriber.noticeVersion}</p></details></td><td>{subscriber.firstName || "—"}</td><td>{subscriber.city || "—"}</td><td className="whitespace-nowrap">{subscriber.createdAt.toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Karachi" })}<p className="admin-muted mt-1">{subscriber.createdAt.toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Karachi" })}</p></td></tr>)}</tbody></table></div> : <div className="admin-empty-state"><span className="admin-empty-icon"><Inbox size={25} strokeWidth={1.5} aria-hidden="true" /></span><h2>Your launch list starts here</h2><p>New signups from your website will appear here with their email, name and city.</p><Link href="/#launch-updates" target="_blank" rel="noopener noreferrer" className="admin-button admin-button-secondary mt-6">View signup form<span className="sr-only"> (opens in a new tab)</span></Link></div>}
    </section>
    <nav className="admin-pagination" aria-label="Signup pages"><p className="admin-muted">{total ? `Showing ${(page - 1) * 50 + 1}–${Math.min(page * 50, total)} of ${total} signups` : "No emails are sent automatically."}</p><div>{page > 1 && <Link className="admin-button admin-button-secondary" href={`/admin/launch?page=${page - 1}`}><ArrowLeft size={16} aria-hidden="true" />Previous</Link>}{page < pages && <Link className="admin-button admin-button-secondary" href={`/admin/launch?page=${page + 1}`}>Next<ArrowRight size={16} aria-hidden="true" /></Link>}</div></nav>
    {total > 0 && <p className="admin-muted mt-4">No emails are sent automatically.</p>}
  </>;
}
