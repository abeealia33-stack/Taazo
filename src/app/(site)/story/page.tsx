import Link from "next/link";
import { InfoPage } from "@/components/prelaunch/InfoPage";
import { getHomepageContent } from "@/lib/homepage-content";
import { pageMetadata } from "@/lib/seo";

const title = "Our story: Chulimaar's beginning in Skardu";
const description = "Meet Chulimaar, a founder-run apricot kernel oil brand rooted in Skardu and the Balti language. Follow our first batch from preparation to launch.";
export const metadata = pageMetadata(title, description, "/story");
export default async function StoryPage() {
  const { text } = await getHomepageContent();
  return <InfoPage path="/story" title={title} description={description} eyebrow="A name from our language. A business from our roots."
    answer={<p>Chulimaar is the Balti name we use for apricot oil. Our founder is from Skardu and is preparing to press our first batch personally, beginning with one product intended for cooking.</p>}
    sections={[
      { id: "our-name", title: "What does Chulimaar mean?", content: <><p>{text.founderQuote}</p><p>The name connects our oil to our language and home. It is the starting point for a small, founder-run business with a focus on one product.</p></> },
      { id: "our-founder", title: "The person behind the first batch", content: <><p>{text.founderBody}</p><p>{text.founderName} · {text.founderLocation}</p><p>We will share the work as it happens, including our sourcing, pressing and bottling details once confirmed. Read about <Link href="/our-process">our planned process</Link>.</p></> },
      { id: "our-product", title: "One oil, a personal beginning", content: <><p>Our first product is apricot kernel oil being developed for cooking. We are still preparing the first batch. Ordering, pricing and delivery arrangements will be announced before launch.</p><p>Explore <Link href="/apricot-kernel-oil">our oil and launch details</Link>, or join the launch list to follow our beginning.</p></> },
    ]} />;
}
