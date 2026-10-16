import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminHeading } from "@/components/admin/ui";
import { ChangePasswordForm, AddStaffForm } from "./AccountForms";
import { toggleStaff } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminAccountPage() {
  const session = await requireAdmin();
  const isOwner = session.role === "owner";
  const users = isOwner ? await db.adminUser.findMany({ orderBy: { createdAt: "asc" } }) : [];
  const initials = session.name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join("").toUpperCase();
  return <>
    <AdminHeading title="Account" subtitle="Manage your profile, password and team access." />
    <div className="admin-account-grid">
      <div className="admin-account-stack">
        <section className="admin-panel"><h2>Your profile</h2><p className="admin-description">The account you use to manage Chulimaar.</p><div className="admin-account-profile"><span className="admin-avatar" aria-hidden="true">{initials}</span><div><p className="font-medium">{session.name}</p><span className="admin-status admin-status-good mt-1">{isOwner ? "Owner" : "Staff"}</span></div></div><label className="admin-field">Email address<input type="email" readOnly value={session.email} className="admin-input" /></label></section>
        <ChangePasswordForm />
      </div>
      {isOwner && <section className="admin-panel"><div className="admin-section-heading"><div><h2>Team access</h2><p className="admin-description">People who can sign in to Chulimaar.</p></div><span className="admin-status">{users.length} account{users.length === 1 ? "" : "s"}</span></div>
        <ul>{users.map(user => <li key={user.id} className="admin-member"><div className="admin-member-info"><p className="admin-member-name">{user.name}{user.id === session.userId && <span className="admin-muted">You</span>}</p><p className="admin-member-email">{user.email}</p><div className="admin-member-role"><span className={`admin-status${user.active ? " admin-status-good" : ""}`}>{user.role === "owner" ? "Owner" : "Staff"} · {user.active ? "Active" : "Revoked"}</span><span className="admin-muted">{user.lastLoginAt ? `Last sign-in ${user.lastLoginAt.toLocaleDateString("en-PK", { day: "numeric", month: "short", timeZone: "Asia/Karachi" })}` : "Not signed in yet"}</span></div></div>{user.id !== session.userId && <form action={toggleStaff}><input type="hidden" name="userId" value={user.id} /><button className={`admin-button admin-button-quiet${user.active ? " admin-button-danger" : ""}`}>{user.active ? "Revoke access" : "Restore access"}</button></form>}</li>)}</ul>
        <p className="admin-muted mt-3">Your own access and the last active owner are protected. Revoked accounts stay in your activity history.</p><AddStaffForm />
      </section>}
    </div>
  </>;
}
