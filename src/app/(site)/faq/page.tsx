import Link from "next/link";
import { InfoPage } from "@/components/prelaunch/InfoPage";
import { getHomepageContent } from "@/lib/homepage-content";
import { pageMetadata } from "@/lib/seo";

const title = "Chulimaar apricot oil: frequently asked questions";
const description = "Answers about Chulimaar's name, planned apricot kernel oil, first batch in Skardu, ordering, delivery, uses and benefits.";
export const metadata = pageMetadata(title, description, "/faq");
export default async function FaqPage() {
  const { faqs } = await getHomepageContent();
  return <InfoPage path="/faq" title={title} description={description} eyebrow="Before we begin"
    answer={<p>Chulimaar is preparing its first batch of apricot kernel oil for cooking in Skardu, Pakistan. Ordering is not open yet. Here are the current answers about our product and launch.</p>}
    sections={[
      ...faqs.map((faq, index) => ({ id: `question-${index + 1}`, title: faq.question, content: <p>{faq.answer}</p> })),
      { id: "price", title: "How much will Chulimaar apricot oil cost?", content: <p>Price and bottle sizes have not been announced. See <Link href="/apricot-kernel-oil">our product and availability page</Link> for the current launch status.</p> },
      { id: "uses", title: "Where can I learn about apricot oil uses and benefits?", content: <p>Read our <Link href="/guides/apricot-oil-uses">guide to apricot oil uses</Link> for food and cosmetic product distinctions, and our <Link href="/guides/apricot-oil-benefits">benefits and research guide</Link> for composition research and its limitations.</p> },
    ]} />;
}
