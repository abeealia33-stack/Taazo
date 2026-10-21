import Link from "next/link";
import { InfoPage } from "@/components/prelaunch/InfoPage";
import { MediaPanel } from "@/components/prelaunch/MediaPanel";
import { getHomepageContent } from "@/lib/homepage-content";
import { pageMetadata } from "@/lib/seo";

const title = "Our Skardu Story";
const description = "Discover CHULIMAAR’s Skardu roots and meet co-founders Asad Ali and Muhammad Raza, the people behind our apricot kernel oil brand in Pakistan.";
export const metadata = pageMetadata(title, description, "/story");
export default async function StoryPage() {
  const { images } = await getHomepageContent();
  return <InfoPage path="/story" title={title} description={description} eyebrow="CHULIMAAR · Rooted in Skardu"
    answer={<p>CHULIMAAR is founded by Asad Ali and Muhammad Raza, with roots in Skardu, Pakistan. We begin with apricot kernel oil and a focus on cooking, connecting a product for the kitchen to the place behind our story.</p>}
    sections={[
      { id: "co-founders", title: "Who founded CHULIMAAR?", content: <><p>Asad Ali and Muhammad Raza are the co-founders of CHULIMAAR. Our brand begins with one oil and a shared connection to Skardu.</p><p>We will share more of our story and the work behind the product as it develops.</p></> },
      { id: "our-name", title: "What does CHULIMAAR mean?", content: <><p>Chulimaar is the Balti name we use for apricot oil. The name connects the brand to our language and roots in Skardu.</p><p>That connection guides our introduction of apricot oil from Skardu, with cooking as its primary positioning.</p></> },
      { id: "our-home", title: "Where is our oil pressed?", content: <><p>CHULIMAAR oil is pressed in Skardu, Pakistan. Detailed kernel sourcing and processing information will be shared when confirmed.</p><p>Explore <Link href="/our-process">the journey from kernel to bottle</Link> and <Link href="/apricot-kernel-oil">our apricot kernel oil product information</Link>.</p></> },
    ]}>
    {images.founder.url && <div className="cm-story-photo"><MediaPanel photo={images.founder.url} alt={images.founder.alt} label={images.founder.caption} placeholderLabel="CHULIMAAR in Skardu" kind="portrait" position={images.founder.position} /></div>}
    {images.skardu.url && <div className="cm-editorial-photos"><MediaPanel photo={images.skardu.url} alt={images.skardu.alt} label={images.skardu.caption} placeholderLabel="Skardu" position={images.skardu.position} /></div>}
  </InfoPage>;
}
