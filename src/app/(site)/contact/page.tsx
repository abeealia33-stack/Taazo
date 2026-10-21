import Link from "next/link";
import { InfoPage } from "@/components/prelaunch/InfoPage";
import { LaunchLink } from "@/components/prelaunch/LaunchLink";
import { getHomepageContent } from "@/lib/homepage-content";
import { pageMetadata } from "@/lib/seo";

const title = "Contact CHULIMAAR";
const description = "Find CHULIMAAR’s published contact channels and follow product and launch updates from our apricot kernel oil brand in Skardu, Pakistan.";
export const metadata = pageMetadata(title, description, "/contact");

export default async function ContactPage() {
  const { contact } = await getHomepageContent();
  const hasContact = Boolean(contact.email || contact.whatsapp || contact.instagram);
  return <InfoPage path="/contact" title={title} description={description} eyebrow="CHULIMAAR · Keep in touch"
    answer={<p>{hasContact ? "Use the published channels below for questions about CHULIMAAR apricot kernel oil." : "Our public contact channels have not yet been published. For now, you can follow CHULIMAAR’s product and launch updates on this website."}</p>}
    sections={[
      { id: "channels", title: "How can I contact CHULIMAAR?", content: hasContact ? <ul>
        {contact.email && <li>Email: <a href={`mailto:${contact.email}`}>{contact.email}</a></li>}
        {contact.whatsapp && <li>WhatsApp: <a href={`https://wa.me/${contact.whatsapp}`}>+{contact.whatsapp}</a></li>}
        {contact.instagram && <li><a href={contact.instagram}>CHULIMAAR on Instagram</a></li>}
      </ul> : <p>Public email, telephone and social contact details will appear here when available. <LaunchLink>Join the launch updates list</LaunchLink> to receive confirmed ordering information.</p> },
      { id: "location", title: "Where is CHULIMAAR based?", content: <><p>CHULIMAAR’s roots and oil pressing are in Skardu, Pakistan. We have not published a visitor address or shop opening hours.</p><p>Meet <Link href="/story">co-founders Asad Ali and Muhammad Raza</Link>, or explore <Link href="/apricot-kernel-oil">our product information</Link>.</p></> },
    ]} />;
}
