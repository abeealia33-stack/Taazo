import Link from "next/link";
import { InfoPage } from "@/components/prelaunch/InfoPage";
import { getHomepageContent } from "@/lib/homepage-content";
import { pageMetadata } from "@/lib/seo";
import { LaunchLink } from "@/components/prelaunch/LaunchLink";

const title = "Our planned apricot oil process in Skardu";
const description = "Follow Chulimaar’s planned kernel sourcing, pressing and bottling in Skardu. See what is confirmed and what we will share before the first batch launches.";
export const metadata = pageMetadata(title, description, "/our-process");
export default async function ProcessPage() {
  const { text } = await getHomepageContent();
  return <InfoPage path="/our-process" title={title} description={description} eyebrow="From kernel to bottle · Taking shape"
    answer={<p>We plan to press Chulimaar’s first batch of apricot kernel oil ourselves in Skardu. Kernel sourcing, extraction details, bottling and final product information are being prepared. This page describes our plans; we will publish confirmed details as the work progresses.</p>}
    sections={[
      { id: "kernels", title: "Where will the kernels come from?", content: <><p>{text.kernelsBody}</p><p>Being based in Skardu is part of our story. The origin of a particular batch’s kernels will be shared when confirmed.</p></> },
      { id: "pressing", title: "How will the oil be pressed?", content: <><p>{text.pressingBody}</p><p>We have not yet published a confirmed extraction method or processing temperature. Any future process claim will describe the equipment and method actually used.</p></> },
      { id: "bottling", title: "What will be shared about the finished oil?", content: <><p>{text.bottleBody}</p><p>Before orders open, we will share confirmed ingredients, bottle sizes, usage and storage instructions, alongside price and delivery arrangements.</p></> },
      { id: "follow", title: "How can I follow the first batch?", content: <p>Join <LaunchLink>Chulimaar launch updates</LaunchLink> for an email when our oil is ready. For current availability, see <Link href="/apricot-kernel-oil">our product page</Link>.</p> },
    ]} />;
}
