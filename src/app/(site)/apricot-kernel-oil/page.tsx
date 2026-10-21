import Link from "next/link";
import { InfoPage } from "@/components/prelaunch/InfoPage";
import { pageMetadata, siteUrl } from "@/lib/seo";
import { getHomepageContent } from "@/lib/homepage-content";
import { ProductShowcase } from "@/components/prelaunch/ProductShowcase";
import { LaunchLink } from "@/components/prelaunch/LaunchLink";
import { StructuredData } from "@/components/prelaunch/StructuredData";
import { MediaPanel } from "@/components/prelaunch/MediaPanel";

const path = "/apricot-kernel-oil";
const title = "Apricot Kernel Oil from Skardu";
const description = "Discover CHULIMAAR apricot kernel oil from Skardu, Pakistan. Explore its culinary focus, production story, product information and launch updates.";
export const metadata = pageMetadata(title, description, path);

export default async function OilPage() {
  const { images, text, product } = await getHomepageContent();
  return <>
    <StructuredData data={{ "@context": "https://schema.org", "@type": "Product", "@id": `${siteUrl(path)}#product`, name: "CHULIMAAR Apricot Kernel Oil", description, url: siteUrl(path), brand: { "@type": "Brand", name: "CHULIMAAR" }, manufacturer: { "@id": siteUrl("/#organization") }, ...(images.oil.url ? { image: siteUrl(images.oil.url) } : {}) }} />
    <InfoPage path={path} title={title} description={description} eyebrow="Our oil · Skardu, Pakistan"
      answer={<p>CHULIMAAR is an apricot kernel oil brand rooted in Skardu, Pakistan, founded by Asad Ali and Muhammad Raza. Cooking is our primary focus. Explore our production story and the product information below, or follow our launch updates for confirmed ordering details.</p>}
      sections={[
        { id: "what-is-apricot-oil", title: "What is apricot kernel oil?", content: <><p>Apricot kernel oil is oil extracted from the kernel inside an apricot stone. It is also called apricot oil. The oil is different from the whole kernel, and products may be made for food or cosmetic use.</p><p>If you are looking for apricot kernel oil in Pakistan, check the product’s intended use, ingredient declaration and maker’s details. CHULIMAAR begins with a focus on the kitchen.</p></> },
        { id: "pressed-in-skardu", title: "Where is CHULIMAAR oil pressed?", content: <><p>CHULIMAAR oil is pressed in Skardu, Pakistan. Our roots in Skardu are central to the brand and its name.</p><p>Meet co-founders Asad Ali and Muhammad Raza in <Link href="/story">our Skardu story</Link>, and explore <Link href="/our-process">our production information</Link>. Kernel sourcing and detailed processing specifications will be published when confirmed.</p></> },
        { id: "cooking", title: "Is this particular product suitable for cooking?", content: <><p>Cooking is CHULIMAAR’s intended primary use. Finished-product specifications and food-use directions have not yet been published, so we cannot yet confirm particular cooking methods or temperatures for this bottle.</p><p>For any apricot oil for cooking, use a product explicitly labelled for food use and follow the maker’s directions. We will add CHULIMAAR’s specific culinary guidance alongside the final product details.</p></> },
        { id: "product-details", title: "What ingredients and product details are available?", content: <><p>Our product is apricot kernel oil from Skardu. The final ingredient declaration, bottle sizes and detailed extraction information are still to be confirmed for publication.</p><div className="cm-info-table-wrap"><table className="cm-info-table"><caption>CHULIMAAR product information</caption><thead><tr><th scope="col">Detail</th><th scope="col">Current information</th></tr></thead><tbody><tr><th scope="row">Product</th><td>Apricot kernel oil</td></tr><tr><th scope="row">Pressing location</th><td>Skardu, Pakistan</td></tr><tr><th scope="row">Intended use</th><td>Cooking; detailed food-use directions pending</td></tr><tr><th scope="row">Ingredients and bottle sizes</th><td>Final declaration to be published</td></tr><tr><th scope="row">Price, stock and delivery</th><td>Not yet announced on this page</td></tr></tbody></table></div></> },
        { id: "storage", title: "How should the product be stored?", content: <><p>CHULIMAAR’s storage directions, shelf life and after-opening instructions have not yet been confirmed for publication. Follow the directions supplied with the finished product.</p><p>Do not assume a generic online shelf life or refrigeration recommendation applies to every apricot oil. Our approved instructions will appear here with the final product details.</p></> },
        { id: "fats", title: "What fats does apricot kernel oil contain?", content: <><p>Published research on apricot kernel oils identifies mainly unsaturated fats, including oleic and linoleic acids. Those findings describe the samples studied, not CHULIMAAR’s own nutritional composition.</p><p>Read <Link href="/guides/apricot-kernel-oil-unsaturated-fats">our guide to unsaturated fats in apricot oil</Link> for the research, dietary context and references.</p></> },
        { id: "skin-hair", title: "What about apricot oil for skin and hair?", content: <><p>Apricot kernel oil also appears in cosmetic formulations. CHULIMAAR’s finished-product suitability for skin and hair has not yet been published. Our <Link href="/guides/apricot-oil-skin-hair">skin and hair guide</Link> explains cosmetic uses of the ingredient and how to check a product’s suitability.</p></> },
        { id: "ordering", title: "Where can I buy CHULIMAAR apricot oil?", content: <><p>Ordering details, price, bottle sizes and delivery areas have not yet been announced on this page. <LaunchLink>Join CHULIMAAR launch updates</LaunchLink> to hear when our oil is ready and ordering details are confirmed.</p><p>For questions, see <Link href="/contact">our contact information</Link>. Joining the update list registers interest; it is not a purchase or reservation.</p></> },
      ]}><ProductShowcase image={images.oil} text={text} animation={product.animation} />{images.kitchen.url && <div className="cm-editorial-photos"><MediaPanel photo={images.kitchen.url} alt={images.kitchen.alt} label={images.kitchen.caption} placeholderLabel="In the kitchen" position={images.kitchen.position} /></div>}</InfoPage>
  </>;
}
