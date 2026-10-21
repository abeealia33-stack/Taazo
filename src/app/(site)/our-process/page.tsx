import Link from "next/link";
import { InfoPage } from "@/components/prelaunch/InfoPage";
import { MediaPanel } from "@/components/prelaunch/MediaPanel";
import { getHomepageContent } from "@/lib/homepage-content";
import { pageMetadata } from "@/lib/seo";

const title = "Our Apricot Oil Process in Skardu";
const description = "Explore CHULIMAAR’s apricot oil production information from Skardu, Pakistan, including what is confirmed about pressing and what we will share before launch.";
export const metadata = pageMetadata(title, description, "/our-process");

export default async function ProcessPage() {
  const { images } = await getHomepageContent();
  return <InfoPage path="/our-process" title={title} description={description} eyebrow="CHULIMAAR · From kernel to bottle"
    answer={<p>CHULIMAAR apricot kernel oil is pressed in Skardu, Pakistan. Our product journey begins with kernels, continues through pressing and ends with bottling. Detailed sourcing, equipment and finished-product information will be shared when confirmed.</p>}
    sections={[
      { id: "kernels", title: "Where do the kernels come from?", content: <><p>Batch-specific kernel sourcing and selection details have not yet been published. Pressing in Skardu does not, by itself, establish the growing origin of every kernel.</p>{images.kernels.url && <MediaPanel photo={images.kernels.url} alt={images.kernels.alt} label={images.kernels.caption} placeholderLabel="Apricot kernels" position={images.kernels.position} />}</> },
      { id: "pressing", title: "Where and how is the oil pressed?", content: <><p>Our oil is pressed in Skardu, Pakistan. Details about the equipment, extraction method and processing temperature will be shared when confirmed.</p>{images.pressing.url && <MediaPanel photo={images.pressing.url} alt={images.pressing.alt} label={images.pressing.caption} placeholderLabel="Oil production" position={images.pressing.position} />}</> },
      { id: "bottling", title: "What is shared about the finished bottle?", content: <><p>Final ingredients, bottle sizes, batch identification, usage and storage instructions will be published alongside the confirmed product details.</p><p>See <Link href="/apricot-kernel-oil#product-details">the current CHULIMAAR product information</Link>. Photographs illustrate the product’s presentation; the published specification will state the final details.</p>{images.bottle.url && <MediaPanel photo={images.bottle.url} alt={images.bottle.alt} label={images.bottle.caption} placeholderLabel="The bottle" position={images.bottle.position} />}</> },
      { id: "people", title: "Who is behind CHULIMAAR?", content: <><p>Asad Ali and Muhammad Raza are the co-founders of CHULIMAAR.</p><p>Read <Link href="/story">our Skardu story</Link> to learn about the brand’s roots.</p></> },
    ]} />;
}
