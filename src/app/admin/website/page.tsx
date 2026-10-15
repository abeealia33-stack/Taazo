import { requireOwner } from "@/lib/auth";
import { getHomepageEditor } from "@/lib/homepage-content";
import { AdminHeading } from "@/components/admin/ui";
import { WebsiteEditor } from "./WebsiteEditor";

export const dynamic = "force-dynamic";
export default async function WebsitePage() {
  await requireOwner();
  const { content, revision } = await getHomepageEditor();
  return <><AdminHeading title="Website" subtitle="Edit your homepage words and photographs. Save changes to publish them." action={{ href: "/", label: "View website ↗" }} /><WebsiteEditor initialContent={content} initialRevision={revision} /></>;
}
