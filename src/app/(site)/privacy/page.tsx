import Link from "next/link";
import { getHomepageContent } from "@/lib/homepage-content";

export const metadata = { title: "Privacy", description: "How Chulimaar handles launch signups.", alternates: { canonical: "/privacy" } };

export default async function PrivacyPage() {
  const { contact } = await getHomepageContent();
  return <article className="cm-container cm-privacy"><p className="cm-eyebrow">Chulimaar · Launch interest</p><h1>Your email, <em>with care.</em></h1>
    <p>This page describes the launch signup on this website. Updated 14 October 2026.</p>
    <h2>What we collect</h2><p>We collect your email address and, if you choose to provide them, your first name and city. We record when you sign up and the version of the signup notice you agreed to.</p>
    <h2>What it is for</h2><p>We use your signup to send Chulimaar launch updates about our first batch and ordering arrangements. Providing a city helps us understand where launch interest comes from; it does not promise delivery coverage.</p>
    <h2>Where it is kept</h2><p>Signups are stored in our website database and are available to authorised business administrators. Hosting and database providers process this information to run the site. If an email provider is configured for launch updates, it will process the information needed to deliver them. We do not sell signup information.</p>
    <h2>Spam protection</h2><p>The form uses an empty-field spam check and short-lived attempt counters. Counters contain a hashed identifier derived from the email, and from a network address only when a trusted hosting proxy is configured. They expire automatically and are not used for marketing.</p>
    <h2>Your choices</h2><p>After a new signup, the confirmation includes a private removal link. Keep that link to delete your signup at any time. Every future launch email will also need to include a way to unsubscribe. Launch emails are not sent automatically by the signup form.</p>
    <h2>How long we keep it</h2><p>We keep your signup for the launch-update purpose until those updates are finished or you remove it. We will ask separately before using your information for a different ongoing mailing list.</p>
    {contact.email && <><h2>Contact</h2><p>For questions about your information, email <a href={`mailto:${contact.email}`}>{contact.email}</a>.</p></>}
    <p className="mt-10"><Link href="/">← Back to Chulimaar</Link></p>
  </article>;
}
