import { requireOwner } from "@/lib/auth";
import { getHomepageEditor } from "@/lib/homepage-content";
import { AdminHeading } from "@/components/admin/ui";
import { WebsiteEditor } from "./WebsiteEditor";
import { homepageUploadsAvailable } from "@/lib/homepage-media";

export const dynamic = "force-dynamic";
export default async function WebsitePage() {
  await requireOwner();
  const { content, revision } = await getHomepageEditor();
  return <><AdminHeading title="Website" subtitle="Manage the words and photographs on your homepage." /><WebsiteEditor initialContent={content} initialRevision={revision} uploadsAvailable={homepageUploadsAvailable()} /></>;
}
