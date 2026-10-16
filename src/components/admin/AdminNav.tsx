"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Boxes, CircleUserRound, ClipboardList, CreditCard, LayoutDashboard, LogOut, Package, PanelsTopLeft, Settings2, Tags, Truck, Users, Video, ChartNoAxesCombined, FileText } from "lucide-react";
import { Brand } from "@/components/prelaunch/Brand";
import { PRELAUNCH } from "@/lib/chulimaar";
import { logout } from "@/app/admin/login/actions";
import type { AdminSession } from "@/lib/auth";

const LINKS = [
  { href: "/admin/website", label: "Website", icon: PanelsTopLeft, ownerOnly: true },
  { href: "/admin/launch", label: "Launch signups", icon: Users, ownerOnly: true },
  { href: "/admin", label: "Today", icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "Orders", icon: ClipboardList },
  { href: "/admin/batches", label: "Batches", icon: Boxes },
  { href: "/admin/delivery", label: "Delivery", icon: Truck },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Tags, ownerOnly: true },
  { href: "/admin/content", label: "Content", icon: FileText, ownerOnly: true },
  { href: "/admin/reels", label: "Reels", icon: Video },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/reports", label: "Reports", icon: ChartNoAxesCombined, ownerOnly: true },
  { href: "/admin/settings", label: "Settings", icon: Settings2, ownerOnly: true },
  { href: "/admin/account", label: "Account", icon: CircleUserRound },
];

export function AdminNav({ session }: { session: AdminSession }) {
  const pathname = usePathname();
  const links = LINKS.filter(link => (!link.ownerOnly || session.role === "owner") &&
    (!PRELAUNCH || ["/admin/launch", "/admin/website", "/admin/account"].includes(link.href)));
  const current = links.find(link => link.exact ? pathname === link.href : pathname.startsWith(link.href));
  const initials = session.name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join("").toUpperCase();

  return <>
    <a className="admin-skip" href="#admin-main">Skip to content</a>
    <aside className="admin-sidebar" aria-label="Admin workspace">
      <div className="admin-brand-row">
        <Link href="/admin" aria-label="Chulimaar admin" className="admin-brand"><Brand /></Link>
        <span className="admin-workspace-label">Admin workspace</span>
        <form action={logout} className="admin-mobile-signout"><button className="admin-icon-button" aria-label="Sign out" type="submit"><LogOut size={18} aria-hidden="true" /></button></form>
      </div>
      <nav aria-label="Admin sections" className="admin-navigation">
        {links.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return <Link key={href} href={href} aria-current={active ? "page" : undefined}><Icon size={18} strokeWidth={1.7} aria-hidden="true" /><span>{label}</span></Link>;
        })}
      </nav>
      <div className="admin-sidebar-bottom">
        <div className="admin-identity"><span className="admin-avatar" aria-hidden="true">{initials}</span><div><p>{session.name}</p><span>{session.role === "owner" ? "Owner account" : "Staff account"}</span></div></div>
        <form action={logout}><button type="submit" className="admin-signout"><LogOut size={16} aria-hidden="true" />Sign out</button></form>
      </div>
    </aside>
    <header className="admin-topbar"><p><span>Workspace</span><span aria-hidden="true">/</span><strong>{current?.label || "Admin"}</strong></p><Link href="/" target="_blank" rel="noopener noreferrer" className="admin-view-site">View website<ArrowUpRight size={16} aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></Link></header>
  </>;
}
