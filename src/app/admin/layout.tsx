import type { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { AdminNav } from "@/components/admin/AdminNav";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · taazo admin" },
  robots: { index: false, follow: false },
};

/**
 * The admin shell.
 *
 * Deliberately plain: no smooth scrolling, no GSAP, no grain, no cart. The
 * storefront is designed to impress; this is designed to be fast on a phone at
 * 6am with one hand free.
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
    <div className="min-h-screen bg-sand-50">
      {session && <AdminNav session={session} />}
      <main className={session ? "mx-auto max-w-6xl px-4 pb-24 pt-6 md:px-6" : ""}>
        {children}
      </main>
    </div>
  );
}
