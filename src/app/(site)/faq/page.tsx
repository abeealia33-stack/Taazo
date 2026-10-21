import Link from "next/link";
import { InfoPage } from "@/components/prelaunch/InfoPage";
import { LaunchLink } from "@/components/prelaunch/LaunchLink";
import { pageMetadata } from "@/lib/seo";

const title = "CHULIMAAR Apricot Oil: Frequently Asked Questions";
const description = "Find answers about CHULIMAAR’s name, co-founders, Skardu pressing location, launch updates, ordering details and product information.";
export const metadata = pageMetadata(title, description, "/faq");
export default function FaqPage() {
  return <InfoPage path="/faq" title={title} description={description} eyebrow="CHULIMAAR · Your questions"
    answer={<p>CHULIMAAR is an apricot kernel oil brand from Skardu, Pakistan, founded by Asad Ali and Muhammad Raza. Cooking is our primary focus. Here are the current answers about the brand and ordering updates.</p>}
    sections={[
      { id: "name", title: "What does CHULIMAAR mean?", content: <p>Chulimaar is the Balti name we use for apricot oil, connecting the brand to our language and roots in Skardu.</p> },
      { id: "co-founders", title: "Who founded CHULIMAAR?", content: <p>Asad Ali and Muhammad Raza are the co-founders. Read <Link href="/story">our Skardu story</Link>.</p> },
      { id: "location", title: "Where is CHULIMAAR oil pressed?", content: <p>Our oil is pressed in Skardu, Pakistan. See <Link href="/our-process">our production information</Link> for the details currently available.</p> },
      { id: "ordering", title: "When can I order, and how much does it cost?", content: <p>Ordering dates, price and bottle sizes have not yet been announced on the product page. <LaunchLink>Join the launch updates list</LaunchLink> to hear when ordering details are confirmed.</p> },
      { id: "delivery", title: "Where will delivery be available?", content: <p>Delivery coverage and arrangements have not yet been announced. Check <Link href="/apricot-kernel-oil#ordering">our product and ordering information</Link> for updates.</p> },
      { id: "uses", title: "Where can I learn about cooking, skin, hair and fats?", content: <p>Visit <Link href="/apricot-kernel-oil#cooking">the product’s cooking information</Link>, our <Link href="/guides/apricot-oil-skin-hair">skin and hair guide</Link>, or our <Link href="/guides/apricot-kernel-oil-unsaturated-fats">guide to unsaturated fats in apricot oil</Link>. Product-specific directions are published only when confirmed.</p> },
      { id: "contact", title: "How can I get in touch?", content: <p>Find any published public channels on <Link href="/contact">the CHULIMAAR contact page</Link>.</p> },
    ]} />;
}
