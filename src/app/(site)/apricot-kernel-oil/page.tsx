import Link from "next/link";
import { InfoPage } from "@/components/prelaunch/InfoPage";
import { pageMetadata } from "@/lib/seo";
import { getHomepageContent } from "@/lib/homepage-content";
import { ProductShowcase } from "@/components/prelaunch/ProductShowcase";
import { LaunchLink } from "@/components/prelaunch/LaunchLink";

const title = "Apricot kernel oil in Pakistan: Chulimaar launch details";
const description = "Looking for apricot oil in Pakistan? Meet Chulimaar’s planned cooking oil from Skardu and find the latest availability, price and ordering information.";
export const metadata = pageMetadata(title, description, "/apricot-kernel-oil");

export default async function OilPage() {
  const { images, text, product } = await getHomepageContent();
  return <InfoPage path="/apricot-kernel-oil" title={title} description={description} eyebrow="Our first product · Skardu, Pakistan"
    answer={<p>Chulimaar is a founder-run brand preparing its first batch of apricot kernel oil in Skardu, Pakistan, with a focus on cooking. Orders are not open yet. Join our launch updates to hear when the oil is ready and ordering details are confirmed.</p>}
    sections={[
      { id: "where-to-buy", title: "Where can I buy Chulimaar apricot oil?", content: <><p>This website is the place to follow Chulimaar’s launch. We have not opened ordering or announced retail stockists. <LaunchLink>Join the launch updates list</LaunchLink> for an email when our first batch is ready.</p><p>If you are comparing apricot oils now, check the intended use on the label, the maker’s contact details, ingredients and traceable batch information. Choose a product explicitly labelled for food use if you intend to cook with it.</p></> },
      { id: "price-delivery", title: "What is the price, and where will delivery be available?", content: <><p>Chulimaar’s price, bottle sizes, delivery areas and ordering date have not been announced. These details will be shared before orders open.</p><div className="cm-info-table-wrap"><table className="cm-info-table"><caption className="sr-only">Current Chulimaar launch status</caption><thead><tr><th scope="col">Detail</th><th scope="col">Current status</th></tr></thead><tbody><tr><th scope="row">Availability</th><td>Preparing for launch; ordering is closed</td></tr><tr><th scope="row">Price and bottle sizes</th><td>To be announced</td></tr><tr><th scope="row">Planned pressing location</th><td>Skardu, Pakistan</td></tr><tr><th scope="row">Delivery and stockists</th><td>To be announced</td></tr></tbody></table></div><p>Joining our email list registers interest. It is not a reservation, purchase or promise of delivery coverage.</p></> },
      { id: "what-is-apricot-oil", title: "What is apricot kernel oil?", content: <><p>Apricot kernel oil is oil extracted from the kernel inside an apricot stone. You may also see it called apricot oil. Products sold under that name can be intended for food or cosmetic use, so the specific label matters.</p><p>Our first product is being developed with cooking in mind. Ingredients, extraction details, product specifications and final labelling will be shared once confirmed. Read our <Link href="/guides/apricot-oil-uses">apricot oil uses guide</Link> for the questions to ask before using a product.</p></> },
      { id: "our-beginning", title: "Why Skardu?", content: <><p>Our founder is from Skardu. Chulimaar is the Balti name we use for apricot oil, connecting this business to our language and home.</p><p>We plan to press the first batch ourselves and document the work as it takes shape. Explore <Link href="/story">our story</Link> and <Link href="/our-process">our planned process</Link>.</p></> },
      { id: "benefits", title: "What about apricot oil benefits?", content: <><p>There is published research on the composition of apricot kernel oils. Findings from those samples are not a test of Chulimaar’s forthcoming batch or proof of a particular health outcome.</p><p>Our <Link href="/guides/apricot-oil-benefits">benefits and evidence guide</Link> separates composition research, general nutrition guidance and claims that would need stronger evidence.</p></> },
    ]}><ProductShowcase image={images.oil} text={text} animation={product.animation} /></InfoPage>;
}
