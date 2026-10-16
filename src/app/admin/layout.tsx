import type { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { AdminNav } from "@/components/admin/AdminNav";
import "./admin.css";

export const metadata: Metadata = {
  title: { default: "Chulimaar Admin", template: "%s · Chulimaar admin" },
  robots: { index: false, follow: false },
};

/**
 * The admin shell.
 *
 * A compact workspace with persistent desktop navigation and a phone layout.
 * Public-site animations and shopping controls stay in the storefront layout.
 *
 * The login page renders without the nav — it is the one admin route reachable
 * while signed out.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <div className={`admin-workspace${session ? "" : " admin-signed-out"}`}>
      {session && <AdminNav session={session} />}
      <main id="admin-main" className={session ? "admin-main" : ""}>
        <div className={session ? "admin-content" : ""}>{children}</div>
      </main>
    </div>
  );
}
