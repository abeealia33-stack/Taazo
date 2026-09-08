import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminHeading, Card } from "@/components/admin/ui";
import { ChangePasswordForm, AddStaffForm } from "./AccountForms";
import { toggleStaff } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminAccountPage() {
  const session = await requireAdmin();
  const isOwner = session.role === "owner";

  const users = isOwner
    ? await db.adminUser.findMany({ orderBy: { createdAt: "asc" } })
    : [];

  return (
    <>
      <AdminHeading
        title="Account"
        subtitle={`Signed in as ${session.name} (${session.email}) · ${session.role}`}
      />

      <div className="flex flex-col gap-5">
        <ChangePasswordForm />

        {isOwner && (
          <>
            <AddStaffForm />

            <Card>
              <h2 className="text-lg tracking-tight text-charcoal">
                Who has access
              </h2>
              <ul className="mt-4 flex flex-col gap-2">
                {users.map((user) => (
                  <li
                    key={user.id}
                    className="flex flex-wrap items-center justify-between gap-3 border-b border-sand-100 pb-3 last:border-0"
                  >
                    <div className="min-w-0">
                      <p className="text-base text-charcoal">
                        {user.name}
                        {user.id === session.userId && (
                          <span className="ml-2 text-xs text-sand-500">you</span>
                        )}
                      </p>
                      <p className="text-xs text-sand-600">
                        {user.email} · {user.role}
                        {user.lastLoginAt
                          ? ` · last in ${user.lastLoginAt.toLocaleDateString(
                              "en-PK",
                              {
                                day: "numeric",
                                month: "short",
                                timeZone: "Asia/Karachi",
                              },
                            )}`
                          : " · never signed in"}
                      </p>
                    </div>

                    <form action={toggleStaff}>
                      <input type="hidden" name="userId" value={user.id} />
                      <button
                        disabled={user.id === session.userId}
                        title={
                          user.id === session.userId
                            ? "You cannot revoke your own access"
                            : undefined
                        }
                        className={
                          user.active
                            ? "rounded-full bg-olive/15 px-4 py-2 text-xs text-olive transition-colors hover:bg-olive/25 disabled:cursor-not-allowed disabled:opacity-40"
                            : "rounded-full bg-sand-300 px-4 py-2 text-xs text-sand-700 transition-colors hover:bg-sand-400 disabled:opacity-40"
                        }
                      >
                        {user.active ? "has access" : "revoked"}
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs text-sand-600">
                Accounts are never deleted — access is revoked instead, so the
                audit log keeps making sense. The last active owner cannot be
                revoked.
              </p>
            </Card>
          </>
        )}
      </div>
    </>
  );
}
