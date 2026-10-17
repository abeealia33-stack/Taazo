import Link from "next/link";
import { getHomepageContent } from "@/lib/homepage-content";

export const metadata = { title: "Privacy", description: "How Chulimaar handles launch signups and advertising cookies.", alternates: { canonical: "/privacy" } };

export default async function PrivacyPage() {
  const { contact } = await getHomepageContent();
  return <article className="cm-container cm-privacy"><p className="cm-eyebrow">Chulimaar · Launch interest</p><h1>Your email, <em>with care.</em></h1>
    <p>This page describes launch signups and advertising cookies on this website. Updated 18 October 2026.</p>
    <h2>What we collect</h2><p>We collect your email address and, if you choose to provide them, your first name and city. We record when you sign up and the version of the signup notice you agreed to.</p>
    <h2>What it is for</h2><p>We use your signup to send Chulimaar launch updates about our first batch and ordering arrangements. Providing a city helps us understand where launch interest comes from; it does not promise delivery coverage.</p>
    <h2>Where it is kept</h2><p>Signups are stored in our website database and are available to authorised business administrators. Hosting and database providers process this information to run the site. If an email provider is configured for launch updates, it will process the information needed to deliver them. We do not sell signup information.</p>
    <h2>Spam protection</h2><p>The form uses an empty-field spam check and short-lived attempt counters. Counters contain a hashed identifier derived from the email, and from a network address only when a trusted hosting proxy is configured. They expire automatically and are not used for marketing.</p>
    <h2>Advertising cookies and Meta Pixel</h2><p>If you accept advertising cookies, we use Meta Pixel on our public homepage to measure page visits, views of our oil, and successful new launch signups. Meta receives these events along with website and browser information, such as the page address, network address, browser details and cookie or advertising-click identifiers. This helps us measure and improve Facebook and Instagram ads and reach people interested in Chulimaar. Meta processes this information under its <a href="https://www.facebook.com/privacy/policy/" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.</p>
    <p>Our event code does not send the email, name or city entered in the signup form, or your private removal token. Automatic form-field matching is disabled. Advertising tracking is not enabled on admin or private removal pages. A successful signup is measured as a lead, not a purchase.</p>
    <h2>Cookie choices</h2><p>You can accept or reject advertising cookies using the cookie notice, and change your choice through Cookie settings at the bottom of the page. Rejecting them keeps the signup form available and stops further advertising events from our integration. We store your cookie preference in your browser. Meta cookies such as _fbp and, where applicable, _fbc may be used after you accept. Your browser and Meta account settings also let you manage advertising cookies and preferences. Withdrawal stops future collection; it does not recall information Meta already received.</p>
    <h2>Your choices</h2><p>After a new signup, the confirmation includes a private removal link. Keep that link to delete your signup at any time. Every future launch email will also need to include a way to unsubscribe. Launch emails are not sent automatically by the signup form.</p>
    <h2>How long we keep it</h2><p>We keep your signup for the launch-update purpose until those updates are finished or you remove it. We will ask separately before using your information for a different ongoing mailing list.</p>
    {contact.email && <><h2>Contact</h2><p>For questions about your information, email <a href={`mailto:${contact.email}`}>{contact.email}</a>.</p></>}
    <p className="mt-10"><Link href="/">← Back to Chulimaar</Link></p>
  </article>;
}
